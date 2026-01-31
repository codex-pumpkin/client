import {TargetLanguage} from './dtos';

/**
 * DTO for the message response.
 */
export type MessageResponse = {
  id: string
  message: string
  generation_millis: number
  response: string
  response_secondary?: string
  created_at: string
}

/**
 * DTO for a conversation response.
 */
export type ConversationResponse = {
  id: string
  name: string
  pinned?: boolean
  llm_model_config_id: string
  target_language: TargetLanguage
  created_at: string
  messages: MessageResponse[]
}

/**
 * DTO for an analytics response.
 */
export type AnalyticsResponse = {
  requests_today: number
  requests_this_month: number
}

/**
 * DTO for a LLM-Configuration response.
 */
export type LLMConfigurationResponse = {
  id: string
  name: string
  api_url: string
  api_key_set: boolean
}

/**
 * DTO for an account response.
 */
export type AccountResponse = {
  id: string
  email: string
  username: string
  is_admin: boolean
  is_verified: boolean
  auth_via_google: boolean
  created_at: string
}

/**
 * DTO for a response that contains an access- and a refresh-token.
 */
export type TokenResponse = {
  access_token: string
  refresh_token: string
}
