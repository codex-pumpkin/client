import {AccountResponse, LLMConfigurationResponse} from '../../network/dtos/response';
import {Account, LLMConfig} from '../../domain/domain_models';

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
  createdAt: response.created_at,
  llmConfigurations: response.llm_configurations.map(createLlmConfig)
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
