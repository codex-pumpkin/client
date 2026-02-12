import { v4 as uuid } from "uuid";

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  is_admin: boolean;
  is_verified: boolean;
  auth_via_google: boolean;
  created_at: string;
}

export interface LLMConfig {
  id: string;
  name: string;
  api_url: string;
  api_key_set: boolean;
}

export interface Message {
  id: string;
  message: string;
  response: string;
  response_secondary?: string;
  generation_millis: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  name: string;
  pinned: boolean;
  llm_model_config_id: string;
  target_language: string;
  created_at: string;
  messages: Message[];
}

export interface Database {
  users: User[]
  conversations: Conversation[]
  refreshTokens: Map<string, string>,
  llmConfigs: LLMConfig[]

  passwordResetTokens: Map<string, string>,
  emailVerificationTokens: Map<string, string>,

  quota: {
    member: number,
    admin: number,
  },
  analytics: {
    requests_today: number,
    requests_this_month: number,
  },
}

export let db: Database = {
  users: [] as User[],
  conversations: [] as Conversation[],
  refreshTokens: new Map<string, string>(), // refreshToken -> userId,
  llmConfigs: [] as LLMConfig[],

  passwordResetTokens: new Map<string, string>(), // token -> userId
  emailVerificationTokens: new Map<string, string>(), // token -> userId

  quota: {
    member: 1000,
    admin: 999999,
  },
  analytics: {
    requests_today: 0,
    requests_this_month: 0,
  },
};

export function setDb(newDb: Database) {
  db = newDb
}

export function now() {
  return new Date().toISOString();
}

export function fakeToken() {
  return `fake-${uuid()}`;
}



export interface DatabaseJSON {
  users: User[]
  conversations: Conversation[]
  llmConfigs: LLMConfig[]

  refreshTokens: Record<string, string>
  passwordResetTokens: Record<string, string>
  emailVerificationTokens: Record<string, string>

  quota: {
    member: number
    admin: number
  }

  analytics: {
    requests_today: number
    requests_this_month: number
  }
}

export function serializeDatabase(db: Database): string {
  const json: DatabaseJSON = {
    users: db.users,
    conversations: db.conversations,
    llmConfigs: db.llmConfigs,

    refreshTokens: Object.fromEntries(db.refreshTokens),
    passwordResetTokens: Object.fromEntries(db.passwordResetTokens),
    emailVerificationTokens: Object.fromEntries(db.emailVerificationTokens),

    quota: db.quota,
    analytics: db.analytics,
  }

  return JSON.stringify(json, null, 2)
}

export function deserializeDatabase(jsonString: string): Database {
  const data: DatabaseJSON = JSON.parse(jsonString)

  return {
    users: data.users,
    conversations: data.conversations,
    llmConfigs: data.llmConfigs,

    refreshTokens: new Map(Object.entries(data.refreshTokens)),
    passwordResetTokens: new Map(Object.entries(data.passwordResetTokens)),
    emailVerificationTokens: new Map(Object.entries(data.emailVerificationTokens)),

    quota: data.quota,
    analytics: data.analytics,
  }
}
