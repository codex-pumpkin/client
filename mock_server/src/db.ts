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
  llm_configurations: LLMConfig[];
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

export const db = {
  users: [] as User[],
  conversations: [] as Conversation[],
  refreshTokens: new Map<string, string>(), // refreshToken -> userId,

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

export function now() {
  return new Date().toISOString();
}

export function fakeToken() {
  return `fake-${uuid()}`;
}
