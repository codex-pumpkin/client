import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Router, ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

import { PasswordResetViewModel } from "./PasswordResetViewModel";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";
import {Errors} from "../../model/domain/domain_models";

describe("PasswordResetViewModel", () => {

  let vm: PasswordResetViewModel;

  const routerMock = {
    navigate: vi.fn()
  };

  const routeMock = {
    snapshot: {
      params: { token: "abc123" }
    }
  };

  const authMock = {
    submitPasswordReset: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: AuthenticationService_T, useValue: authMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new PasswordResetViewModel());
  });

  it("does not call submitPasswordReset if password is invalid", () => {
    vm.password.control.setValue("abc"); // invalid per validator
    vm.resetPassword();

    expect(authMock.submitPasswordReset).not.toHaveBeenCalled();
  });

  it("sets reset signal on successful password reset", () => {
    vm.password.control.setValue("ValidPass123!");

    authMock.submitPasswordReset.mockReturnValue(of({ isYes: true }));

    vm.resetPassword();

    expect(vm.reset()).toBe(true);
  });

  it("sets generic error on failure", () => {
    vm.password.control.setValue("ValidPass123!");

    authMock.submitPasswordReset.mockReturnValue(of({
      isYes: false,
      no: () => Errors.Unknown
    }));

    vm.resetPassword();

    expect(vm.genericError()).not.toBeNull();
  });

  it("toggles password visibility", () => {
    expect(vm.passwordVisibility()).toBe(false);

    vm.togglePasswordVisibility();
    expect(vm.passwordVisibility()).toBe(true);

    vm.togglePasswordVisibility();
    expect(vm.passwordVisibility()).toBe(false);
  });

  it("navigates home on continue", () => {
    vm.continue();

    expect(routerMock.navigate).toHaveBeenCalledWith([""]);
  });
});
