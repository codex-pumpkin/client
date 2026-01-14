import {CodexError, Errors, Maybe, SignupError} from '../../domain/domain_models';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';

/**
 * Converts an error thrown by an rxjs observable to a CodexError.
 */
export const convertError = <T>(err: unknown): Observable<Maybe<T, CodexError>> => {
  // This is guaranteed to work, if 'err' was passed from an angular http request.
  const error = err as HttpErrorResponse;

  let codexError: CodexError = Errors.Unknown

  if (error.status === 0) {
    codexError = Errors.Connection
  } else if (error.status == 401) {
    codexError = Errors.Authentication
  } else if (error.status == 403) {
    codexError = Errors.Permission
  }

  return of(Maybe.createNo<T, CodexError>(codexError))
};

export const createSignupError = <T>(err: unknown): Observable<Maybe<T, SignupError>> => {
  // This is guaranteed to work, if 'err' was passed from an angular http request.
  const error = err as HttpErrorResponse;

  let signupError: SignupError | null = null

  if(error.status == 409) {
    // TODO: Decide here if it is username XOR email that causes a conflict
    signupError = Errors.EmailUsed
  }

  return signupError ? of(Maybe.createNo<T, SignupError>(signupError))
    : convertError(err)
}

export const createLoginError = convertError
