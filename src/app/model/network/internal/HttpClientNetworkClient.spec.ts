import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw'
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse,
  LLMConfigurationResponse, MessageResponse,
  TokenResponse
} from '../dtos/response';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expectTypeOf} from 'vitest';
import {NetworkClient} from '../NetworkClient';
import {TestBed} from '@angular/core/testing';
import {HttpClientNetworkClient} from './HttpClientNetworkClient';
import {EnvironmentConfig, EnvironmentLoader, EnvironmentLoader_T} from '../../../environment/EnvironmentLoader';
import {Observable, of} from 'rxjs';
import {QuotaConfig} from '../dtos/dtos';

const conversations: ConversationResponse[] = [1, 4, 7, 9].map(
  key => ({
    id: `id-${key}`,
    name: `name-${key}`,
    pinned: key % 2 == 0,
    llm_model_config_id: `llm-config-id-${key}`,
    target_language: 'java',
    created_at: `created-at-${key}`,
    messages: []
  })
)

const llm_configs: LLMConfigurationResponse[] = [1, 4, 7, 9].map(key => ({
  id: `llm-id-${key}`,
  name: `llm-name-${key}`,
  api_url: `llm-url-${key}`,
  api_key_set: false
}))

const messages: MessageResponse[] = [1, 4, 7, 9].map(key => ({
  id: `message-id-${key}`,
  message: `message-content`,
  generation_millis: 1000,
  response: "message-response",
  response_secondary: undefined,
  created_at: "message-timestamp"
}))

const account: AccountResponse = {
  id: "account-id",
  email: "account@google.com",
  username: "account",
  is_admin: true,
  is_verified: true,
  auth_via_google: false,
  created_at: "timestamp"
}

const analytics: AnalyticsResponse = {
  requests_today: 67,
  requests_this_month: 6767
}

const quota: QuotaConfig = {
  member: 67,
  admin: 6767
}

const tokens: TokenResponse = {
  access_token: "<access-token>",
  refresh_token: "<refresh-token>"
}

//
// Mock server
//

const server = setupServer(
  http.get("http://test.example.com/conversations", () => {
    return HttpResponse.json(conversations)
  }),
  http.post("http://test.example.com/conversations", () => {
    return HttpResponse.json(conversations[0])
  }),
  http.put("http://test.example.com/conversations/:id", () => {
    return HttpResponse.json(conversations[0])
  }),
  http.delete("http://test.example.com/conversations/:id", () => {
    return HttpResponse.json({})
  }),
  http.get("http://test.example.com/account", () => {
    return HttpResponse.json(account)
  }),
  http.put("http://test.example.com/account", () => {
    return HttpResponse.json({})
  }),
  http.put("http://test.example.com/account/profile-picture", () => {
    return HttpResponse.json({})
  }),
  http.get("http://test.example.com/account/profile-picture", () => {
    return HttpResponse.text("<blob-content>")
  }),
  http.get("http://test.example.com/analytics", () => {
    return HttpResponse.json(analytics)
  }),
  http.get("http://test.example.com/quota", () => {
    return HttpResponse.json(quota)
  }),
  http.put("http://test.example.com/quota", () => {
    return HttpResponse.json(quota)
  }),
  http.post("http://test.example.com/auth/google/login", () => {
    return HttpResponse.json(tokens)
  }),
  http.post("http://test.example.com/auth/login", () => {
    return HttpResponse.json(tokens)
  }),
  http.post("http://test.example.com/auth/signup", () => {
    return HttpResponse.json(tokens)
  }),
  http.post("http://test.example.com/auth/refresh", () => {
    return HttpResponse.json(tokens)
  }),
  http.post("http://test.example.com/auth/logout", () => {
    return HttpResponse.json({})
  }),
  http.post("http://test.example.com/auth/request-email-verification", () => {
    return HttpResponse.json({})
  }),
  http.post("http://test.example.com/auth/submit-email-verification", () => {
    return HttpResponse.json({})
  }),
  http.post("http://test.example.com/auth/request-password-reset", () => {
    return HttpResponse.json({})
  }),
  http.post("http://test.example.com/auth/submit-password-reset", () => {
    return HttpResponse.json({})
  }),
  http.post("http://test.example.com/llm-configurations", () => {
    return HttpResponse.json({})
  }),
  http.put("http://test.example.com/llm-configurations/:id", () => {
    return HttpResponse.json(llm_configs[0])
  }),
  http.delete("http://test.example.com/llm-configurations/:id", () => {
    return HttpResponse.json({})
  }),
  http.post("http://test.example.com/conversations/:id/messages", () => {
    return HttpResponse.json(messages)
  }),
  http.put("http://test.example.com/conversations/:id/messages", () => {
    return HttpResponse.json(messages[0])
  })

)

