import { GraphQLClient } from 'graphql-request';

export function makeGqlClient() {
  const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT as string;
  if (!endpoint) throw new Error('VITE_GRAPHQL_ENDPOINT is not set');

  return new GraphQLClient(endpoint, {
    headers: () => {
      // Add auth headers here later if needed
      return {};
    },
  });
}
