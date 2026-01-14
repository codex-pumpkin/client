import {TokenStore} from './TokenStore';
import {TestBed} from '@angular/core/testing';
import {NetworkClient} from '../../network/NetworkClient';
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
} from '../../network/dtos/request';
import {catchError, EMPTY, firstValueFrom, Observable, of, throwError} from 'rxjs';
import {
  AccountResponse,
  AnalyticsResponse,
  ConversationResponse,
  LLMConfigurationResponse,
  MessageResponse,
  TokenResponse
} from '../../network/dtos/response';
import {QuotaConfig} from '../../network/dtos/dtos';
import {beforeEach, expect} from 'vitest';
import {NetworkAuthenticationService} from './NetworkAuthenticationService';
import {HttpErrorResponse} from '@angular/common/http';
import {createAccount} from './mapping';
import {Account, Errors, Maybe} from '../../domain/domain_models';

class MemoryTokenStore implements TokenStore {

  private storage = new Map<string, string>()

  getAccess(): string | null {
    return this.storage.get("access") ?? null
  }

  getAccessOrEmpty(): string {
    return this.getAccess() ?? ""
  }

  getRefresh(): string | null {
    return this.storage.get("refresh") ?? null
  }

  getRefreshOrEmpty(): string {
    return this.getRefresh() ?? ""
  }

  setAccess(accessToken: string | null): void {
    if (accessToken) {
      this.storage.set("access", accessToken)
    } else {
      this.storage.delete("access")
    }
  }

  setRefresh(refreshToken: string | null): void {
    if (refreshToken) {
      this.storage.set("refresh", refreshToken)
    } else {
      this.storage.delete("refresh")
    }
  }

}

const account: AccountResponse = {
  id: "account-id",
  username: "username",
  email: "email",
  is_admin: true,
  is_verified: true,
  auth_via_google: true,
  created_at: "timestamp",
  llm_configurations: []
}

const tokens: TokenResponse = {
  access_token: "access",
  refresh_token: "refresh"
}

