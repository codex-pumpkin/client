/* v8 ignore start */
import {AuthenticationService} from '../authentication/AuthenticationService';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {Account, CodexError, Errors, LoginError, LoginGoogleError, Maybe, SignupError} from '../domain/domain_models';
import {HttpErrorResponse} from '@angular/common/http';

export class FailingAuthenticationService implements AuthenticationService {

  account$: BehaviorSubject<Account | null> = new BehaviorSubject<Account | null>(null)

  authenticateWithGoogle$(idToken: string): Observable<Maybe<Account, LoginGoogleError>> {
    return of(Maybe.createNo<Account, LoginGoogleError>(Errors.Authentication));
  }

  loginWithCredentials$(email: string | null, username: string | null, password: string): Observable<Maybe<Account, LoginError>> {
    return of(Maybe.createNo<Account, LoginError>(Errors.Authentication));
  }

  loginWithRefreshToken$(): Observable<Maybe<Account, CodexError>> {
    return of(Maybe.createNo<Account, CodexError>(Errors.Authentication));
  }

  logout$(): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createNo<true, CodexError>(Errors.Authentication));
  }

  logoutAll$(): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createNo<true, CodexError>(Errors.Authentication));
  }

  refreshAccount(): Promise<boolean> {
    return Promise.resolve(false);
  }

  requestEmailVerification$(): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createNo<true, CodexError>(Errors.Authentication));
  }

  requestPasswordReset$(email: string): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createNo<true, CodexError>(Errors.Authentication));
  }

  safe<T>(call: (token: string) => Observable<T>): Observable<T> {
    return throwError(() => new HttpErrorResponse({status: 401}))
  }

  signupWithCredentials$(email: string, username: string, password: string): Observable<Maybe<Account, SignupError>> {
    return of(Maybe.createNo<Account, SignupError>(Errors.Authentication));
  }

  submitEmailVerification$(verificationToken: string): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createNo<true, CodexError>(Errors.Authentication));
  }

  submitPasswordReset(passwordToken: string, newPassword: string): Observable<Maybe<true, CodexError>> {
    return of(Maybe.createNo<true, CodexError>(Errors.Authentication));
  }

}
/* v8 ignore end */
