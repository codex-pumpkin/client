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
  UpdateAccountRequest, UpdateConversationRequest
} from '../network/dtos/request';
import {EMPTY, Observable, of} from 'rxjs';
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse, LLMConfigurationResponse,
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
    created_at: "timestamp",
    llm_configurations: []
  }

  static readonly tokens: TokenResponse = {
    access_token: "access",
    refresh_token: "refresh"
  }

  addLLMConfiguration$(body: LLMConfigurationRequest, token: string): Observable<void> {
    return EMPTY
  }

  addMessage$(body: MessageRequest, id: string, token: string): Observable<MessageResponse> {
    return EMPTY
  }

  deleteConversation$(id: string, token: string): Observable<void> {
    return EMPTY
  }

  deleteLLMConfiguration$(id: string, token: string): Observable<void> {
    return EMPTY
  }

  getAccount$(token: string): Observable<AccountResponse> {
    return of(SucceedingNetworkClient.account);
  }

  getAnalytics$(token: string): Observable<AnalyticsResponse> {
    return EMPTY
  }

  getConversations$(token: string): Observable<ConversationResponse[]> {
    return EMPTY
  }

  getProfilePicture$(token: string): Observable<Blob> {
    return EMPTY
  }

  getQuota$(token: string): Observable<QuotaConfig> {
    return EMPTY
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
    return EMPTY
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

  signup$(body: SignupRequest, token: string): Observable<TokenResponse> {
    return of(SucceedingNetworkClient.tokens)
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
    return EMPTY
  }

  updateLLMConfiguration$(body: LLMConfigurationRequest, id: string, token: string): Observable<LLMConfigurationResponse> {
    return EMPTY
  }

  updateMessage$(body: MessageRequest, id: string, token: string): Observable<MessageResponse> {
    return EMPTY
  }

  updateProfilePicture$(body: FormData, token: string): Observable<void> {
    return EMPTY
  }

  updateQuota$(body: QuotaConfig, token: string): Observable<QuotaConfig> {
    return EMPTY
  }

}
