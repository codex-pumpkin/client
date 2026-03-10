import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { BreakpointObserver } from "@angular/cdk/layout";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

import { HomeViewModel } from "./HomeViewModel";
import { SettingsManager_T } from "../../model/settings/SettingsManager";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";
import { AccountService_T } from "../../model/service/AccountService";
import { ConversationService_T } from "../../model/service/ConversationService";
import {BehaviorSubject, of} from 'rxjs';
import { Conversation } from "../../model/domain/domain_models";
import { Maybe } from "../../model/domain/domain_models";

describe("HomeViewModel", () => {

  let vm: HomeViewModel;

  const routerMock = {
    navigate: vi.fn(() => Promise.resolve(true)),
    routeReuseStrategy: {shouldReuseRoute: () => true}
  };

  let dialogCloseValue: unknown = null;
  const dialogMock = {
    open: vi.fn(() => ({
      afterClosed: () => of(dialogCloseValue)
    }))
  };

  const breakpointObserverMock = {
    observe: vi.fn((query?: string | string[]) =>
      of({ matches: false })
    )
  };

  const settingsSubject = new BehaviorSubject({ isDarkMode: false, language: 'en' as const });

  const settingsMock = {
    settings$: settingsSubject,
    setIsDarkMode: vi.fn((isDarkMode: boolean) => settingsSubject.next({ ...settingsSubject.value, isDarkMode })),
    setLanguage: vi.fn((language: 'en' | 'de') => settingsSubject.next({ ...settingsSubject.value, language }))
  };

  const accountSubject = new BehaviorSubject({ id: "1", isAdmin: true });

  const authMock = {
    account$: accountSubject,
    refreshAccount: vi.fn(() => Promise.resolve(true))
  };

  const profilePictureSubject = new BehaviorSubject<Blob | null>(null);

  const accountServiceMock = {
    profilePicture$: profilePictureSubject.asObservable()
  };

  const conversationSubject = new BehaviorSubject<Conversation[]>([]);

  const conversationServiceMock = {
    conversations$: conversationSubject,
    updateName: vi.fn(() => of(true)),
    refreshConversations: vi.fn(() => of(true)),
    delete: vi.fn(() => of(true)),
    setPinned: vi.fn(() => of(true))
  };

  const translateMock = {
    use: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dialogCloseValue = null;
    settingsSubject.next({ isDarkMode: false, language: 'en' });
    accountSubject.next({ id: "1", isAdmin: true });
    conversationSubject.next([]);

    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: routerMock},
        {provide: MatDialog, useValue: dialogMock},
        {provide: BreakpointObserver, useValue: breakpointObserverMock},
        {provide: SettingsManager_T, useValue: settingsMock},
        {provide: AuthenticationService_T, useValue: authMock},
        {provide: AccountService_T, useValue: accountServiceMock},
        {provide: ConversationService_T, useValue: conversationServiceMock},
        {provide: TranslateService, useValue: translateMock}
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

  it("ngOnInit disables route reuse", () => {
    vm.ngOnInit();

    expect(routerMock.routeReuseStrategy.shouldReuseRoute()).toBe(false);
  });

  it("openEditNameDialog updates and refreshes when a new name is returned", () => {
    dialogCloseValue = "Renamed";
    vm.menuConversation.set({ id: "1", name: "Before" } as any);

    (vm as any).openEditNameDialog();

    expect(dialogMock.open).toHaveBeenCalled();
    expect(conversationServiceMock.updateName).toHaveBeenCalledWith("1", "Renamed");
    expect(conversationServiceMock.refreshConversations).toHaveBeenCalled();
  });

  it("openEditNameDialog does nothing when no conversation is selected", () => {
    (vm as any).openEditNameDialog();

    expect(dialogMock.open).not.toHaveBeenCalled();
    expect(conversationServiceMock.updateName).not.toHaveBeenCalled();
  });

  it("deleteMenuConvo deletes, refreshes, and navigates back to the conversation list", () => {
    vm.menuConversation.set({ id: "deadbeef" } as any);

    (vm as any).deleteMenuConvo();

    expect(conversationServiceMock.delete).toHaveBeenCalledWith("deadbeef");
    expect(conversationServiceMock.refreshConversations).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/home/conversations"]);
  });

  it("toggleConvoPin stops propagation and refreshes conversations", () => {
    const stopPropagation = vi.fn();

    (vm as any).toggleConvoPin({ id: "1", pinned: false } as any, { stopPropagation } as unknown as Event);

    expect(stopPropagation).toHaveBeenCalled();
    expect(conversationServiceMock.setPinned).toHaveBeenCalledWith("1", true);
    expect(conversationServiceMock.refreshConversations).toHaveBeenCalled();
  });

  it("toggleLanguage switches the language and updates the translation service", () => {
    (vm as any).toggleLanguage();

    expect(settingsMock.setLanguage).toHaveBeenCalledWith("de");
    expect(translateMock.use).toHaveBeenCalledWith("de");
  });

  it("openAccount navigates to login when the dialog requests it", async () => {
    dialogCloseValue = true;

    vm.openAccount();
    await Promise.resolve();

    expect(dialogMock.open).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/login"]);
  });

})
