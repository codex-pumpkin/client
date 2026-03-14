import {beforeEach, describe, expect, it, vi} from "vitest";
import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";

import {SignupViewModel} from "./SignupViewModel";
import {AuthenticationService_T} from "../../model/authentication/AuthenticationService";
import {Errors} from "../../model/domain/domain_models";
import {EnvironmentLoader_T} from '../../environment/EnvironmentLoader';

describe("SignupViewModel", () => {

  let vm: SignupViewModel;

  const routerMock = {
    navigate: vi.fn()
  };

  const authMock = {
    signupWithCredentials$: vi.fn(),
    authenticateWithGoogle$: vi.fn()
  };

  const envLoaderMock = {
    load: vi.fn(),
    get: vi.fn()
  }

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthenticationService_T, useValue: authMock },
        { provide: EnvironmentLoader_T, useValue: envLoaderMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new SignupViewModel());
  });

  it("toggles password visibility", () => {
    expect(vm.passwordVisible()).toBe(false);

    vm.togglePassword();

    expect(vm.passwordVisible()).toBe(true);
  });

  it("does not call auth when inputs are invalid", () => {
    vm.email.control.setValue("invalid-email");

    vm.signup();

    expect(authMock.signupWithCredentials$).not.toHaveBeenCalled();
  });

  it("navigates to email-not-verified on successful signup", () => {
    authMock.signupWithCredentials$.mockReturnValue(
      of({isYes: true})
    );

    vm.email.control.setValue("user@test.com");
    vm.username.control.setValue("user");
    vm.password.control.setValue("Password123!");

    vm.signup();

    expect(routerMock.navigate).toHaveBeenCalledWith(["/email-not-verified"]);
  });

  it("sets email error when email already used", () => {
    authMock.signupWithCredentials$.mockReturnValue(
      of({
        isYes: false,
        no: () => Errors.EmailUsed
      })
    );

    vm.email.control.setValue("user@test.com");
    vm.username.control.setValue("user");
    vm.password.control.setValue("Password123!");

    vm.signup();

    expect(vm.email.errorKey()).toBe("errors.signup.email_used");
  });

  it("sets username error when username already used", () => {
    authMock.signupWithCredentials$.mockReturnValue(
      of({
        isYes: false,
        no: () => Errors.UsernameUsed
      })
    );

    vm.email.control.setValue("user@test.com");
    vm.username.control.setValue("user");
    vm.password.control.setValue("Password123!");

    vm.signup();

    expect(vm.username.errorKey()).toBe("errors.signup.username_used");
  });

  it("navigates to home after successful Google auth", () => {
    authMock.authenticateWithGoogle$.mockReturnValue(
      of({isYes: true})
    );

    vm.handleGoogleResponse({code: "123"});

    expect(routerMock.navigate).toHaveBeenCalledWith([""]);
  });

  it("sets invalid google error on authentication failure", () => {
    authMock.authenticateWithGoogle$.mockReturnValue(
      of({
        isYes: false,
        no: () => Errors.Authentication
      })
    );

    vm.handleGoogleResponse({code: "123"});

    expect(vm.genericError()).toBe("errors.signup.invalid_google");
  });

})
