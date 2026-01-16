import {BehaviorSubject, Observable} from 'rxjs';
import {Account, CodexError, LoginError, LoginGoogleError, Maybe, SignupError} from '../domain/domain_models';
import {inject, InjectionToken} from '@angular/core';
import {NetworkAuthenticationService} from './internal/NetworkAuthenticationService';

export interface AuthenticationService {

  /**
   * Contains the currently authenticated account.
   * Null if the user is not authenticated to an account.
   */
  account$: BehaviorSubject<Account | null>

  /**
   * Logs in using credentials.
   * In case of success sets the account.
   * Only either email or username are required.
   * @param email The email
   * @param username The username
   * @param password The password
   */
  loginWithCredentials$(email: string | null, username: string | null, password: string): Observable<Maybe<Account, LoginError>>

  /**
   * Logs in with refresh tokens.
   * In case of success sets the account.
   */
  loginWithRefreshToken$(): Observable<Maybe<Account, CodexError>>

  /**
   * Signs up with new credentials.
   * In case of success sets the account.
   * @param email The email
   * @param username The username
   * @param password The password
   */
  signupWithCredentials$(email: string, username: string, password: string): Observable<Maybe<Account, SignupError>>

  /**
   * Logs in with Google id token.
   * In case of success sets the account.
   * @param idToken The google client id token
   */
  authenticateWithGoogle$(idToken: string): Observable<Maybe<Account, LoginGoogleError>>

  /**
   * Requests email verification to be sent.
   * Fails if not authenticated.
   */
  requestEmailVerification$(): Observable<Maybe<true, CodexError>>

  /**
   * Submits email verification.
   * @param verificationToken The token that was sent via email.
   */
  submitEmailVerification$(verificationToken: string, token: string): Observable<Maybe<true, CodexError>>

  /**
   * Requests password reset message.
   * Fails if not authenticated.
   */
  requestPasswordReset$(email: string): Observable<Maybe<true, CodexError>>

  /**
   * Submits password reset information.
   * @param token The token that was sent via email.
   * @param newPassword The new password.
   */
  submitPasswordReset(passwordToken: string, newPassword: string, token: string): Observable<Maybe<true, CodexError>>

  /**
   * Logs out of the current account.
   */
  logout$(): Observable<Maybe<true, CodexError>>

  /**
   * Logs out of all currently logged in accounts.
   */
  logoutAll$(): Observable<Maybe<true, CodexError>>

  /**
   * Performs a safe authenticated call.
   * @param call The call.
   */
  safe<T>(call: (token: string) => Observable<T>): Observable<T>

  /**
   * Refreshes the account.
   */
  refreshAccount(): Promise<boolean>

}

/**
 * Injection token for the AuthenticationService
 */
export const AuthenticationService_T = new InjectionToken<AuthenticationService>(
  'AuthenticationService',
  {
    providedIn: 'root',
    factory: () => inject(NetworkAuthenticationService)
  }
)
