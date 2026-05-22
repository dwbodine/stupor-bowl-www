import type { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type AnswerInput = {
  questionId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type AnswerItemInput = {
  questionId: Scalars['Int']['input'];
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type AnswerType = {
  __typename?: 'AnswerType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  question: QuestionTypeGql;
  updatedAt: Scalars['DateTime']['output'];
  user: UsersType;
  value?: Maybe<Scalars['Int']['output']>;
};

export type BooleanOptionType = {
  __typename?: 'BooleanOptionType';
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type LeaderboardRowGql = {
  __typename?: 'LeaderboardRowGQL';
  answeredCount: Scalars['Int']['output'];
  correctCount: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  user: UserGql;
};

export type MultipleChoiceInput = {
  choice: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};

export type MultipleChoiceType = {
  __typename?: 'MultipleChoiceType';
  choice: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  question: QuestionTypeGql;
};

export type Mutation = {
  __typename?: 'Mutation';
  createMultipleChoice: MultipleChoiceType;
  createQuestion: QuestionTypeGql;
  createUser: UsersType;
  deleteAnswer: Scalars['Boolean']['output'];
  deleteMultipleChoice: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  registerUser: UsersType;
  submitAnswer: AnswerType;
  submitAnswers: Array<AnswerType>;
  updateMultipleChoice: MultipleChoiceType;
  updateQuestion: QuestionTypeGql;
  updateUser: UsersType;
  upsertAnswer: AnswerType;
};


export type MutationCreateMultipleChoiceArgs = {
  data: MultipleChoiceInput;
  multipleChoiceId: Scalars['Int']['input'];
};


export type MutationCreateQuestionArgs = {
  data: QuestionInput;
  questionId: Scalars['Int']['input'];
};


export type MutationCreateUserArgs = {
  data: UserInput;
};


export type MutationDeleteAnswerArgs = {
  questionId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};


export type MutationDeleteMultipleChoiceArgs = {
  choiceId: Scalars['Int']['input'];
};


export type MutationDeleteQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationRegisterUserArgs = {
  data: UserInput;
};


export type MutationSubmitAnswerArgs = {
  data: AnswerInput;
};


export type MutationSubmitAnswersArgs = {
  answers: Array<AnswerItemInput>;
  userId: Scalars['Int']['input'];
};


export type MutationUpdateMultipleChoiceArgs = {
  choice?: InputMaybe<Scalars['String']['input']>;
  choiceId: Scalars['Int']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateQuestionArgs = {
  data: QuestionInput;
  questionId: Scalars['Int']['input'];
};


export type MutationUpdateUserArgs = {
  data: UserInput;
  userId: Scalars['Int']['input'];
};


export type MutationUpsertAnswerArgs = {
  data: AnswerInput;
};

export type Query = {
  __typename?: 'Query';
  answers: Array<AnswerType>;
  answersForIdentity: Array<AnswerType>;
  answersForUser: Array<AnswerType>;
  choicesForQuestion: Array<MultipleChoiceType>;
  leaderboard: Array<LeaderboardRowGql>;
  multipleChoices: Array<MultipleChoiceType>;
  question?: Maybe<QuestionTypeGql>;
  questionTypes: Array<QuestionTypeType>;
  questions: Array<QuestionTypeGql>;
  questionsWithOptions: Array<QuestionWithOptionsType>;
  registrationOpen: Scalars['Boolean']['output'];
  resultsPublished: Scalars['Boolean']['output'];
  teams: Array<TeamType>;
  user?: Maybe<UsersType>;
  users: Array<UsersType>;
};


export type QueryAnswersForIdentityArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
};


export type QueryAnswersForUserArgs = {
  userId: Scalars['Int']['input'];
};


export type QueryChoicesForQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  userId: Scalars['Int']['input'];
};

export type QuestionInput = {
  actualAnswer?: InputMaybe<Scalars['Int']['input']>;
  defaultAnswer?: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  question: Scalars['String']['input'];
  typeId: Scalars['Int']['input'];
};

export type QuestionTypeGql = {
  __typename?: 'QuestionTypeGQL';
  actualAnswer?: Maybe<Scalars['Int']['output']>;
  defaultAnswer: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  points?: Maybe<Scalars['Int']['output']>;
  question: Scalars['String']['output'];
  type: QuestionTypeType;
};

export type QuestionTypeType = {
  __typename?: 'QuestionTypeType';
  id: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type QuestionWithOptionsType = {
  __typename?: 'QuestionWithOptionsType';
  booleanOptions: Array<BooleanOptionType>;
  multipleChoices: Array<MultipleChoiceType>;
  question: QuestionTypeGql;
  teams: Array<TeamType>;
};

export type TeamType = {
  __typename?: 'TeamType';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type UserGql = {
  __typename?: 'UserGQL';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lastName: Scalars['String']['output'];
};

export type UserInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
};

export type UsersType = {
  __typename?: 'UsersType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GetQuestionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuestionsQuery = { __typename?: 'Query', questionsWithOptions: Array<{ __typename?: 'QuestionWithOptionsType', question: { __typename?: 'QuestionTypeGQL', id: number, question: string, points?: number | null, actualAnswer?: number | null, notes?: string | null, type: { __typename?: 'QuestionTypeType', id: number, type: string } }, multipleChoices: Array<{ __typename?: 'MultipleChoiceType', id: string, order: number, choice: string }>, teams: Array<{ __typename?: 'TeamType', id: number, name: string }>, booleanOptions: Array<{ __typename?: 'BooleanOptionType', value: number, label: string }> }> };

export type AnswersForUserQueryVariables = Exact<{
  userId: Scalars['Int']['input'];
}>;


export type AnswersForUserQuery = { __typename?: 'Query', answersForUser: Array<{ __typename?: 'AnswerType', id: string, value?: number | null, question: { __typename?: 'QuestionTypeGQL', id: number, question: string, points?: number | null, actualAnswer?: number | null, notes?: string | null, type: { __typename?: 'QuestionTypeType', id: number, type: string } }, user: { __typename?: 'UsersType', id: string, firstName: string, lastName: string } }> };

export type GetAppSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAppSettingsQuery = { __typename?: 'Query', registrationOpen: boolean, resultsPublished: boolean };

export type GetLeaderboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLeaderboardQuery = { __typename?: 'Query', leaderboard: Array<{ __typename?: 'LeaderboardRowGQL', score: number, correctCount: number, answeredCount: number, user: { __typename?: 'UserGQL', id: number, firstName: string, lastName: string, email: string } }> };

export type AnswersForIdentityQueryVariables = Exact<{
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type AnswersForIdentityQuery = { __typename?: 'Query', answersForIdentity: Array<{ __typename?: 'AnswerType', id: string, value?: number | null, question: { __typename?: 'QuestionTypeGQL', id: number, question: string, points?: number | null, type: { __typename?: 'QuestionTypeType', id: number, type: string } }, user: { __typename?: 'UsersType', id: string, firstName: string, lastName: string, email: string } }> };

export type RegisterUserMutationVariables = Exact<{
  inpCreateUserut: UserInput;
}>;


export type RegisterUserMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'UsersType', id: string, firstName: string, lastName: string, email: string } };

export type SubmitAnswersMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  answers: Array<AnswerItemInput> | AnswerItemInput;
}>;


export type SubmitAnswersMutation = { __typename?: 'Mutation', submitAnswers: Array<{ __typename?: 'AnswerType', id: string, value?: number | null, question: { __typename?: 'QuestionTypeGQL', id: number, question: string } }> };


export const GetQuestionsDocument = gql`
    query GetQuestions {
  questionsWithOptions {
    question {
      id
      question
      points
      actualAnswer
      notes
      type {
        id
        type
      }
    }
    multipleChoices {
      id
      order
      choice
    }
    teams {
      id
      name
    }
    booleanOptions {
      value
      label
    }
  }
}
    `;
export const AnswersForUserDocument = gql`
    query AnswersForUser($userId: Int!) {
  answersForUser(userId: $userId) {
    id
    value
    question {
      id
      question
      points
      actualAnswer
      notes
      type {
        id
        type
      }
    }
    user {
      id
      firstName
      lastName
    }
  }
}
    `;
export const GetAppSettingsDocument = gql`
    query GetAppSettings {
  registrationOpen
  resultsPublished
}
    `;
export const GetLeaderboardDocument = gql`
    query GetLeaderboard {
  leaderboard {
    user {
      id
      firstName
      lastName
      email
    }
    score
    correctCount
    answeredCount
  }
}
    `;
export const AnswersForIdentityDocument = gql`
    query AnswersForIdentity($firstName: String!, $lastName: String!, $email: String!) {
  answersForIdentity(firstName: $firstName, lastName: $lastName, email: $email) {
    id
    value
    question {
      id
      question
      points
      type {
        id
        type
      }
    }
    user {
      id
      firstName
      lastName
      email
    }
  }
}
    `;
export const RegisterUserDocument = gql`
    mutation RegisterUser($inpCreateUserut: UserInput!) {
  registerUser(data: $inpCreateUserut) {
    id
    firstName
    lastName
    email
  }
}
    `;
export const SubmitAnswersDocument = gql`
    mutation SubmitAnswers($userId: Int!, $answers: [AnswerItemInput!]!) {
  submitAnswers(userId: $userId, answers: $answers) {
    id
    question {
      id
      question
    }
    value
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetQuestions(variables?: GetQuestionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetQuestionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetQuestionsQuery>({ document: GetQuestionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetQuestions', 'query', variables);
    },
    AnswersForUser(variables: AnswersForUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AnswersForUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AnswersForUserQuery>({ document: AnswersForUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AnswersForUser', 'query', variables);
    },
    GetAppSettings(variables?: GetAppSettingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAppSettingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAppSettingsQuery>({ document: GetAppSettingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAppSettings', 'query', variables);
    },
    GetLeaderboard(variables?: GetLeaderboardQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLeaderboardQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLeaderboardQuery>({ document: GetLeaderboardDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLeaderboard', 'query', variables);
    },
    AnswersForIdentity(variables: AnswersForIdentityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AnswersForIdentityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AnswersForIdentityQuery>({ document: AnswersForIdentityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AnswersForIdentity', 'query', variables);
    },
    RegisterUser(variables: RegisterUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RegisterUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterUserMutation>({ document: RegisterUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RegisterUser', 'mutation', variables);
    },
    SubmitAnswers(variables: SubmitAnswersMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SubmitAnswersMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubmitAnswersMutation>({ document: SubmitAnswersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SubmitAnswers', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;