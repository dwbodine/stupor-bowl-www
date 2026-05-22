/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { makeGqlClient } from '../lib/gqlClient';
import { getSdk } from '../generated/graphql';
import { useParams } from 'react-router-dom';

type MC = { id: any; order?: any; choice?: string | null };

function normalizeMultipleChoiceToOrder(
  raw: number | null | undefined,
  multipleChoices?: MC[] | null,
): number | null {
  if (raw == null) return null;

  const v = Number(raw);
  if (!Number.isFinite(v)) return null;

  // If it's already an order (1..N usually), keep it
  const byOrder = multipleChoices?.find((c) => Number(c.order) === v);
  if (byOrder) return Number(byOrder.order);

  // If it's an id, convert to order
  const byId = multipleChoices?.find((c) => Number(c.id) === v);
  if (byId && byId.order != null) return Number(byId.order);

  return v; // fallback (at least stable)
}

function multipleChoiceLabelFromOrder(order: number | null, multipleChoices?: MC[] | null): string {
  if (order == null) return '—';
  const hit = multipleChoices?.find((c) => Number(c.order) === Number(order));
  return hit?.choice ?? String(order);
}

function formatName(first?: string | null, last?: string | null) {
  const f = (first ?? '').trim();
  const l = (last?.slice(0, 1) ?? '').trim();
  const full = `${f} ${l}.`.trim();
  return full || 'Unknown';
}

function resolveAnswerLabel(args: {
  questionType?: string | null;
  value: number | null | undefined;
  multipleChoices?: Array<{ id: any; choice?: string | null }> | null;
  teams?: Array<{ id: any; name?: string | null }> | null;
  booleanOptions?: Array<{ value?: any; label?: string | null }> | null;
}): string {
  const { questionType, value, multipleChoices, teams, booleanOptions } = args;
  if (value == null) return '—';

  const t = (questionType ?? '').toLowerCase();

  if (t.includes('team')) {
    const hit = teams?.find((x) => Number(x.id) === Number(value));
    return hit?.name ?? String(value);
  }

  if (t.includes('multiple')) {
    const ord = normalizeMultipleChoiceToOrder(value, multipleChoices ?? null);
    return multipleChoiceLabelFromOrder(ord, multipleChoices ?? null);
  }

  if (t.includes('bool')) {
    const hit = booleanOptions?.find((x) => Number(x.value) === Number(value));
    return hit?.label ?? (Number(value) === 1 ? 'Yes' : 'No');
  }

  return String(value);
}

export function HowDidIDoPage() {
  const sdk = useMemo(() => getSdk(makeGqlClient()), []);

  const { userId } = useParams<{ userId: string }>();

  const answersQuery = useQuery({
    queryKey: ['answersForUser', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await sdk.AnswersForUser({ userId: Number(userId) });
      return res.answersForUser ?? [];
    },
    staleTime: 10_000,
  });

  const questionsQuery = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const res = await sdk.GetQuestions();
      return res.questionsWithOptions ?? [];
    },
    staleTime: 10_000,
  });

  if (answersQuery.isLoading || questionsQuery.isLoading)
    return <p style={{ marginTop: 16 }}>Loading…</p>;

  if (answersQuery.isError) {
    return (
      <div style={errBox}>Could not load answers: {(answersQuery.error as Error).message}</div>
    );
  }

  if (questionsQuery.isError) {
    return (
      <div style={errBox}>Could not load questions: {(questionsQuery.error as Error).message}</div>
    );
  }

  const answers = answersQuery.data ?? [];
  const qwo = questionsQuery.data ?? [];

  const user = answers[0]?.user;

  const answerByQid = new Map<number, number>();
  for (const a of answers) {
    const qid = Number(a.question?.id ?? 0);
    if (!qid) continue;
    answerByQid.set(qid, Number(a.value ?? 0));
  }

  const qById = new Map<number, (typeof qwo)[number]>();
  for (const item of qwo) {
    const qid = Number(item.question?.id ?? 0);
    if (!qid) continue;
    qById.set(qid, item);
  }

  // Render in question order
  const ordered = [...qwo].sort(
    (a, b) => Number(a.question?.id ?? 0) - Number(b.question?.id ?? 0),
  );

  let totalPoints = 0;
  let correctCount = 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>Results for {formatName(user?.firstName, user?.lastName)}</h1>
          <div style={{ marginTop: 6, display: 'flex', gap: 14, opacity: 0.85 }}></div>
        </div>
        <Link to="/results" style={{ textDecoration: 'underline' }}>
          ← Back to results
        </Link>
      </div>

      <div style={{ marginTop: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Q</th>
              <th style={th}>Question</th>
              <th style={th}>Your Answer</th>
              <th style={th}>Actual</th>
              <th style={th}>Correct?</th>
              <th style={th}>Points</th>
              <th style={th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((item) => {
              const q = item.question;
              const qid = Number(q?.id ?? 0);
              const qtype = q?.type?.type ?? null;

              const yourRaw = answerByQid.get(qid);
              const actualRaw = (q as any)?.actualAnswer ?? null; // typed once codegen knows it
              const notes = (q as any)?.notes ?? '';

              const yourLabel = resolveAnswerLabel({
                questionType: qtype,
                value: yourRaw,
                multipleChoices: item.multipleChoices ?? null,
                teams: item.teams ?? null,
                booleanOptions: item.booleanOptions ?? null,
              });

              const actualLabel = resolveAnswerLabel({
                questionType: qtype,
                value: actualRaw,
                multipleChoices: item.multipleChoices ?? null,
                teams: item.teams ?? null,
                booleanOptions: item.booleanOptions ?? null,
              });

              const isCorrect =
                actualRaw != null && yourRaw != null && Number(yourRaw) === Number(actualRaw);

              const points = q?.points != null ? Number(q.points) : 0;

              if (isCorrect) {
                // eslint-disable-next-line react-hooks/immutability
                correctCount += 1;
                totalPoints += points;
              }

              return (
                <tr key={qid}>
                  <td style={td}>{qid}</td>
                  <td style={{ ...td, whiteSpace: 'normal', minWidth: 320 }}>
                    <div style={{ fontWeight: 700 }}>{q?.question ?? ''}</div>
                  </td>
                  <td style={td}>{yourLabel}</td>
                  <td style={td}>
                    {actualRaw == null ? <span style={{ opacity: 0.6 }}>—</span> : actualLabel}
                  </td>
                  <td style={td}>
                    {actualRaw == null ? (
                      <span style={{ opacity: 0.6 }}>—</span>
                    ) : isCorrect ? (
                      <span style={{ fontWeight: 700 }}>✅</span>
                    ) : (
                      <span style={{ fontWeight: 700 }}>❌</span>
                    )}
                  </td>
                  <td style={td}>{`${points} pts`}</td>
                  <td style={{ ...td, whiteSpace: 'normal', minWidth: 260 }}>
                    {String(notes ?? '').trim() ? notes : <span style={{ opacity: 0.6 }}>—</span>}
                  </td>
                </tr>
              );
            })}
            <tr>
                <td style={td} colSpan={4}></td>
                <td style={td}>{correctCount}</td>
                <td style={td}>{totalPoints} pts</td>
            </tr>
          </tbody>
        </table>
      </div>

      {answers.length === 0 && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
          No answers found for that identity.
        </div>
      )}
    </div>
  );
}

const errBox: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#ffe9e9',
  border: '1px solid #ffb3b3',
  borderRadius: 10,
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 8px',
  borderBottom: '2px solid #ddd',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
};