// Mock NetworkClient that returns a successful answer for every request to auth endpoints
class SucceedingNetworkClient implements NetworkClient {

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
    return of(account);
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
    return of(tokens)
  }

  loginGoogle$(body: GoogleLoginRequest, token: string): Observable<TokenResponse> {
    return of(tokens)
  }

  logout$(refresh_token: string | null, token: string): Observable<void> {
    return of(undefined)
  }

  postConversation$(body: ConversationRequest, token: string): Observable<ConversationResponse> {
    return EMPTY
  }

  refresh$(body: RefreshRequest, token: string): Observable<TokenResponse> {
    return of(tokens)
  }

  requestEmailVerification$(token: string): Observable<void> {
    return of(undefined)
  }

  requestPasswordReset$(body: PasswordResetRequestRequest, token: string): Observable<void> {
    return of(undefined)
  }

  signup$(body: SignupRequest, token: string): Observable<TokenResponse> {
    return of(tokens)
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

const internalServerError = throwError(() => new HttpErrorResponse({
  status: 500
}))

// Mock NetworkClient that always throws
class FailingNetworkClient implements NetworkClient {
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

describe("NetworkAuthenticationService", () => {
  let subject: NetworkAuthenticationService

  beforeEach(() => {
    subject = TestBed.inject(NetworkAuthenticationService);

    (subject as any).tokens = new MemoryTokenStore();
    (subject as any).api = new SucceedingNetworkClient()
  })

  it("refreshAccountInternal sets account if success", () => {
    subject.refreshAccountInternal().subscribe(() => {
      const updatedAccount = subject.account$.getValue()
      expect(updatedAccount?.id).equal("account-id")
    })
  })

  it("refreshAccountInternal unsets account if no success", () => {
    (subject as any).api = new FailingNetworkClient() // Make requests fail
    subject.account$.next(createAccount(account)) // Have actual account set

    subject.refreshAccountInternal().subscribe(() => {
      const updatedAccount = subject.account$.getValue()
      expect(updatedAccount).toBeNull()
    })
  })

  //
  // Tests for login/signup methods
  //

  // Test Factory
  const returnsWhenYes = (call: () => Observable<Maybe<any, any>>, expected: any) => {
    return () => {
      call().subscribe(
        result => {
          expect(result.isYes).toBeTruthy()
          expect(result.yes()).deep.equals(expected)
        }
      )
    }
  }

  const returnsWhenNo = (call: () => Observable<Maybe<any, any>>, error: any) => {
    return () => {
      call().subscribe(
        result => {
          expect(result.isNo).toBeTruthy()
          expect(result.no()).deep.equals(error)
        }
      )
    }
  }

  it("authenticateWithGoogle$ returns account when success",
    returnsWhenYes(() => subject.authenticateWithGoogle$(""), createAccount(account)))

  it("authenticateWithGoogle$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.authenticateWithGoogle$("")
    }, Errors.Unknown))

  it("loginWithCredentials$ returns account when success",
    returnsWhenYes(() => subject.loginWithCredentials$("", "", ""), createAccount(account)))

  it("loginWithCredentials$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.loginWithCredentials$("", "", "")
    }, Errors.Unknown))

  it("loginWithRefreshToken$ returns account when success",
    returnsWhenYes(() => subject.loginWithRefreshToken$(), createAccount(account)))

  it("loginWithRefreshToken$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.loginWithRefreshToken$()
    }, Errors.Unknown))

  it("signupWithCredentials$ returns account when success",
    returnsWhenYes(() => subject.signupWithCredentials$("", "", ""), createAccount(account)))

  it("signupWithCredentials$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.signupWithCredentials$("", "", "")
    }, Errors.Unknown))


  it("logoutInternal returns true on success and unsets tokens/account", () => {
    const tokens = new MemoryTokenStore()
    tokens.setAccess("hello")
    tokens.setRefresh("hello");

    (subject as any).tokens = tokens

    subject.account$.next(createAccount(account))

    subject.logoutInternal(true).subscribe(
      result => {
        expect(result.isYes).toBeTruthy()
        expect(result.yes()).toBeTruthy()

        expect(tokens.getAccess()).toBeNull()
        expect(tokens.getRefresh()).toBeNull()
        expect(subject.account$.getValue()).toBeNull()
      }
    )
  })

  it("refreshAccount returns true on success", async () => {
    const success = await subject.refreshAccount()
    expect(success).toBeTruthy()
  })

  it("refreshAccount returns false on success", async () => {
    (subject as any).api = new FailingNetworkClient()

    const success = await subject.refreshAccount()
    expect(success).toBeFalsy()
  })

  it("logout$ returns true when success",
    returnsWhenYes(() => subject.logout$(), true))

  it("logout$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.logout$()
    }, Errors.Unknown))

  it("logoutAll$ returns true when success",
    returnsWhenYes(() => subject.logoutAll$(), true))

  it("logoutAll$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.logoutAll$()
    }, Errors.Unknown))

  //
  // Tests for email/password verification/resetting
  //

  it("requestEmailVerification$ returns true when success",
    returnsWhenYes(() => subject.requestEmailVerification$(), true))

  it("requestEmailVerification$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.requestEmailVerification$()
    }, Errors.Unknown))

  it("requestPasswordReset$ returns true when success",
    returnsWhenYes(() => subject.requestPasswordReset$(""), true))

  it("requestPasswordReset$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.requestPasswordReset$("")
    }, Errors.Unknown))

  it("submitEmailVerification$ returns true when success",
    returnsWhenYes(() => subject.submitEmailVerification$("", ""), true))

  it("submitEmailVerification$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.submitEmailVerification$("", "")
    }, Errors.Unknown))

  it("submitPasswordReset returns true when success",
    returnsWhenYes(() => subject.submitPasswordReset("", "", ""), true))

  it("submitPasswordReset returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.submitPasswordReset("", "", "")
    }, Errors.Unknown))

  //
  // Tests for the safe<T> method
  //

  it("safe only calls once when request is successful", async () => {
    let callCounter = 0
    const call = () => {
      callCounter++
      return of("success")
    }

    await firstValueFrom(subject.safe(call))

    expect(callCounter).equals(1)
  })

  it("safe only calls once when error is not 401/403", async () => {
    let callCounter = 0
    const call = () => {
      callCounter++
      return throwError(() => new HttpErrorResponse({status: 500}))
    }

    await firstValueFrom(subject.safe(call).pipe(
      catchError(() => of("suppressed error"))
    ))

    expect(callCounter).equals(1)
  })

  it("safe reloads tokens, passes new ones and calls two times in case of 401/403", async () => {
    let callCounter = 0
    const call = (token: string) => {
      callCounter++

      if(callCounter == 1) {
        expect(token).equals("")
        return throwError(() => new HttpErrorResponse({status: 401}))
      } else {
        expect(token).equals("access")
        return of("success")
      }
    }

    const tokens = new MemoryTokenStore()
    tokens.setRefresh(null)
    tokens.setAccess(null);

    (subject as any).tokens = tokens

    await firstValueFrom(subject.safe(call))

    expect(callCounter).equals(2)
  })

});
