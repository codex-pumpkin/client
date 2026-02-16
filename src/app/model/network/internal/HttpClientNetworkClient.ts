import {NetworkClient} from '../NetworkClient';
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EnvironmentLoader_T} from '../../../environment/EnvironmentLoader';
import {
  ConversationRequest,
  EmailVerificationSubmitRequest, GoogleLoginRequest,
  LLMConfigurationRequest,
  LoginRequest, MessageRequest,
  PasswordResetRequestRequest, PasswordResetSubmitRequest,
  RefreshRequest,
  SignupRequest, UpdateAccountRequest, UpdateConversationRequest
} from '../dtos/request';
import {Observable} from 'rxjs';
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse,
  LLMConfigurationResponse, MessageResponse,
  TokenResponse
} from '../dtos/response';
import {QuotaConfig} from '../dtos/dtos';
import {relative} from '@angular/compiler-cli';

@Injectable({
  providedIn: 'root'
})
export class HttpClientNetworkClient implements NetworkClient {

  private readonly client = inject(HttpClient)

  private readonly environment = inject(EnvironmentLoader_T)

  private readonly url = (relative: string) => `${this.environment.get().SERVER_BASE_URL}${relative}`

  private readonly headers = (token: string) => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  })

  getConversations$(token: string): Observable<ConversationResponse[]> {
    return this.client.get<ConversationResponse[]>(
      this.url('/conversations'),
      { headers: this.headers(token) }
    )
  }

  postConversation$(
    body: ConversationRequest,
    token: string
  ): Observable<ConversationResponse> {
    return this.client.post<ConversationResponse>(
      this.url('/conversations'),
      body,
      { headers: this.headers(token) }
    )
  }

  updateConversation$(
    body: UpdateConversationRequest,
    id: string,
    token: string
  ): Observable<ConversationResponse> {
    return this.client.put<ConversationResponse>(
      this.url(`/conversations/${id}`),
      body,
      { headers: this.headers(token) }
    )
  }

  deleteConversation$(
    id: string,
    token: string
  ): Observable<void> {
    return this.client.delete<void>(
      this.url(`/conversations/${id}`),
      { headers: this.headers(token) }
    )
  }

  getAccount$(token: string): Observable<AccountResponse> {
    return this.client.get<AccountResponse>(
      this.url('/account'),
      { headers: this.headers(token) }
    )
  }

  updateAccount$(
    body: UpdateAccountRequest,
    token: string
  ): Observable<void> {
    return this.client.put<void>(
      this.url('/account'),
      body,
      { headers: this.headers(token) }
    )
  }

  updateProfilePicture$(
    body: FormData,
    token: string
  ): Observable<void> {
    return this.client.put<void>(
      this.url('/account/profile-picture'),
      body,
      { headers: this.headers(token) }
    )
  }

  getProfilePicture$(token: string): Observable<Blob> {
    return this.client.get(
      this.url('/account/profile-picture'),
      {
        headers: this.headers(token),
        responseType: 'blob'
      }
    )
  }

  getAnalytics$(token: string): Observable<AnalyticsResponse> {
    return this.client.get<AnalyticsResponse>(
      this.url('/analytics'),
      { headers: this.headers(token) }
    )
  }

  getQuota$(token: string): Observable<QuotaConfig> {
    return this.client.get<QuotaConfig>(
      this.url('/quota'),
      { headers: this.headers(token) }
    )
  }

  updateQuota$(
    body: QuotaConfig,
    token: string
  ): Observable<QuotaConfig> {
    return this.client.put<QuotaConfig>(
      this.url('/quota'),
      body,
      { headers: this.headers(token) }
    )
  }


  loginGoogle$(body: GoogleLoginRequest, token: string): Observable<TokenResponse> {
    return this.client.post<TokenResponse>(
      this.url('/auth/google/login'),
      body,
      { headers: this.headers(token) }
    )
  }

  login$(body: LoginRequest, token: string): Observable<TokenResponse> {
    return this.client.post<TokenResponse>(
      this.url('/auth/login'),
      body,
      { headers: this.headers(token) }
    )
  }

  signup$(body: SignupRequest, token: string): Observable<void> {
    return this.client.post<void>(
      this.url('/auth/signup'),
      body,
      { headers: this.headers(token) }
    )
  }

  refresh$(body: RefreshRequest, token: string): Observable<TokenResponse> {
    return this.client.post<TokenResponse>(
      this.url('/auth/refresh'),
      body,
      { headers: this.headers(token) }
    )
  }

  logout$(refresh_token: string | null, token: string): Observable<void> {
    return this.client.post<void>(
      this.url('/auth/logout'),
      null,
      {
        headers: this.headers(token),
        params: refresh_token ? { refresh_token: refresh_token } : {}
      }
    )
  }

  requestEmailVerification$(token: string): Observable<void> {
    return this.client.post<void>(
      this.url('/auth/request-email-verification'),
      null,
      { headers: this.headers(token) }
    )
  }

  submitEmailVerification$(
    body: EmailVerificationSubmitRequest,
    token: string
  ): Observable<void> {
    return this.client.post<void>(
      this.url('/auth/submit-email-verification'),
      body,
      { headers: this.headers(token) }
    )
  }

  requestPasswordReset$(
    body: PasswordResetRequestRequest,
    token: string
  ): Observable<void> {
    return this.client.post<void>(
      this.url('/auth/request-password-reset'),
      body,
      { headers: this.headers(token) }
    )
  }

  submitPasswordReset$(
    body: PasswordResetSubmitRequest,
    token: string
  ): Observable<void> {
    return this.client.post<void>(
      this.url('/auth/submit-password-reset'),
      body,
      { headers: this.headers(token) }
    )
  }

  addLLMConfiguration$(
    body: LLMConfigurationRequest,
    token: string
  ): Observable<void> {
    return this.client.post<void>(
      this.url('/llm-configurations'),
      body,
      { headers: this.headers(token) }
    )
  }

  updateLLMConfiguration$(
    body: LLMConfigurationRequest,
    id: string,
    token: string
  ): Observable<LLMConfigurationResponse> {
    return this.client.put<LLMConfigurationResponse>(
      this.url(`/llm-configurations/${id}`),
      body,
      { headers: this.headers(token) }
    )
  }

  deleteLLMConfiguration$(
    id: string,
    token: string
  ): Observable<void> {
    return this.client.delete<void>(
      this.url(`/llm-configurations/${id}`),
      { headers: this.headers(token) }
    )
  }

  addMessage$(
    body: MessageRequest,
    id: string,
    token: string
  ): Observable<string> {
    return this.client.post<string>( // TODO: The return type needs to be figured out. Speak with Kyrylo
      this.url(`/conversations/${id}/messages`),
      body,
      { headers: this.headers(token) }
    )
  }

  updateMessage$(
    body: MessageRequest,
    id: string,
    token: string
  ): Observable<MessageResponse> {
    return this.client.put<MessageResponse>(
      this.url(`/conversations/${id}/messages`),
      body,
      { headers: this.headers(token) }
    )
  }

  getLLMConfigurations(token: string): Observable<LLMConfigurationResponse[]> {
    return this.client.get<LLMConfigurationResponse[]>(
      this.url(`/llm-configurations`),
      { headers: this.headers(token) }
    )
  }
}
