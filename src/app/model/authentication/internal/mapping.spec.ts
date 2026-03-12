import {describe} from 'vitest';
import {Account, LLMConfig, TargetLanguage} from '../../domain/domain_models';
import {createAccount, createLlmConfig, createMessage, createTargetLanguage} from './mapping';
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

  it("maps a response to a Message object", () => {
    const response = {
      id: "123",
      created_at: "2026-03-12T12:00:00Z",
      message: "Hello",
      response: "Hi",
      graph: "",
      generation_millis: 42
    };

    const result = createMessage(response);

    expect(result).toEqual({
      id: "123",
      createdAt: "2026-03-12T12:00:00Z",
      prompt: "Hello",
      response: "Hi",
      secondaryResponse: "",
      generationMillis: 42
    });
  });

  it("sets secondaryResponse to null if graph is undefined", () => {
    const response = {
      id: "124",
      created_at: "2026-03-12T12:01:00Z",
      message: "Test",
      response: "Answer",
      generation_millis: 10
    };

    const result = createMessage(response as any);

    expect(result.secondaryResponse).toBeNull();
  });

  it("maps known target languages correctly", () => {
    expect(createTargetLanguage("java")).toBe(TargetLanguage.JAVA);
    expect(createTargetLanguage("python")).toBe(TargetLanguage.PYTHON);
    expect(createTargetLanguage("spice_netlist")).toBe(TargetLanguage.SPICE);
    expect(createTargetLanguage("english")).toBe(TargetLanguage.ENGLISH);
    expect(createTargetLanguage("german")).toBe(TargetLanguage.GERMAN);
  });

  it("returns SPICE for unknown target languages", () => {
    expect(createTargetLanguage("unknown_lang" as any)).toBe(TargetLanguage.SPICE);
    expect(createTargetLanguage("" as any)).toBe(TargetLanguage.SPICE);
  });
})
