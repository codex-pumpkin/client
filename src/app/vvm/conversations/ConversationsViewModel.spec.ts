import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { BehaviorSubject, of } from "rxjs";

import { ConversationsViewModel } from "./ConversationsViewModel";
import { ConversationService_T } from "../../model/service/ConversationService";
import { InformationService_T } from "../../model/service/InformationService";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NgZone, ChangeDetectorRef } from "@angular/core";
import { TargetLanguage } from "../../model/domain/domain_models";

describe("ConversationsViewModel", () => {

  let vm: ConversationsViewModel;

  const params$ = new BehaviorSubject<any>({});

  const routeMock = {
    params: params$.asObservable()
  };

  const routerMock = {
    navigate: vi.fn()
  };

  const conversationServiceMock = {
    conversation: vi.fn(() => of(null)),
    refreshConversations: vi.fn(() => of(null)),
    sendMessage: vi.fn(() => of("msg")),
    start: vi.fn(() => of({ isYes: false, no: () => null }))
  };

  const infoServiceMock = {
    llmConfigurations$: of([])
  };

  const translateMock = {
    instant: vi.fn(() => "Conversation Name")
  };

  const zoneMock = {
    run: (fn: any) => fn()
  };

  const cdMock = {
    detectChanges: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: ConversationService_T, useValue: conversationServiceMock },
        { provide: InformationService_T, useValue: infoServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: NgZone, useValue: zoneMock },
        { provide: ChangeDetectorRef, useValue: cdMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new ConversationsViewModel());
  });

  it("initializes without id (initial state)", () => {
    vm.ngOnInit();

    params$.next({});

    expect(vm.isInitial()).toBe(true);
    expect(vm.hasLoaded()).toBe(true);
  });

  it("navigates away if conversation does not exist", () => {
    conversationServiceMock.conversation.mockReturnValue(of(null));

    vm.ngOnInit();
    params$.next({ id: "123" });

    expect(routerMock.navigate).toHaveBeenCalledWith(["/home/conversations"]);
  });

  it("loads conversation with messages", () => {
    conversationServiceMock.conversation.mockReturnValue(
      of({
        id: "1",
        messages: [{ id: "m1" }]
      })
    );

    vm.ngOnInit();
    params$.next({ id: "1" });

    expect(vm.hasLoaded()).toBe(true);
    expect(vm.isInitial()).toBe(false);
  });

  it("start() does nothing if prompt invalid", () => {
    vm.start();

    expect(conversationServiceMock.start).not.toHaveBeenCalled();
  });

  it("start() sends message if conversation exists", () => {
    vm.conversation.set({ id: "1", messages: [] } as any);

    vm.prompt.control.setValue("hello");

    vm.start();

    expect(conversationServiceMock.sendMessage).toHaveBeenCalledWith("1", "hello");
  });

  it("start() creates conversation if none exists", () => {
    vm.prompt.control.setValue("hello");
    vm.llmConfig.control.setValue({ id: "cfg" } as any);
    vm.targetLanguage.control.setValue(TargetLanguage.SPICE);

    vm.start();

    expect(conversationServiceMock.start).toHaveBeenCalled();
  });

});
