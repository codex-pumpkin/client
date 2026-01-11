import {TargetLanguage} from './dtos';

/**
 * DTO for submitting user credentials when logging in.
 */
export type LoginRequest = {
  email?: string
  username?: string
  password: string
}

/**
 * DTO for submitting account data when signing up.
 */
export type SignupRequest = {
  email: string
  username: string
  password: string
}

/**
 * DTO for submitting a refresh token when refreshing.
 */
export type RefreshRequest = {
  refresh_token: string
}

/**
 * DTO for requesting a password-reset email.
 */
export type PasswordResetRequestRequest = {
  email: string
}

/**
 * DTO for submitting a password-reset token.
 */
export type PasswordResetSubmitRequest = {
  reset_token: string
  new_password: string
}

/**
 * DTO for submitting an email-verification token.
 */
export type EmailVerificationSubmitRequest = {
  verification_token: string
}

/**
 * DTO for updating account data.
 */
export type UpdateAccountRequest = {
  email: string
  username: string
}

/**
 * DTO for creating or updating a LLM-Configuration.
 */
export type LLMConfigurationRequest = {
  name: string
  api_url: string
  api_key?: string
}

/**
 * DTO for creating a conversation.
 */
export type ConversationRequest = {
  message: string
  llm_model_config_id: string
  target_language: TargetLanguage
  name: string
}

/**
 * DTO for updating a conversation.
 */
export type UpdateConversationRequest = {
  name: string
  pinned: boolean
}

/**
 * DTO for creating a message.
 */
export type MessageRequest = {
  message: string
}
