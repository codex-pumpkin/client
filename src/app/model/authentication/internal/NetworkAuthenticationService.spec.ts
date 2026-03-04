import {TestBed} from '@angular/core/testing';
import {catchError, firstValueFrom, Observable, of, throwError} from 'rxjs';
import {beforeEach, expect} from 'vitest';
import {NetworkAuthenticationService} from './NetworkAuthenticationService';
import {HttpErrorResponse} from '@angular/common/http';
import {createAccount} from './mapping';
import {Errors, Maybe} from '../../domain/domain_models';
import {MemoryTokenStore} from '../../_test_common/MemoryTokenStore';
import {SucceedingNetworkClient} from '../../_test_common/SucceedingNetworkClient';
import {FailingNetworkClient} from '../../_test_common/FailingNetworkClient';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe("NetworkAuthenticationService", () => {
  let subject: NetworkAuthenticationService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NetworkAuthenticationService],
    });
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
    subject.account$.next(createAccount(SucceedingNetworkClient.account)) // Have actual account set

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
    returnsWhenYes(() => subject.authenticateWithGoogle$(""), createAccount(SucceedingNetworkClient.account)))

  it("authenticateWithGoogle$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.authenticateWithGoogle$("")
    }, Errors.Unknown))

  it("loginWithCredentials$ returns account when success",
    returnsWhenYes(() => subject.loginWithCredentials$("", "", ""), createAccount(SucceedingNetworkClient.account)))

  it("loginWithCredentials$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.loginWithCredentials$("", "", "")
    }, Errors.Unknown))

  it("loginWithRefreshToken$ returns account when success",
    returnsWhenYes(() => subject.loginWithRefreshToken$(), createAccount(SucceedingNetworkClient.account)))

  it("loginWithRefreshToken$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.loginWithRefreshToken$()
    }, Errors.Unknown))

  it("signupWithCredentials$ returns account when success",
    returnsWhenYes(() => subject.signupWithCredentials$("", "", ""), createAccount(SucceedingNetworkClient.account)))

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

    subject.account$.next(createAccount(SucceedingNetworkClient.account))

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
    returnsWhenYes(() => subject.submitEmailVerification$(""), true))

  it("submitEmailVerification$ returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.submitEmailVerification$("")
    }, Errors.Unknown))

  it("submitPasswordReset returns true when success",
    returnsWhenYes(() => subject.submitPasswordReset("", ""), true))

  it("submitPasswordReset returns error when failure",
    returnsWhenNo(() => {
      (subject as any).api = new FailingNetworkClient()
      return subject.submitPasswordReset("", "")
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
