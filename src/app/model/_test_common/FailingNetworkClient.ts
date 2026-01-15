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
import {Observable, throwError} from 'rxjs';
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse, LLMConfigurationResponse,
  MessageResponse,
  TokenResponse
} from '../network/dtos/response';
import {QuotaConfig} from '../network/dtos/dtos';
import {HttpErrorResponse} from '@angular/common/http';

const internalServerError = throwError(() => new HttpErrorResponse({
  status: 500
}))

export class FailingNetworkClient implements NetworkClient {
  addLLMConfiguration$(body: LLMConfigurationRequest, token: string): Observable<void> {
    return internalServerError
  }

  addMessage$(body: MessageRequest, id: string, token: string): Observable<MessageResponse> {
    return internalServerError;
  }

  deleteConversation$(id: string, token: string): Observable<void> {
    return internalServerError;
  }

  deleteLLMConfiguration$(id: string, token: string): Observable<void> {
    return internalServerError;
  }

  getAccount$(token: string): Observable<AccountResponse> {
    return internalServerError;
  }

  getAnalytics$(token: string): Observable<AnalyticsResponse> {
    return internalServerError;
  }

  getConversations$(token: string): Observable<ConversationResponse[]> {
    return internalServerError;
  }

  getProfilePicture$(token: string): Observable<Blob> {
    return internalServerError;
  }

  getQuota$(token: string): Observable<QuotaConfig> {
    return internalServerError;
  }

  login$(body: LoginRequest, token: string): Observable<TokenResponse> {
    return internalServerError;
  }

  loginGoogle$(body: GoogleLoginRequest, token: string): Observable<TokenResponse> {
    return internalServerError;
  }

  logout$(refresh_token: string | null, token: string): Observable<void> {
    return internalServerError;
  }

  postConversation$(body: ConversationRequest, token: string): Observable<ConversationResponse> {
    return internalServerError;
  }

  refresh$(body: RefreshRequest, token: string): Observable<TokenResponse> {
    return internalServerError;
  }

  requestEmailVerification$(token: string): Observable<void> {
    return internalServerError;
  }

  requestPasswordReset$(body: PasswordResetRequestRequest, token: string): Observable<void> {
    return internalServerError;
  }

  signup$(body: SignupRequest, token: string): Observable<TokenResponse> {
    return internalServerError;
  }

  submitEmailVerification$(body: EmailVerificationSubmitRequest, token: string): Observable<void> {
    return internalServerError;
  }

  submitPasswordReset$(body: PasswordResetSubmitRequest, token: string): Observable<void> {
    return internalServerError;
  }

  updateAccount$(body: UpdateAccountRequest, token: string): Observable<void> {
    return internalServerError;
  }

  updateConversation$(body: UpdateConversationRequest, id: string, token: string): Observable<ConversationResponse> {
    return internalServerError;
  }

  updateLLMConfiguration$(body: LLMConfigurationRequest, id: string, token: string): Observable<LLMConfigurationResponse> {
    return internalServerError;
  }

  updateMessage$(body: MessageRequest, id: string, token: string): Observable<MessageResponse> {
    return internalServerError;
  }

  updateProfilePicture$(body: FormData, token: string): Observable<void> {
    return internalServerError;
  }

  updateQuota$(body: QuotaConfig, token: string): Observable<QuotaConfig> {
    return internalServerError;
  }
}
