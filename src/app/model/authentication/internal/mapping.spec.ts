import {describe} from 'vitest';
import {Account} from '../../domain/domain_models';
import {createAccount} from './mapping';
import {AccountResponse} from '../../network/dtos/response';

describe("mapping.ts", () => {
  it("createAccount/createLlmConfig work", () => {
    const account: AccountResponse = {
      id: "id",
      username: "username-34",
      email: "email-88",
      is_admin: false,
      is_verified: true,
      auth_via_google: false,
      created_at: "timestamp-4",
      llm_configurations: [
        {
          id: "id-4",
          name: "name-55",
          api_url: "url-88",
          api_key_set: false
        },
        {
          id: "id-9",
          name: "name-3",
          api_url: "url-85",
          api_key_set: true
        }
      ]
    }

    const mapped = createAccount(account)
    expect(mapped.username).equals("username-34")
    expect(mapped.createdAt).equals("timestamp-4")
    expect(mapped.llmConfigurations[0].url).equals("url-88")
    expect(mapped.llmConfigurations[1].id).equals("id-9")
  })
})
