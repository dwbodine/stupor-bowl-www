/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { Navigate, useNavigate } from 'react-router-dom';

import { makeGqlClient } from '../lib/gqlClient';
import { getSdk } from '../generated/graphql';
import { USER_STORAGE_KEY } from '../lib/const';

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
};

function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}
function normalizeName(v: string) {
  return v.trim();
}
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function normalizeQType(v: string | null | undefined) {
  return (v ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

type ChoiceMap = Map<number, Map<number, string>>; // questionId -> (choiceId -> label)
type TeamMap = Map<number, string>; // teamId -> name

function buildLookupMaps(items: any[] | undefined | null): {
  choiceMap: ChoiceMap;
  teamMap: TeamMap;
} {
  const choiceMap: ChoiceMap = new Map();
  const teamMap: TeamMap = new Map();

  if (!items) return { choiceMap, teamMap };

  for (const item of items) {
    const qid = Number(item?.question?.id);
    if (!Number.isFinite(qid) || !Number.isInteger(qid)) continue;

    // Multiple choice map for this question
    const mcs = (item?.multipleChoices ?? []) as Array<any>;
    if (mcs.length > 0) {
      const perQ = new Map<number, string>();
      const sorted = [...mcs].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
      for (const mc of sorted) {
        const id = mc?.id;
        if (id === null || id === undefined) continue;
        const cid = Number(id);
        if (!Number.isFinite(cid) || !Number.isInteger(cid)) continue;
        perQ.set(cid, String(mc?.choice ?? cid));
      }
      if (perQ.size > 0) choiceMap.set(qid, perQ);
    }

    // Teams map (global)
    const teams = (item?.teams ?? []) as Array<any>;
    for (const t of teams) {
      const id = t?.id;
      if (id === null || id === undefined) continue;
      const tid = Number(id);
      if (!Number.isFinite(tid) || !Number.isInteger(tid)) continue;
      teamMap.set(tid, String(t?.name ?? tid));
    }
  }

  return { choiceMap, teamMap };
}

function renderAnswerLabel(args: {
  questionType: string | null | undefined;
  questionId: number;
  value: number | null | undefined;
  choiceMap: ChoiceMap;
  teamMap: TeamMap;
}) {
  const { questionType, questionId, value, choiceMap, teamMap } = args;

  if (value === null || value === undefined) return '—';

  const t = normalizeQType(questionType);

  if (t === 'boolean' || t === 'bool' || t === 'truefalse' || t === 'true/false') {
    return value === 1 ? 'Yes' : 'No';
  }

  if (t === 'team' || t === 'teams') {
    return teamMap.get(value) ?? `Team #${value}`;
  }

  if (t === 'multiplechoice' || t === 'multiple choice' || t === 'mc') {
    const perQ = choiceMap.get(questionId);
    return perQ?.get(value) ?? `Choice #${value}`;
  }

  return String(value);
}

export function RegisterPage() {
  const nav = useNavigate();
  const sdk = useMemo(() => getSdk(makeGqlClient()), []);

  const [form, setForm] = useState<FormState>({ email: '', firstName: '', lastName: '' });
  const [error, setError] = useState<string | null>(null);

  // When set, triggers answers lookup + display
  const [identity, setIdentity] = useState<FormState | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const res = await sdk.GetAppSettings();
      return {
        registrationOpen: res.registrationOpen ?? true,
        resultsPublished: res.resultsPublished ?? false,
      };
    },
    staleTime: 10_000,
  });

  const registerUser = useMutation({
    mutationFn: async () => {
      setError(null);

      const email = form.email.trim();
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();

      if (!email || !firstName || !lastName) {
        throw new Error('Please complete all fields.');
      }
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const res = await sdk.RegisterUser({
        // NOTE: operation variable name is inpCreateUserut (typo preserved)
        inpCreateUserut: { email, firstName, lastName },
      });

      const user = res.registerUser;
      if (!user?.id) throw new Error('User registration failed (missing id).');

      localStorage.setItem(USER_STORAGE_KEY, String(user.id));
      return user.id;
    },
    onSuccess: () => nav('/play'),
    onError: (e) => {
      if (e instanceof ClientError) {
        const msg = e.response.errors?.[0]?.message;
        if (msg === 'Registration is closed.') {
          nav('/registration-closed', { replace: true });
          return;
        }
        const gqlErrors = e.response.errors;

        if (gqlErrors && gqlErrors.length > 0) {
          setError(`Error: ${gqlErrors[0].message}`);
          return;
        }

        setError('Request failed.');
        return;
      }

      if (e instanceof Error) {
        setError(e.message);
        return;
      }

      setError('Something went wrong.');
    },
  });

  // Fetch questions/options once so we can map IDs -> labels (only needed if showing answers)
  const questionsQuery = useQuery({
    queryKey: ['questionsWithOptions'],
    enabled: !!identity,
    queryFn: async () => {
      const res = await sdk.GetQuestions();
      return res.questionsWithOptions ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { choiceMap, teamMap } = useMemo(() => {
    return buildLookupMaps(questionsQuery.data);
  }, [questionsQuery.data]);

  const answersQuery = useQuery({
    queryKey: identity
      ? ['answersForIdentity', identity.firstName, identity.lastName, identity.email]
      : ['answersForIdentity', 'idle'],
    enabled: !!identity,
    retry: false,
    queryFn: async () => {
      if (!identity) return [];
      const firstName = normalizeName(identity.firstName);
      const lastName = normalizeName(identity.lastName);
      const email = normalizeEmail(identity.email);

      const res = await sdk.AnswersForIdentity({ firstName, lastName, email });
      return res.answersForIdentity ?? [];
    },
  });

  function runLookupFromCurrentForm() {
    setError(null);

    const firstName = normalizeName(form.firstName);
    const lastName = normalizeName(form.lastName);
    const email = normalizeEmail(form.email);

    if (!firstName || !lastName || !email) {
      setError('Please fill out First Name, Last Name, and Email.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Set identity snapshot from current form values
    setIdentity({ firstName, lastName, email });
  }

  // If they edit the form after looking up, the displayed results might not match.
  // Easiest fix: clear identity on any change (so they must re-click "See My Answers").
  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    if (identity) setIdentity(null);
  }

  if (settingsQuery.isLoading) return <p>Loading…</p>;

  if (settingsQuery.data) {
    if (settingsQuery.data.resultsPublished === true) return <Navigate to="/results" replace />;
    if (settingsQuery.data.registrationOpen !== true)
      return <Navigate to="/registration-closed" replace />;
  }

  const answers = (answersQuery.data ?? []) as any[];

  return (
    <div className="stupor-bowl-card">
      <p style={{ textAlign: 'center' }}>
        <h1>Stupor Bowl LX (2026)</h1>
        Let's not take Super Bowl Sunday too seriously.<sup style={{ fontSize: '0.25em' }}>TM</sup>
      </p>

      {/* One shared form */}
      <div style={{ display: 'grid', gap: 12, width: '100%' }} className='no-print'>
        <label>
          Email<br />
          <input
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            type="email"
            style={{ width: '95%', padding: 10 }}
            placeholder="you@email.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label>
          First name<br />
          <input
            value={form.firstName}
            onChange={(e) => updateForm('firstName', e.target.value)}
            style={{ width: '95%', padding: 10 }}
            placeholder="First Name"
            autoComplete="given-name"
          />
        </label>

        <label>
          Last name<br />
          <input
            value={form.lastName}
            onChange={(e) => updateForm('lastName', e.target.value)}
            style={{ width: '95%', padding: 10 }}
            placeholder="Last Name"
            autoComplete="family-name"
          />
        </label>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => registerUser.mutate()}
            disabled={registerUser.isPending}
            style={{ padding: 12, cursor: 'pointer' }}
          >
            {registerUser.isPending ? 'Creating...' : 'Start'}
          </button>

          <button onClick={runLookupFromCurrentForm} style={{ padding: 12, cursor: 'pointer' }}>
            See My Answers
          </button>

          {identity && (
            <button
              type="button"
              onClick={() => window.print()}
              style={{ padding: 12, cursor: 'pointer' }}
            >
              Print
            </button>
          )}
        </div>

        {error && (
          <div style={{ padding: 12, background: '#ffe9e9', border: '1px solid #ffb3b3' }}>
            {error}
          </div>
        )}
      </div>

      {/* Answers output (same page) */}
      {identity && (
        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Your Answers</h2>

          {questionsQuery.isLoading && <p>Loading question options…</p>}
          {questionsQuery.isError && (
            <p>Could not load question options: {(questionsQuery.error as Error).message}</p>
          )}

          {answersQuery.isLoading && <p>Loading your answers…</p>}
          {answersQuery.isError && (
            <p>Could not load answers: {(answersQuery.error as Error).message}</p>
          )}

          {!answersQuery.isLoading && !answersQuery.isError && answers.length === 0 && (
            <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>No answers found</div>
              <div style={{ opacity: 0.8 }}>
                Either you haven't submitted yet, or the name/email doesn't match what was used to
                register.
              </div>
            </div>
          )}

          {answers.length > 0 && (
            <div style={{ display: 'grid', gap: 14 }}>
              {answers.map((a) => {
                const q = a.question;
                const qid = Number(q?.id);
                const prompt = q?.question ?? `Question ${String(qid)}`;
                const points = q?.points ?? null;
                const qType = q?.type?.type ?? null;

                const label = renderAnswerLabel({
                  questionType: qType,
                  questionId: Number.isFinite(qid) ? qid : -1,
                  value: a.value ?? null,
                  choiceMap,
                  teamMap,
                });

                return (
                  <div
                    key={String(a.id)}
                    style={{
                      padding: 12,
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      maxWidth: '100%',
                    }}
                  >
                    <div style={{ marginBottom: 6, fontWeight: 700 }}>
                      {Number.isFinite(qid) ? `Q${qid}: ` : ''}
                      {prompt}
                    </div>

                    <div style={{ marginBottom: 10, opacity: 0.75 }}>
                      {points ? `${points} pts` : null}
                      {qType ? ` • ${qType}` : null}
                    </div>

                    <div style={{ padding: 10, border: '1px solid #eee', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Your answer</div>
                      <div style={{ fontWeight: 800 }}>{label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
