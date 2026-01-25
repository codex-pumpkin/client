/* v8 ignore start */
import {AuthenticationService} from '../authentication/AuthenticationService';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Account, CodexError, LoginError, LoginGoogleError, Maybe, SignupError} from '../domain/domain_models';

export class SucceedingAuthenticationService implements AuthenticationService {

  static readonly account: Account = {
    id: "acc-id",
    email: "user@gmail.com",
    username: "acc-username",
    isAdmin: true,
    isVerified: true,
    authenticatedViaGoogle: true,
    createdAt: "acc-timestamp",
    llmConfigurations: []
  }

  account$: BehaviorSubject<Account | null> = new BehaviorSubject<Account | null>(SucceedingAuthenticationService.account)

  authenticateWithGoogle$(idToken: string): Observable<Maybe<Account, LoginGoogleError>> {
    return of(Maybe.createYes<Account, LoginGoogleError>(SucceedingAuthenticationService.account));
  }

  loginWithCredentials$(email: string | null, username: string | null, password: string): Observable<Maybe<Account, LoginError>> {
    return of(Maybe.createYes<Account, LoginError>(SucceedingAuthenticationService.account));
  }

  loginWithRefreshToken$(): Observable<Maybe<Account, CodexError>> {
    return of(Maybe.createYes<Account, CodexError>(SucceedingAuthenticationService.account));
  }

  logout$(): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createYes<true, CodexError>(true));
  }

  logoutAll$(): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createYes<true, CodexError>(true));
  }

  refreshAccount(): Promise<boolean> {
    return Promise.resolve(true);
  }

  requestEmailVerification$(): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createYes<true, CodexError>(true));
  }

  requestPasswordReset$(email: string): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createYes<true, CodexError>(true));
  }

  safe<T>(call: (token: string) => Observable<T>): Observable<T> {
    return call("")
  }

  signupWithCredentials$(email: string, username: string, password: string): Observable<Maybe<Account, SignupError>> {
    return of(Maybe.createYes<Account, SignupError>(SucceedingAuthenticationService.account));
  }

  submitEmailVerification$(verificationToken: string): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createYes<true, CodexError>(true));
  }

  submitPasswordReset(passwordToken: string, newPassword: string): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createYes<true, CodexError>(true));
  }

}
/* v8 ignore end */
