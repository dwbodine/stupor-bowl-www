import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { makeGqlClient } from '../lib/gqlClient';
import { getSdk } from '../generated/graphql';

function formatName(first?: string | null, last?: string | null) {
  const f = (first ?? '').trim();
  const l = (last?.slice(0, 1) ?? '').trim();
  const full = `${f} ${l}.`.trim();
  return full || 'Unknown';
}

export function ResultsPage() {
  const sdk = useMemo(() => getSdk(makeGqlClient()), []);

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

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await sdk.GetLeaderboard();
      return res.leaderboard ?? [];
    },
    staleTime: 10_000,
  });

  const rows = leaderboardQuery.data ?? [];

  // Sorting (server already sorts by score/correct count/name; this lets you switch UI modes)
  const sorted = [...rows].sort((a, b) => {
    // score mode: primary score desc, then correct desc, then name asc
    const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const correctDiff = (b.correctCount ?? 0) - (a.correctCount ?? 0);
    if (correctDiff !== 0) return correctDiff;

    const an = formatName(a.user?.firstName, a.user?.lastName).toLowerCase();
    const bn = formatName(b.user?.firstName, b.user?.lastName).toLowerCase();
    return an.localeCompare(bn);
  });

  // Rank with ties (1,2,2,4 style)
  type RankedRow<T> = T & { rank: number };

  const ranked: RankedRow<(typeof sorted)[number]>[] = sorted.reduce(
    (acc, r, i) => {
      const s = r.score ?? 0;
      const c = r.correctCount ?? 0;

      const prev = acc[i - 1];
      const prevS = prev?.score ?? 0;
      const prevC = prev?.correctCount ?? 0;

      const isTie = i > 0 && s === prevS && c === prevC;
      const rank = isTie ? prev.rank : i + 1;

      return [...acc, { ...r, rank }];
    },
    [] as RankedRow<(typeof sorted)[number]>[],
  );

  const settingsData = settingsQuery.data;
  const registrationOpen =
    !settingsData || (settingsData && settingsData.registrationOpen === true);
  const resultsPublished = settingsData && settingsData.resultsPublished === true;
  const showNotFinalBanner = registrationOpen || !resultsPublished;

  return (
    <div className="stupor-bowl-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          maxWidth: '100%',
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ marginBottom: 4 }}>StuporBowl LX (2026) Results</h1>
          <div style={{ opacity: 0.75, marginBottom: '25px' }}>
            Congratulations to our winners and thanks to everyone for participating!
          </div>
        </div>
      </div>

      {showNotFinalBanner && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: '1px solid #ffd27a',
            background: '#fff6e5',
            borderRadius: 10,
          }}
        >
          <strong>Not final yet:</strong> Results have not yet been published.
        </div>
      )}

      {settingsQuery.isError && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
          Could not load app status (showing results anyway).
        </div>
      )}

      {!showNotFinalBanner && leaderboardQuery.isLoading && (
        <p style={{ marginTop: 16 }}>Loading leaderboard…</p>
      )}

      {!showNotFinalBanner && leaderboardQuery.isError && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#ffe9e9',
            border: '1px solid #ffb3b3',
            borderRadius: 10,
          }}
        >
          Could not load leaderboard: {(leaderboardQuery.error as Error).message}
        </div>
      )}

      {!showNotFinalBanner &&
        !leaderboardQuery.isLoading &&
        leaderboardQuery.isSuccess &&
        ranked.length === 0 && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
            No results yet.
          </div>
        )}

      {ranked.length > 0 && (
        <div style={{ marginTop: 16, overflowX: 'auto', maxWidth: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Rank</th>
                <th style={th}>Name</th>
                <th style={th}>Score</th>
                <th style={th}>Correct</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r) => {
                const name = formatName(r.user?.firstName, r.user?.lastName);
                const score = r.score ?? 0;
                const correct = r.correctCount ?? 0;
                const isTop3 = r.rank <= 3;

                return (
                  <tr
                    key={String(r.user?.id ?? `${name}-${r.rank}`)}
                    style={isTop3 ? topRow : undefined}
                  >
                    <td style={td}>{r.rank}</td>
                    <td style={td}>
                      {r.user?.id ? (
                        <Link
                          to={`/how-did-i-do/${r.user.id}`}
                          style={{ fontWeight: 700, textDecoration: 'underline' }}
                        >
                          {formatName(r.user.firstName, r.user.lastName)}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 700 }}>
                          {formatName(r.user?.firstName, r.user?.lastName)}
                        </span>
                      )}
                    </td>
                    <td style={td}>{score}</td>
                    <td style={td}>{correct}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
            Ties share the same rank (e.g., 2, 2, 4). Sorted by score, then correct answers, then
            name.
          </div>
        </div>
      )}
    </div>
  );
}

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

const topRow: React.CSSProperties = {
  background: 'rgba(255, 215, 0, 0.12)',
};
