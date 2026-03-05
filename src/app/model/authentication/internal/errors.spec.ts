import {HttpErrorResponse} from '@angular/common/http';
import {createSignupError} from './errors';
import {Errors, Maybe} from '../../domain/domain_models';
import {firstValueFrom, Observable} from 'rxjs';

const expectObservableMaybeNo = async (observable: Observable<Maybe<any, any>>, expected: any) => {
  expect((await firstValueFrom(observable)).no()).equals(expected)
}

describe("errors.ts", () => {
  // Implicitly also tests 'convertError'
  it("createSignupError/convertError works for all types of status codes", () => {
    const connection = new HttpErrorResponse({status: 0})
    const auth = new HttpErrorResponse({status: 401})
    const permission = new HttpErrorResponse({status: 403})
    const other = new HttpErrorResponse({status: 999})
    const conflict = new HttpErrorResponse({status: 409})

    expectObservableMaybeNo(createSignupError(connection), Errors.Connection)
    expectObservableMaybeNo(createSignupError(auth), Errors.Authentication)
    expectObservableMaybeNo(createSignupError(permission), Errors.Permission)
    expectObservableMaybeNo(createSignupError(other), Errors.Unknown)
    expectObservableMaybeNo(createSignupError(conflict), Errors.UsernameUsed)
  })
});
