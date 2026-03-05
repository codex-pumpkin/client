import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import {BehaviorSubject, of} from "rxjs";

import { AccountDialogViewModel } from "./AccountDialogViewModel";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";
import { AccountService_T } from "../../model/service/AccountService";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

describe("AccountDialogViewModel", () => {
  let vm: AccountDialogViewModel;

  const accountMock = { id: 1, username: "user", email: "user@test.com" };
  const accountSubject = new BehaviorSubject(accountMock);
  const profilePictureSubject = new BehaviorSubject<Blob | null>(null);

  const authMock = {
    account$: accountSubject,
    refreshAccount: vi.fn(() => Promise.resolve(accountMock)),
    logout$: vi.fn(() => of(true)),
    requestPasswordReset$: vi.fn(() => of(true))
  };

  const accountServiceMock = {
    profilePicture$: profilePictureSubject,
    updateUsername$: vi.fn(() => of(true)),
    updateEmail$: vi.fn(() => of(true)),
    updateProfilePicture: vi.fn(() => of(true)),
    refreshProfilePicture: vi.fn()
  };

  const routerMock = { navigate: vi.fn() };

  const dialogRefMock = { close: vi.fn() };
  const dialogMock = {
    open: vi.fn(() => ({
      afterClosed: () => of("newValue")
    }))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService_T, useValue: authMock },
        { provide: AccountService_T, useValue: accountServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new AccountDialogViewModel());
  });

  it("initializes account signal correctly", () => {
    expect(vm.account()).toEqual(accountMock);
  });

  it("opens change username dialog and updates username", () => {
    vm.changeUsername();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(accountServiceMock.updateUsername$).toHaveBeenCalledWith("newValue");
    expect(authMock.refreshAccount).toHaveBeenCalled();
  });

  it("opens change email dialog and updates email, then logs out", async () => {
    vm.changeEmail();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(accountServiceMock.updateEmail$).toHaveBeenCalledWith("newValue");
    await Promise.resolve();
    expect(authMock.logout$).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it("opens reset password dialog and requests reset", () => {
    vm.resetPassword();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(authMock.requestPasswordReset$).toHaveBeenCalledWith(accountMock.email);
  });

  it("logs out and closes dialog", () => {
    vm.logout();
    expect(authMock.logout$).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it("does nothing if no file selected", () => {
    const event = { target: { files: [] } } as unknown as Event;
    console.log("Will test not to call update profile picture")
    vm.onFileSelected(event);
    expect(accountServiceMock.updateProfilePicture).not.toHaveBeenCalled();
  });

  it("handles file selection and updates profile picture", () => {
    const file = new File(["content"], "test.png", { type: "image/png" });
    const event = { target: { files: [file] } } as unknown as Event;

    vm.onFileSelected(event);
    expect(accountServiceMock.updateProfilePicture).toHaveBeenCalledWith(file);
    expect(accountServiceMock.refreshProfilePicture).toHaveBeenCalled();
  });
});
