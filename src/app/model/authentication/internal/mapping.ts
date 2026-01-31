import {
  AccountResponse, AnalyticsResponse,
  ConversationResponse,
  LLMConfigurationResponse,
  MessageResponse
} from '../../network/dtos/response';
import {QuotaConfig as QuotaConfigResponse, TargetLanguage as TargetLanguageResponse} from '../../network/dtos/dtos'
import {
  Account,
  Analytics,
  Conversation,
  LLMConfig,
  Message,
  QuotaConfig,
  TargetLanguage
} from '../../domain/domain_models';

/**
 * Convert an account response and other data to an account domain model.
 * @param response The account response
 */
export const createAccount = (response: AccountResponse): Account => ({
   id: response.id,
  username: response.username,
  email: response.email,
  isAdmin: response.is_admin,
  isVerified: response.is_verified,
  authenticatedViaGoogle: response.auth_via_google,
  createdAt: response.created_at
})

/**
 * Convert a llm config response to a domain model
 * @param response The response
 */
export const createLlmConfig = (response: LLMConfigurationResponse): LLMConfig => ({
  id: response.id,
  name: response.name,
  hasApiKey: response.api_key_set,
  url: response.api_url
})

/**
 * Maps a target language string to the enum type.
 */
export const createTargetLanguage = (response: TargetLanguageResponse): TargetLanguage => {
  switch (response) {
    case "java":
      return TargetLanguage.JAVA
    case "python":
      return TargetLanguage.PYTHON
    case "spice_netlist":
      return TargetLanguage.SPICE
  }
}

/**
 * Maps a llm-config response to a domain model.
 * @param response The response.
 */
export const createLlmResponse = (response: LLMConfigurationResponse): LLMConfig => ({
  id: response.id,
  hasApiKey: response.api_key_set,
  url: response.api_url,
  name: response.name
})

/**
 * Maps a message response to a domain model.
 * @param response The response.
 */
export const createMessage = (response: MessageResponse): Message => ({
  id: response.id,
  createdAt: response.created_at,
  prompt: response.message,
  response: response.response,
  secondaryResponse: response.response_secondary ?? null,
  generationMillis: response.generation_millis
})

/**
 * Maps a conversation response to a domain model.
 * @param response The response
 * @param llmConfigs All llm configs available to the user
 */
export const createConversation = (response: ConversationResponse, llmConfigs: LLMConfig[]): Conversation => ({
  id: response.id,
  name: response.name,
  targetLanguage: createTargetLanguage(response.target_language),
  pinned: !!response.pinned,
  createdAt: response.created_at,
  llmConfig: llmConfigs.find(config => config.id == response.llm_model_config_id)!,
  messages: response.messages.map(createMessage)
})

/**
 * Maps a quota-config response to a domain model.
 */
export const createQuotaConfig = (response: QuotaConfigResponse): QuotaConfig => response

/**
 * Maps an analytics response to a domain model.
 */
export const createAnalytics = (response: AnalyticsResponse): Analytics => ({
  today: response.requests_today,
  thisMonth: response.requests_this_month
})
