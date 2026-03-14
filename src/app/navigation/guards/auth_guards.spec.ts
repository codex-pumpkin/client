import {TestBed} from "@angular/core/testing"
import {AccountAuthGuard, VerifiedAuthGuard} from "./auth_guards"
import {AuthenticationService, AuthenticationService_T} from "../../model/authentication/AuthenticationService"
import {BehaviorSubject} from 'rxjs';
import {Account} from '../../model/domain/domain_models';
import {expect} from 'vitest';
import {ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';

const noAccService: Partial<AuthenticationService> = {
  account$: new BehaviorSubject<Account | null>(null)
}

const memberService: Partial<AuthenticationService> = {
  account$: new BehaviorSubject<Account | null>({
    id: "id",
    username: "username",
    email: "email",
    isAdmin: false,
    isVerified: false,
    authenticatedViaGoogle: false,
    createdAt: "timestamp"
  })
}

const verifiedService: Partial<AuthenticationService> = {
  account$: new BehaviorSubject<Account | null>({
    id: "id",
    username: "username",
    email: "email",
    isAdmin: false,
    isVerified: true,
    authenticatedViaGoogle: false,
    createdAt: "timestamp"
  })
}

describe("VerifiedAuthGuard", () => {
  let subject: VerifiedAuthGuard

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VerifiedAuthGuard,
        {
          provide: AuthenticationService_T,
          useValue: memberService
        }
      ]
    })

    subject = TestBed.inject(VerifiedAuthGuard)
  })

  it("Redirects to login if unauthenticated", () => {
    subject.auth = noAccService as AuthenticationService

    const urlTree = subject.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    expect((urlTree as UrlTree).toString()).equals("/login")
  })

  it("Redirects to email-verification if unverified", () => {
    subject.auth = memberService as AuthenticationService

    const urlTree = subject.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    expect((urlTree as UrlTree).toString()).equals("/email-not-verified")
  })

  it("Allows if authenticated", () => {
    subject.auth = verifiedService as AuthenticationService

    const result = subject.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    expect(result).equals(true)
  })

})


describe("AccountAuthGuard", () => {
  let subject: AccountAuthGuard

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountAuthGuard,
        {
          provide: AuthenticationService_T,
          useValue: memberService
        }
      ]
    })

    subject = TestBed.inject(AccountAuthGuard)
  })

  it("Redirects to login if unauthenticated", () => {
    subject.auth = noAccService as AuthenticationService

    const urlTree = subject.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    expect((urlTree as UrlTree).toString()).equals("/login")
  })

  it("Allows if authenticated", () => {
    subject.auth = verifiedService as AuthenticationService

    const result = subject.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    expect(result).equals(true)
  })

})
