import {AuthenticationService} from '../AuthenticationService';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, map, Observable, of, pipe, switchMap, tap, throwError} from 'rxjs';
import {
  Account,
  CodexError,
  Errors,
  LoginError,
  LoginGoogleError,
  Maybe,
  SignupError
} from '../../domain/domain_models';
import {NetworkClient_T} from '../../network/NetworkClient';
import {TokenStore} from './TokenStore';
import {createAccount} from './mapping';
import {convertError, createSignupError} from './errors';
import {TokenResponse} from '../../network/dtos/response';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: "root"
})
export class NetworkAuthenticationService implements AuthenticationService {

  private api = inject(NetworkClient_T)

  private tokens = inject(TokenStore)

  // Updates both tokens from a given token response
  private updateTokens = (tokenResponse: TokenResponse) => {
    this.tokens.setRefresh(tokenResponse.refresh_token)
    this.tokens.setAccess(tokenResponse.access_token)
  }

  account$: BehaviorSubject<Account | null> = new BehaviorSubject<Account | null>(null)

  authenticateWithGoogle$(idToken: string): Observable<Maybe<Account, LoginGoogleError>> {
    const refreshFlow$ = this.api
      .loginGoogle$({
        id_token: idToken
      }, "")
      .pipe(
        tap(this.updateTokens), // When success, update tokens
        switchMap(_ => this.refreshAccountInternal()), // When success, refresh cached account
        map(account => Maybe.fromNullable(account, Errors.Authentication as CodexError)), // When success, map to 'yes'-maybe
        catchError(convertError<Account>) // When error, map to 'no'-maybe
      )

    return refreshFlow$
  }

  loginWithCredentials$(email: string | null, username: string | null, password: string): Observable<Maybe<Account, LoginError>> {
    const loginFlow$ = this.api
      .login$( // Make network call
        {
          email: email ?? undefined,
          username: username ?? undefined,
          password: password
        },
        ""
      ).pipe(
        tap(this.updateTokens), // When success, update tokens
        switchMap(_ => this.refreshAccountInternal()), // When success, refresh cached account
        map(account => Maybe.fromNullable(account, Errors.Authentication as CodexError)), // When success, map to 'yes'-maybe
        catchError(convertError<Account>) // When error, map to 'no'-maybe
      )

    return loginFlow$
  }

  loginWithRefreshToken$(): Observable<Maybe<Account, CodexError>> {
    const refreshFlow$ = this.api
      .refresh$({
        refresh_token: this.tokens.getRefreshOrEmpty()
      }, "")
      .pipe(
        tap(this.updateTokens), // When success, update tokens
        switchMap(_ => this.refreshAccountInternal()), // When success, refresh cached account
        map(account => Maybe.fromNullable(account, Errors.Authentication as CodexError)), // When success, map to 'yes'-maybe
        catchError(convertError<Account>) // When error, map to 'no'-maybe
      )

    return refreshFlow$
  }

  logoutInternal(all: boolean): Observable<Maybe<true, CodexError>> {
    const refreshToken = all ? this.tokens.getRefresh() : null

    const logout$ = this.api
      .logout$(refreshToken, this.tokens.getAccessOrEmpty()) // Make api call
      .pipe(
        map(() => Maybe.createYes<true, CodexError>(true)), // When success, create 'yes' maybe
        catchError(convertError<true>) // When error, create 'no' maybe
      )

    // We 'locally' logout. Session may not be invalidated, but anyway
    this.tokens.setAccess(null)
    this.tokens.setRefresh(null)
    this.account$.next(null)

    return logout$
  }

  logout$(): Observable<Maybe<true, CodexError>> {
    return this.logoutInternal(false)
  }

  logoutAll$(): Observable<Maybe<true, CodexError>> {
    return this.logoutInternal(true)
  }

