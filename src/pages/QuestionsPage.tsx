import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { makeGqlClient } from '../lib/gqlClient';
import { getSdk, type AnswerItemInput } from '../generated/graphql';
import { clearStoredUserId, getStoredUserId } from '../lib/utils';

type AnswerState = Record<number, number | undefined>;

function toIntOrUndef(value: string): number | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  // GraphQL Int should be a 32-bit signed integer; enforce integer-ness at least
  if (!Number.isInteger(n)) return undefined;
  return n;
}

export function QuestionsPage() {
  const nav = useNavigate();
  const sdk = useMemo(() => getSdk(makeGqlClient()), []);
  const userId = getStoredUserId();

  const [answers, setAnswers] = useState<AnswerState>({});
  const [error, setError] = useState<string | null>(null);

  const questionsQuery = useQuery({
    queryKey: ['questionsWithOptions'],
    queryFn: async () => {
      const res = await sdk.GetQuestions();
      return res.questionsWithOptions ?? [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      setError(null);

      if (!userId) throw new Error('Missing user. Please register again.');
      const items = questionsQuery.data;
      if (!items || items.length === 0) throw new Error('Questions not loaded.');

      const payload: AnswerItemInput[] = items.map((item) => {
        const q = item.question;
        const qid = Number(q?.id);

        if (!Number.isFinite(qid) || !Number.isInteger(qid)) {
          throw new Error('Invalid question id.');
        }

        const v = answers[qid];
        if (v === undefined || v === null) {
          const label = q?.question ? `"${q.question}"` : `Question ${qid}`;
          throw new Error(`Please answer all questions before submitting. Missing: ${label}`);
        }

        return { questionId: qid, value: v };
      });

      await sdk.SubmitAnswers({ userId, answers: payload });
    },
    onSuccess: () => nav('/thanks'),
    onError: (e) => setError(e instanceof Error ? e.message : 'Something went wrong.'),
  });

  if (!userId) {
    return (
      <div>
        <h1>Missing player</h1>
        <p>Your session is missing. Please start again.</p>
        <button onClick={() => nav('/register')} style={{ padding: 12, cursor: 'pointer' }}>
          Go to registration
        </button>
      </div>
    );
  }

  return (
    <div className="stupor-bowl-card">
      <h1>Questions</h1>

      {questionsQuery.isLoading && <p>Loading questions…</p>}
      {questionsQuery.isError && (
        <p>Could not load questions: {(questionsQuery.error as Error).message}</p>
      )}

      {questionsQuery.data && (
        <div style={{ display: 'grid', gap: 18 }}>
          {questionsQuery.data.map((item, idx) => {
            const q = item.question;
            const qid = Number(q?.id);
            if (!Number.isFinite(qid) || !Number.isInteger(qid)) return null;

            const prompt = q?.question ?? `Question ${idx + 1}`;
            const points = q?.points ?? null;

            const booleanOptions = item.booleanOptions ?? [];
            const multipleChoices = item.multipleChoices ?? [];
            const teams = item.teams ?? [];

            const hasBoolean = booleanOptions.length > 0;
            const hasMultipleChoice = multipleChoices.length > 0;
            const hasTeams = teams.length > 0;

            return (
              <div
                key={String(qid)}
                style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%' }}
              >
                <div style={{ marginBottom: 6, fontWeight: 700 }}>{prompt}</div>
                <div style={{ marginBottom: 10, opacity: 0.75 }}>
                  {points ? `${points} pts` : null}
                </div>

                {/* Boolean options — uses opt.value which should map to an Int */}
                {hasBoolean && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {booleanOptions.map((opt, i) => {
                      const optVal = opt?.value;
                      if (optVal === null || optVal === undefined) return null;

                      const labelStr = String(opt?.label ?? optVal);
                      const selected = answers[qid] === optVal;

                      const border = selected ? (i == 0 ? '1px solid red' : '1px solid green') : '1px solid #ccc';
                      const background = selected ? (i == 0 ? 'red' : 'green') : 'buttonface';
                      const color = selected ? 'white' : 'black';

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAnswers((p) => ({ ...p, [qid]: optVal }))}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            border: border,
                            borderRadius: 8,
                            fontWeight: selected ? 800 : 500,
                            backgroundColor: background,
                            color: color
                          }}
                        >
                          {labelStr}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multiple choices — submit choice.id */}
                {hasMultipleChoice && (
                  <select
                    value={answers[qid] !== undefined ? String(answers[qid]) : ''}
                    onChange={(e) => {
                      const n = toIntOrUndef(e.target.value);
                      setAnswers((p) => ({ ...p, [qid]: n }));
                    }}
                    style={{ width: '100%', padding: 10 }}
                  >
                    <option value="">Select…</option>
                    {[...multipleChoices]
                      .slice()
                      .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                      .map((c) => {
                        const id = c?.id;
                        if (id === null || id === undefined) return null;
                        const choiceStr = String(c?.choice ?? id);
                        return (
                          <option key={String(id)} value={String(id)}>
                            {choiceStr}
                          </option>
                        );
                      })}
                  </select>
                )}

                {/* Teams — submit team.id */}
                {hasTeams && (
                  <select
                    value={answers[qid] !== undefined ? String(answers[qid]) : ''}
                    onChange={(e) => {
                      const n = toIntOrUndef(e.target.value);
                      setAnswers((p) => ({ ...p, [qid]: n }));
                    }}
                    style={{ width: '100%', padding: 10 }}
                  >
                    <option value="">Select…</option>
                    {teams.map((t) => {
                      const id = t?.id;
                      if (id === null || id === undefined) return null;
                      const nameStr = String(t?.name ?? id);
                      return (
                        <option key={String(id)} value={String(id)}>
                          {nameStr}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* Fallback — numeric input since AnswerItemInput.value is Int */}
                {!hasBoolean && !hasMultipleChoice && !hasTeams && (
                  <input
                    type="number"
                    inputMode="numeric"
                    value={answers[qid] !== undefined ? String(answers[qid]) : ''}
                    onChange={(e) => {
                      const n = toIntOrUndef(e.target.value);
                      setAnswers((p) => ({ ...p, [qid]: n }));
                    }}
                    style={{ width: '100%', padding: 10 }}
                    placeholder="Enter a number…"
                  />
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || questionsQuery.isLoading}
            style={{ padding: 12, cursor: 'pointer' }}
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit Answers'}
          </button>

          <button
            type="button"
            onClick={() => {
              clearStoredUserId();
              nav('/register');
            }}
            style={{ padding: 10, cursor: 'pointer' }}
          >
            Start over
          </button>

          {error && (
            <div style={{ padding: 12, background: '#ffe9e9', border: '1px solid #ffb3b3' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