//
// Mock environment variable holder
//
class MockEnvironmentLoader implements EnvironmentLoader {
  get(): EnvironmentConfig {
    return { SERVER_BASE_URL: "http://test.example.com", GOOGLE_CLIENT_ID: "" };
  }

  load(): Observable<boolean> {
    return of(true)
  }

}

//
// Test declaration
//

describe('HttpClientNetworkClient', () => {
  let subject: NetworkClient

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClientNetworkClient,
        { provide: EnvironmentLoader_T, useClass: MockEnvironmentLoader }
      ]
    })

    subject = TestBed.inject(HttpClientNetworkClient)
  })

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("getConversations$ should return correct type", () => {
    const ret = subject.getConversations$("<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<ConversationResponse[]>()
    })
  })

  it("postConversation$ should return correct type", () => {
    const ret = subject.postConversation$({
      message: "", name: "", llm_model_config_id: "", target_language: "java"
    }, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<ConversationResponse>()
    })
  })

  it("updateConversation$ should return correct type", () => {
    const ret = subject.updateConversation$({
      name: "", pinned: true
    }, "<id>", "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<ConversationResponse>()
    })
  })

  it("deleteConversation$ should return correct type", () => {
    const ret = subject.deleteConversation$("id", "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("getAccount$ should return correct type", () => {
    const ret = subject.getAccount$("<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<AccountResponse>()
    })
  })

  it("updateAccount$ should return correct type", () => {
    const ret = subject.updateAccount$({email: "", username: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("updateProfilePicture$ should return correct type", () => {
    const formData = new FormData()
    formData.set("file", new Blob(["<blob-content>"]))
    const ret = subject.updateProfilePicture$(formData, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("getProfilePicture$ should return correct type", () => {
    const ret = subject.getProfilePicture$("<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<Blob>()
    })
  })

  it("getAnalytics$ should return correct type", () => {
    const ret = subject.getAnalytics$("<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<AnalyticsResponse>()
    })
  })

  it("getQuota$ should return correct type", () => {
    const ret = subject.getQuota$("<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<QuotaConfig>()
    })
  })

  it("updateQuota$ should return correct type", () => {
    const ret = subject.updateQuota$({member: 67, admin: 67}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<QuotaConfig>()
    })
  })

  it("loginGoogle$ should return correct type", () => {
    const ret = subject.loginGoogle$({id_token: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<TokenResponse>()
    })
  })

  it("login$ should return correct type", () => {
    const ret = subject.login$({email: "", password: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<TokenResponse>()
    })
  })

  it("signup$ should return correct type", () => {
    const ret = subject.signup$({email: "", password: "", username: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<TokenResponse>()
    })
  })

  it("refresh$ should return correct type", () => {
    const ret = subject.refresh$({refresh_token: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<TokenResponse>()
    })
  })

  it("logout$ should return correct type", () => {
    const ret = subject.logout$(null, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("requestEmailVerification$ should return correct type", () => {
    const ret = subject.requestEmailVerification$("<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("submitEmailVerification$ should return correct type", () => {
    const ret = subject.submitEmailVerification$({verification_token: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("requestPasswordReset$ should return correct type", () => {
    const ret = subject.requestPasswordReset$({email: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("submitPasswordReset$ should return correct type", () => {
    const ret = subject.submitPasswordReset$({reset_token: "", new_password: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("addLLMConfiguration$ should return correct type", () => {
    const ret = subject.addLLMConfiguration$({api_key: "", api_url: "", name: ""}, "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("updateLLMConfiguration$ should return correct type", () => {
    const ret = subject.updateLLMConfiguration$({api_key: "", api_url: "", name: ""}, "id", "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<LLMConfigurationResponse>()
    })
  })

  it("deleteLLMConfiguration$ should return correct type", () => {
    const ret = subject.deleteLLMConfiguration$("id", "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<void>()
    })
  })

  it("addMessage$ should return correct type", () => {
    const ret = subject.addMessage$({message: ""}, "id", "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<string>()
    })
  })

  it("updateMessage$ should return correct type", () => {
    const ret = subject.updateMessage$({message: ""}, "id", "<token>")
    ret.subscribe(bod => {
      expectTypeOf(bod).toEqualTypeOf<MessageResponse>()
    })
  })
})
