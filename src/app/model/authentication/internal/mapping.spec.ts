import {describe} from 'vitest';
import {Account, LLMConfig} from '../../domain/domain_models';
import {createAccount, createLlmConfig} from './mapping';
import {AccountResponse, LLMConfigurationResponse} from '../../network/dtos/response';

describe("mapping.ts", () => {
  it("createAccount work", () => {
    const account: AccountResponse = {
      id: "id",
      username: "username-34",
      email: "email-88",
      is_admin: false,
      is_verified: true,
      auth_via_google: false,
      created_at: "timestamp-4"
    }

    const mapped = createAccount(account)
    expect(mapped.username).equals("username-34")
    expect(mapped.createdAt).equals("timestamp-4")
  })

  it("createLLMConfiguration work", () => {
    const llmConfig: LLMConfigurationResponse = {
      id: "id-4",
      name: "name-55",
      api_url: "url-88",
      api_key_set: false,
      model_name: "model-name-12"
    }

    const mapped = createLlmConfig(llmConfig)
    expect(mapped.id).equals("id-4")
    expect(mapped.name).equals("name-55")
    expect(mapped.url).equals("url-88")
  })
})
