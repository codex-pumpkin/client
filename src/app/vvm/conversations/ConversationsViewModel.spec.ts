import {beforeEach, describe, expect, it, vi} from "vitest";
import {TestBed} from "@angular/core/testing";
import {BehaviorSubject, of} from "rxjs";

import {ConversationsViewModel} from "./ConversationsViewModel";
import {ConversationService_T} from "../../model/service/ConversationService";
import {InformationService_T} from "../../model/service/InformationService";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ChangeDetectorRef} from "@angular/core";
import {Conversation, LLMConfig, LlmError, Maybe, Message, TargetLanguage} from "../../model/domain/domain_models";

const llmConfig: LLMConfig = {
  id: "id",
  modelName: "gpt-4",
  url: "http://example.com",
  name: "ChatGPT",
  hasApiKey: true
}

const msg: Message = {
  id: "id",
  prompt: "Create circuit",
  response: "Here is circuit",
  secondaryResponse: "beep boop",
  generationMillis: 1234,
  createdAt: ""
}

const convo: Conversation = {
  id: "id",
  name: "name",
  targetLanguage: TargetLanguage.JAVA,
  createdAt: "",
  pinned: false,
  llmConfig: llmConfig,
  messages: [msg]
}

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
    conversation: vi.fn(() => new BehaviorSubject<Conversation | null>(convo).asObservable()),
    refreshConversations: vi.fn(() => of(true)),
    sendMessage: vi.fn(() => of(null)),
    start: vi.fn(() => of(Maybe.createYes<string, LlmError>("das")))
  };

  const infoServiceMock = {
    llmConfigurations$: new BehaviorSubject<LLMConfig[]>([])
  };

  const translateMock = {
    instant: vi.fn(() => "Conversation Name")
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
      of(convo)
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
