import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { BreakpointObserver } from "@angular/cdk/layout";
import { MatDialog } from "@angular/material/dialog";

import { HomeViewModel } from "./HomeViewModel";
import { SettingsManager_T } from "../../model/settings/SettingsManager";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";
import { AccountService_T } from "../../model/service/AccountService";
import { ConversationService_T } from "../../model/service/ConversationService";
import {BehaviorSubject, of} from 'rxjs';
import { Conversation } from "../../model/domain/domain_models";

describe("HomeViewModel", () => {

  let vm: HomeViewModel;

  const routerMock = {
    navigate: vi.fn(),
    routeReuseStrategy: {shouldReuseRoute: () => true}
  };

  const dialogMock = {
    open: vi.fn(() => ({
      afterClosed: () => ({subscribe: vi.fn()})
    }))
  };

  const breakpointObserverMock = {
    observe: vi.fn((query?: string | string[]) =>
      of({ matches: false })
    )
  };

  const settingsSubject = new BehaviorSubject({ isDarkMode: false });

  const settingsMock = {
    settings$: settingsSubject,
    setIsDarkMode: vi.fn()
  };

  const accountSubject = new BehaviorSubject({ id: "1" });

  const authMock = {
    account$: accountSubject.asObservable()
  };

  const profilePictureSubject = new BehaviorSubject<Blob | null>(null);

  const accountServiceMock = {
    profilePicture$: profilePictureSubject.asObservable()
  };

  const conversationSubject = new BehaviorSubject<Conversation[]>([]);

  const conversationServiceMock = {
    conversations$: conversationSubject,
    updateName: vi.fn(() => of(null)),
    refreshConversations: vi.fn(() => of(null)),
    delete: vi.fn(() => of(null)),
    setPinned: vi.fn(() => of(null))
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: routerMock},
        {provide: MatDialog, useValue: dialogMock},
        {provide: BreakpointObserver, useValue: breakpointObserverMock},
        {provide: SettingsManager_T, useValue: settingsMock},
        {provide: AuthenticationService_T, useValue: authMock},
        {provide: AccountService_T, useValue: accountServiceMock},
        {provide: ConversationService_T, useValue: conversationServiceMock}
      ]
    });

    vm = TestBed.runInInjectionContext(() => new HomeViewModel());
  });

  it("toggles searchActive", () => {
    expect(vm.searchActive()).toBe(false);

    vm.toggleSearch();
    expect(vm.searchActive()).toBe(true);

    vm.toggleSearch();
    expect(vm.searchActive()).toBe(false);
  });

  it("toggles dark mode", () => {
    vm.toggleDarkMode();
    expect(settingsMock.setIsDarkMode).toHaveBeenCalledWith(true);
  });

  it("navigates to add conversation", () => {
    vm.addConvo();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/home/conversations"]);
  });

  it("opens conversation", () => {
    const convo = {id: "convo1"} as any;
    vm.openConvo(convo);
    expect(routerMock.navigate).toHaveBeenCalledWith([`/home/conversations/convo1`]);
  });

  it("opens menu for conversation", () => {
    const convo = {id: "convo1"} as any;
    vm.openMenuFor(convo);
    expect(vm.menuConversation()).toBe(convo);
  });

  it("opens settings", () => {
    vm.openSettings();
    expect(routerMock.navigate).toHaveBeenCalledWith(["home/settings"]);
  });

  it("opens admin panel", () => {
    vm.openAdmin();
    expect(routerMock.navigate).toHaveBeenCalledWith(["home/admin-panel"]);
  });

  it("opens account dialog", () => {
    vm.openAccount();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it("pins conversation", () => {
    const convo = {id: "1", pinned: false} as any;
    vm.menuConversation.set(convo);

    vm.pinConvo();
    expect(conversationServiceMock.setPinned).toHaveBeenCalledWith("1", true);
  });

})
