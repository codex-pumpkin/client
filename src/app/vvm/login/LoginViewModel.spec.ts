import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";

import { LoginViewModel } from "./LoginViewModel";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";
import { Errors } from "../../model/domain/domain_models";
import {EnvironmentLoader_T} from '../../environment/EnvironmentLoader';

describe("LoginViewModel", () => {

  let vm: LoginViewModel;

  const routerMock = {
    navigate: vi.fn()
  }

  const authMock = {
    loginWithCredentials$: vi.fn(),
    authenticateWithGoogle$: vi.fn()
  }

  const envLoaderMock = {
    load: vi.fn(),
    get: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthenticationService_T, useValue: authMock },
        { provide: EnvironmentLoader_T, useValue: envLoaderMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new LoginViewModel());
  });

  it("toggles password visibility", () => {
    expect(vm.passwordVisible()).toBe(false);

    vm.togglePassword();

    expect(vm.passwordVisible()).toBe(true);
  });

  it("logs in with email and navigates home", () => {

    authMock.loginWithCredentials$.mockReturnValue(
      of({ isYes: true })
    );

    vm.identifier.control.setValue("user@test.com");
    vm.password.control.setValue("secret");

    vm.login();

    expect(authMock.loginWithCredentials$).toHaveBeenCalledWith(
      "user@test.com",
      null,
      "secret"
    );

    expect(routerMock.navigate).toHaveBeenCalledWith([""]);
  });

  it("logs in with username", () => {

    authMock.loginWithCredentials$.mockReturnValue(
      of({ isYes: true })
    );

    vm.identifier.control.setValue("myuser");
    vm.password.control.setValue("secret");

    vm.login();

    expect(authMock.loginWithCredentials$).toHaveBeenCalledWith(
      null,
      "myuser",
      "secret"
    );
  });

  it("sets identifier and password errors on authentication failure", () => {

    authMock.loginWithCredentials$.mockReturnValue(
      of({
        isYes: false,
        no: () => Errors.Authentication
      })
    );

    vm.identifier.control.setValue("user@test.com");
    vm.password.control.setValue("wrong");

    vm.login();

    expect(vm.identifier.errorKey()).toBe("errors.login.invalid");
    expect(vm.password.errorKey()).toBe("errors.login.invalid");
  });

  it("sets generic error for non-authentication errors", () => {

    authMock.loginWithCredentials$.mockReturnValue(
      of({
        isYes: false,
        no: () => Errors.Unknown
      })
    );

    vm.identifier.control.setValue("user@test.com");
    vm.password.control.setValue("secret");

    vm.login();

    expect(vm.genericError()).not.toBeNull();
  });

  it("navigates to signup page", () => {
    vm.signup();

    expect(routerMock.navigate).toHaveBeenCalledWith(["signup"]);
  });

  it("logs in via google and navigates home", () => {

    authMock.authenticateWithGoogle$.mockReturnValue(
      of({ isYes: true })
    );

    vm.handleGoogleResponse({ code: "abc123" });

    expect(routerMock.navigate).toHaveBeenCalledWith([""]);
  });

  it("sets google authentication error", () => {

    authMock.authenticateWithGoogle$.mockReturnValue(
      of({
        isYes: false,
        no: () => Errors.Authentication
      })
    );

    vm.handleGoogleResponse({ code: "abc123" });

    expect(vm.genericError()).toBe("errors.login.invalid_google");
  });
});
