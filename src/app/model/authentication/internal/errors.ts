import {CodexError, LlmError, Errors, Maybe, SignupError} from '../../domain/domain_models';
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

export const createLlmError = <T>(err: unknown): Observable<Maybe<T, LlmError>> => {
  // This is guaranteed to work, if 'err' was passed from an angular http request.
  const error = err as HttpErrorResponse;

  let convoError: LlmError | null = null

  const reasonsForLlm = [
    "The requested LLM resource was not found.",
    "Failed to connect to the LLM API.",
    "Failed to authenticate with the LLM API.",
    "The LLM API received a bad request.",
    "The LLM API denied permission to access the requested resource.",
    "An error occurred while communicating with the LLM API.",
    "The LLM API rate limit has been exceeded."
  ]
  const anyMatching = reasonsForLlm.some(reason => error.error.detail.issue.includes(reason))

  if (anyMatching) {
    convoError = Errors.LlmConnection
  }

  return convoError ? of(Maybe.createNo<T, LlmError>(convoError))
    : convertError(err)
}

export const createLoginError = convertError
