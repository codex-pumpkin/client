import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";

import { RequestPasswordResetViewModel } from "./RequestPasswordResetViewModel";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";

describe("RequestPasswordResetViewModel", () => {

  let vm: RequestPasswordResetViewModel;

  const routerMock = {
    navigate: vi.fn()
  };

  const authMock = {
    requestPasswordReset$: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthenticationService_T, useValue: authMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new RequestPasswordResetViewModel());
  });

  it("does not call service when email is invalid", () => {

    vm.email.control.setValue("invalid");

    vm.requestPasswordReset();

    expect(authMock.requestPasswordReset$).not.toHaveBeenCalled();
  });

  it("sets mailSent when request succeeds", () => {

    authMock.requestPasswordReset$.mockReturnValue(
      of({ isYes: true })
    );

    vm.email.control.setValue("user@test.com");

    vm.requestPasswordReset();

    expect(vm.mailSent()).toBe(true);
  });

  it("sets generic error when request fails", () => {

    authMock.requestPasswordReset$.mockReturnValue(
      of({
        isYes: false,
        no: () => ({ code: "Unknown" })
      })
    );

    vm.email.control.setValue("user@test.com");

    vm.requestPasswordReset();

    expect(vm.genericError()).not.toBeNull();
  });

  it("navigates home on continue", () => {

    vm.continue();

    expect(routerMock.navigate).toHaveBeenCalledWith([""]);
  });
});
