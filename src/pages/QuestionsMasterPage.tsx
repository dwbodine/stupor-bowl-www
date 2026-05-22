import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { makeGqlClient } from '../lib/gqlClient';
import { getSdk } from '../generated/graphql';

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

export function QuestionsMasterPage() {
  const sdk = useMemo(() => getSdk(makeGqlClient()), []);

  const [answers, setAnswers] = useState<AnswerState>({});

  const questionsQuery = useQuery({
    queryKey: ['questionsWithOptions'],
    queryFn: async () => {
      const res = await sdk.GetQuestions();
      return res.questionsWithOptions ?? [];
    },
  });

  return (
    <div className="stupor-bowl-card">
      <h1>Questions</h1>

      {questionsQuery.isLoading && <p>Loading questions…</p>}
      {questionsQuery.isError && (
        <p>Could not load questions: {(questionsQuery.error as Error).message}</p>
      )}

      {questionsQuery.data && (
        <div style={{ display: 'grid', gap: 18, width: '100%' }}>
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
                style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, width: '100%' }}
              >
                <div style={{ marginBottom: 6, fontWeight: 700 }}>{prompt}</div>
                <div style={{ marginBottom: 10, opacity: 0.75 }}>
                  {points ? `${points} pts` : null}
                </div>

                {/* Boolean options — uses opt.value which should map to an Int */}
                {hasBoolean && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <ul>
                      {booleanOptions.map((opt, i) => {
                        const optVal = opt?.value;
                        if (optVal === null || optVal === undefined) return null;

                        const labelStr = String(opt?.label ?? optVal);

                        return <li key={i}>{labelStr}</li>;
                      })}
                    </ul>
                  </div>
                )}

                {/* Multiple choices — submit choice.id */}
                {hasMultipleChoice && (
                  <ul>
                    {[...multipleChoices]
                      .slice()
                      .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                      .map((c) => {
                        const id = c?.id;
                        if (id === null || id === undefined) return null;
                        const choiceStr = String(c?.choice ?? id);
                        return <li key={String(id)}>{choiceStr}</li>;
                      })}
                  </ul>
                )}

                {/* Teams — submit team.id */}
                {hasTeams && (
                  <ul>
                    {teams.map((t) => {
                      const id = t?.id;
                      if (id === null || id === undefined) return null;
                      const nameStr = String(t?.name ?? id);
                      return <li key={String(id)}>{nameStr}</li>;
                    })}
                  </ul>
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
        </div>
      )}
    </div>
  );
}
