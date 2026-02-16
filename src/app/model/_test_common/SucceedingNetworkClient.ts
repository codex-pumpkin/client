/* v8 ignore start */
import {NetworkClient} from '../network/NetworkClient';
import {
  ConversationRequest,
  EmailVerificationSubmitRequest,
  GoogleLoginRequest,
  LLMConfigurationRequest,
  LoginRequest,
  MessageRequest,
  PasswordResetRequestRequest,
  PasswordResetSubmitRequest,
  RefreshRequest,
  SignupRequest,
  UpdateAccountRequest,
  UpdateConversationRequest
} from '../network/dtos/request';
import {Observable, of} from 'rxjs';
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse,
  LLMConfigurationResponse,
  MessageResponse,
  TokenResponse
} from '../network/dtos/response';
import {QuotaConfig} from '../network/dtos/dtos';

export class SucceedingNetworkClient implements NetworkClient {

  static readonly account: AccountResponse = {
    id: "account-id",
    username: "username",
    email: "email",
    is_admin: true,
    is_verified: true,
    auth_via_google: true,
    created_at: "timestamp"
  }

  static readonly llmConfig: LLMConfigurationResponse = {
    id: "llm-id",
    name: "llm-name",
    api_url: "llm-url",
    api_key_set: true,
    model_name: "chatgpt-3.4"
  }

  static readonly tokens: TokenResponse = {
    access_token: "access",
    refresh_token: "refresh"
  }

  static readonly message: MessageResponse = {
    id: "message-id",
    message: "message-message",
    generation_millis: 1234,
    response: "message-response",
    response_secondary: undefined,
    created_at: "message-timestamp"
  }

  static readonly analytics: AnalyticsResponse = {
    requests_today: 67,
    requests_this_month: 6767
  }

  static readonly conversation: ConversationResponse = {
    id: "convo-id",
    name: "convo-name",
    pinned: false,
    llm_model_config_id: "llm-id",
    target_language: "java",
    created_at: "convo-timestamp",
    messages: []
  }

  static readonly quota: QuotaConfig = {
    member: 67,
    admin: 6767
  }

  addLLMConfiguration$(body: LLMConfigurationRequest, token: string): Observable<void> {
    return of(undefined)
  }

  addMessage$(body: MessageRequest, id: string, token: string): Observable<string> {
    return of(SucceedingNetworkClient.message.id)
  }

  deleteConversation$(id: string, token: string): Observable<void> {
    return of(undefined)
  }

  deleteLLMConfiguration$(id: string, token: string): Observable<void> {
    return of(undefined)
  }

  getAccount$(token: string): Observable<AccountResponse> {
    return of(SucceedingNetworkClient.account);
  }

  getAnalytics$(token: string): Observable<AnalyticsResponse> {
    return of(SucceedingNetworkClient.analytics)
  }

  getConversations$(token: string): Observable<ConversationResponse[]> {
    return of([SucceedingNetworkClient.conversation])
  }

  getProfilePicture$(token: string): Observable<Blob> {
    return of(new Blob(["profile-picture-blob"]))
  }

  getQuota$(token: string): Observable<QuotaConfig> {
    return of(SucceedingNetworkClient.quota)
  }

  login$(body: LoginRequest, token: string): Observable<TokenResponse> {
    return of(SucceedingNetworkClient.tokens)
  }

  loginGoogle$(body: GoogleLoginRequest, token: string): Observable<TokenResponse> {
    return of(SucceedingNetworkClient.tokens)
  }

  logout$(refresh_token: string | null, token: string): Observable<void> {
    return of(undefined)
  }

  postConversation$(body: ConversationRequest, token: string): Observable<ConversationResponse> {
    return of(SucceedingNetworkClient.conversation)
  }

  refresh$(body: RefreshRequest, token: string): Observable<TokenResponse> {
    return of(SucceedingNetworkClient.tokens)
  }

  requestEmailVerification$(token: string): Observable<void> {
    return of(undefined)
  }

  requestPasswordReset$(body: PasswordResetRequestRequest, token: string): Observable<void> {
    return of(undefined)
  }

  signup$(body: SignupRequest, token: string): Observable<void> {
    return of()
  }

  submitEmailVerification$(body: EmailVerificationSubmitRequest, token: string): Observable<void> {
    return of(undefined)
  }

  submitPasswordReset$(body: PasswordResetSubmitRequest, token: string): Observable<void> {
    return of(undefined)
  }

  updateAccount$(body: UpdateAccountRequest, token: string): Observable<void> {
    return of(undefined)
  }

  updateConversation$(body: UpdateConversationRequest, id: string, token: string): Observable<ConversationResponse> {
    return of(SucceedingNetworkClient.conversation)
  }

  updateLLMConfiguration$(body: LLMConfigurationRequest, id: string, token: string): Observable<LLMConfigurationResponse> {
    return of(SucceedingNetworkClient.llmConfig)
  }

  updateMessage$(body: MessageRequest, id: string, token: string): Observable<MessageResponse> {
    return of(SucceedingNetworkClient.message)
  }

  updateProfilePicture$(body: FormData, token: string): Observable<void> {
    return of(undefined)
  }

  updateQuota$(body: QuotaConfig, token: string): Observable<QuotaConfig> {
    return of(SucceedingNetworkClient.quota)
  }

  getLLMConfigurations(token: string): Observable<LLMConfigurationResponse[]> {
    return of([])
  }

}
/* v8 ignore end */