  // Refreshes the account, updates the account$ flow and has account as response
  refreshAccountInternal(): Observable<Account | null> {
    // Contains account when was success
    const accountRefreshSuccess$ = this.api
      .getAccount$(this.tokens.getAccessOrEmpty())
      .pipe(
        tap(acc => console.log(`Got emission ${JSON.stringify(acc)} from getAccount$ inside refreshAccountInternal`)),
        map(createAccount), // When success, map to domain model
        catchError(_ => { // When error, set current account to null and emit error
          console.log(`Caught error from getAccount$ inside refreshAccountInternal`)
          return of(null)
        }),
        tap(account => { // Update cached account
          this.account$.next(account)
        })
      )

    return accountRefreshSuccess$
  }

  refreshAccount(): Promise<boolean> {
    const accountRefreshSuccess$ =
      this.refreshAccountInternal()
        .pipe(
          map(account => !!account)
        )

    return firstValueFrom(accountRefreshSuccess$)
  }

  requestEmailVerification$(): Observable<Maybe<true, CodexError>> {
    const request$ = this.api
      .requestEmailVerification$(this.tokens.getRefreshOrEmpty())
      .pipe(
        map(() => Maybe.createYes<true, CodexError>(true)),
        catchError(convertError<true>)
      )

    return request$
  }

  requestPasswordReset$(email: string): Observable<Maybe<true, CodexError>> {
    const request$ = this.api
      .requestPasswordReset$(
        {email: email},
        this.tokens.getRefreshOrEmpty()
      )
      .pipe(
        map(() => Maybe.createYes<true, CodexError>(true)),
        catchError(convertError<true>)
      )

    return request$
  }

  safe<T>(call: (token: string) => Observable<T>): Observable<T> {
    const response$ = call(this.tokens.getRefreshOrEmpty()) // We make the call the first time
      .pipe(
        catchError(_err => { // When an error occurs on the first call, we catch it
          const err = _err as HttpErrorResponse
          if (err.status == 401 || err.status == 403) { // If the error could be caused ba authentication, we refresh
            return this.api
              .refresh$({ // We make the refresh call
                refresh_token: this.tokens.getRefreshOrEmpty()
              }, this.tokens.getAccessOrEmpty())
              .pipe(
                switchMap((res) => { // When the refresh call finished successfully, we save the new token and make the call a second time
                  const newToken = res.access_token;
                  this.tokens.setAccess(newToken)
                  return call(newToken); // The second call is simply returned. If an error occurs again, we don't care
                }),
                catchError((refErr) => throwError(() => refErr)) // If refresh causes an error, we propagate it
              );
          }

          return throwError(() => _err) // If the error can't be solved ba authenticating, we propagate it
        })
      )

    return response$
  }

  signupWithCredentials$(email: string, username: string, password: string): Observable<Maybe<Account, SignupError>> {
    const signup$ = this.api
      .signup$(
        {
          email: email,
          username: username,
          password: password
        },
        this.tokens.getRefreshOrEmpty()
      )
      .pipe(
        tap(this.updateTokens), // When success, update tokens
        switchMap(_ => this.refreshAccountInternal()), // When success, refresh cached account
        map(account => Maybe.fromNullable(account, Errors.Authentication as SignupError)), // When success, map to 'yes'-maybe
        catchError(createSignupError<Account>) // When error, map to 'no'-maybe
      )

    return signup$
  }

  submitEmailVerification$(verificationToken: string, token: string): Observable<Maybe<true, CodexError>> {
    const request$ = this.api
      .submitEmailVerification$(
        {
          verification_token: verificationToken
        },
        token
      )
      .pipe(
        tap(_ => this.refreshAccountInternal()), // When success, refresh cached account
        map(() => Maybe.createYes<true, CodexError>(true)), // When success, map to 'yes'-maybe
        catchError(convertError<true>) // When error, map to 'no'-maybe
      )

    return request$
  }

  submitPasswordReset(passwordToken: string, newPassword: string, token: string): Observable<Maybe<true, CodexError>> {
    const request$ = this.api
      .submitPasswordReset$(
        {
          reset_token: passwordToken,
          new_password: newPassword
        },
        token
      )
      .pipe(
        map(() => Maybe.createYes<true, CodexError>(true)), // When success, map to 'yes'-maybe
        catchError(convertError<true>) // When error, map to 'no'-maybe
      )

    this.logoutInternal(false) // We log out in any case

    return request$
  }
}
