import {Observable} from 'rxjs'
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse,
  LLMConfigurationResponse,
  MessageResponse,
  TokenResponse
} from './dtos/response';
import {
  ConversationRequest,
  EmailVerificationSubmitRequest, GoogleLoginRequest,
  LLMConfigurationRequest,
  LoginRequest,
  MessageRequest,
  PasswordResetRequestRequest,
  PasswordResetSubmitRequest,
  RefreshRequest,
  SignupRequest,
  UpdateAccountRequest,
  UpdateConversationRequest
} from './dtos/request';
import {QuotaConfig} from './dtos/dtos';

/**
 * Network client interface mapping all REST endpoints.
 */
export interface NetworkClient {

  // ========================
  // Authentication Endpoints
  // ========================

  /**
   * Request to GET /auth/google/login
   */
  loginGoogle$(body: GoogleLoginRequest, token: string): Observable<TokenResponse>

  /**
   * Request to POST /auth/login
   */
  login$(
    body: LoginRequest,
    token: string
  ): Observable<TokenResponse>

  /**
   * Request to POST /auth/signup
   */
  signup$(
    body: SignupRequest,
    token: string
  ): Observable<TokenResponse>

  /**
   * Request to POST /auth/refresh
   */
  refresh$(
    body: RefreshRequest,
    token: string
  ): Observable<TokenResponse>

  /**
   * Request to POST /auth/logout
   */
  logout$(
    refresh_token: string | null,
    token: string
  ): Observable<void>

  // ========================
  // Password Reset Endpoints
  // ========================

  /**
   * Request to POST /auth/request-password-reset
   */
  requestPasswordReset$(
    body: PasswordResetRequestRequest,
    token: string
  ): Observable<void>

  /**
   * Request to POST /auth/submit-password-reset
   */
  submitPasswordReset$(
    body: PasswordResetSubmitRequest,
    token: string
  ): Observable<void>

  // ============================
  // Email Verification Endpoints
  // ============================

  /**
   * Request to POST /auth/request-email-verification
   */
  requestEmailVerification$(token: string): Observable<void>

  /**
   * Request to POST /auth/submit-email-verification
   */
  submitEmailVerification$(
    body: EmailVerificationSubmitRequest,
    token: string
  ): Observable<void>

  // =================
  // Account Endpoints
  // =================

  /**
   * Request to GET /account
   */
  getAccount$(token: string): Observable<AccountResponse>

  /**
   * Request to PUT /account
   */
  updateAccount$(
    body: UpdateAccountRequest,
    token: string
  ): Observable<void>

  /**
   * Request to PUT /account/profile-picture
   */
  updateProfilePicture$(
    body: FormData,
    token: string
  ): Observable<void>

  /**
   * Request to GET /account/profile-picture
   */
  getProfilePicture$(token: string): Observable<Blob>

  // ===========================
  // LLM-Configuration Endpoints
  // ===========================

  /**
   * Request to POST /account/llm-configurations
   */
  addLLMConfiguration$(
    body: LLMConfigurationRequest,
    token: string
  ): Observable<void>

  /**
   * Request to PUT /account/llm-configurations/{id}
   */
  updateLLMConfiguration$(
    body: LLMConfigurationRequest,
    id: string,
    token: string
  ): Observable<LLMConfigurationResponse>

  /**
   * Request to DELETE /account/llm-configurations/{id}
   */
  deleteLLMConfiguration$(
    id: string,
    token: string
  ): Observable<void>

  // ===============
  // Quota Endpoints
  // ===============

  /**
   * Request to GET /quota
   */
  getQuota$(token: string): Observable<QuotaConfig>

  /**
   * Request to PUT /quota
   */
  updateQuota$(
    body: QuotaConfig,
    token: string
  ): Observable<QuotaConfig>

  // ===================
  // Analytics Endpoints
  // ===================

  /**
   * Request to GET /analytics
   */
  getAnalytics$(token: string): Observable<AnalyticsResponse>

  // =======================
  // Conversations Endpoints
  // =======================

  /**
   * Request to GET /conversations
   */
  getConversations$(token: string): Observable<ConversationResponse[]>

  /**
   * Request to POST /conversations
   */
  postConversation$(
    body: ConversationRequest,
    token: string
  ): Observable<ConversationResponse>

  /**
   * Request to PUT /conversations/{id}
   */
  updateConversation$(
    body: UpdateConversationRequest,
    id: string,
    token: string
  ): Observable<ConversationResponse>

  /**
   * Request to DELETE /conversations/{id}
   */
  deleteConversation$(
    id: string,
    token: string
  ): Observable<void>

  // =================
  // Message Endpoints
  // =================

  /**
   * Request to POST /conversations/{id}/messages
   */
  addMessage$(
    body: MessageRequest,
    id: string,
    token: string
  ): Observable<MessageResponse>

  /**
   * Request to PUT /conversations/{id}/messages
   */
  updateMessage$(
    body: MessageRequest,
    id: string,
    token: string
  ): Observable<MessageResponse>
}
