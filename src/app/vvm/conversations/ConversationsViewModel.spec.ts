import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InformationService_T } from '../../model/service/InformationService';
import { ConversationService_T } from '../../model/service/ConversationService';
import { Conversation, Errors, Maybe, TargetLanguage } from '../../model/domain/domain_models';
import { ConversationsViewModel } from './ConversationsViewModel';

vi.mock('rxjs', async () => {
  const actual = await vi.importActual<typeof import('rxjs')>('rxjs');
  return {
    ...actual,
    timer: vi.fn(() => actual.of(0)),
  };
});

describe('ConversationsViewModel', () => {
  const params$ = new BehaviorSubject<Record<string, string | undefined>>({});
  const llmConfigurations$ = new BehaviorSubject([
    { id: 'llm-1', name: 'Main', modelName: 'gpt', url: 'https://example.com', hasApiKey: true },
  ]);

  const routerMock = {
    navigate: vi.fn(),
  };

  const conversationById = new Map<string, Conversation | null>();

  const conversationServiceMock = {
    conversation: vi.fn((id: string) => of(conversationById.get(id) ?? null)),
    refreshConversations: vi.fn(() => of(true)),
    sendMessage: vi.fn(() => of('message-1')),
    start: vi.fn(),
  };

  const infoServiceMock = {
    llmConfigurations$,
  };

  const translateMock = {
    instant: vi.fn(() => 'Conversation Mar 10, 2026'),
  };

  const changeDetectorRefMock = {
    detectChanges: vi.fn(),
  };

  const makeConversation = (overrides?: Partial<Conversation>): Conversation => ({
    id: 'convo-1',
    name: 'Conversation',
    targetLanguage: TargetLanguage.SPICE,
    pinned: false,
    createdAt: '2026-03-10',
    llmConfig: llmConfigurations$.value[0],
    messages: [
      {
        id: 'message-1',
        prompt: 'prompt',
        response: 'response',
        secondaryResponse: null,
        generationMillis: 1000,
        createdAt: '2026-03-10',
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    params$.next({});
    conversationById.clear();
    conversationServiceMock.start.mockReturnValue(of(Maybe.createYes('convo-1')));

    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'en',
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
        { provide: ConversationService_T, useValue: conversationServiceMock },
        { provide: InformationService_T, useValue: infoServiceMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefMock },
      ],
    });
  });

  it('enters initial mode when no conversation id is present', () => {
    const subject = TestBed.runInInjectionContext(() => new ConversationsViewModel());

    subject.ngOnInit();

    expect((subject as any).hasLoaded()).toBe(true);
    expect((subject as any).isInitial()).toBe(true);
    expect((subject as any).conversation()).toBe(null);
  });

  it('loads an existing conversation and marks empty conversations as processing', () => {
    conversationById.set('convo-1', makeConversation({ messages: [] }));
    params$.next({ id: 'convo-1' });

    const subject = TestBed.runInInjectionContext(() => new ConversationsViewModel());
    subject.ngOnInit();

    expect((subject as any).conversation()?.id).toBe('convo-1');
    expect((subject as any).isProcessing()).toBe(true);
    expect((subject as any).isInitial()).toBe(false);
  });

  it('redirects when the requested conversation does not exist', () => {
    params$.next({ id: 'missing' });

    const subject = TestBed.runInInjectionContext(() => new ConversationsViewModel());
    subject.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/home/conversations']);
  });

  it('sends a message for an existing conversation', () => {
    const subject = TestBed.runInInjectionContext(() => new ConversationsViewModel());
    (subject as any).conversation.set(makeConversation());
    (subject as any).prompt.control.setValue('next prompt');

    (subject as any).start();

    expect(conversationServiceMock.sendMessage).toHaveBeenCalledWith('convo-1', 'next prompt');
    expect((subject as any).prompt.control.value).toBe('');
    expect((subject as any).isProcessing()).toBe(true);
  });

  it('creates a new conversation and stores the loaded result on success', () => {
    conversationById.set('convo-1', makeConversation());
    const subject = TestBed.runInInjectionContext(() => new ConversationsViewModel());
    (subject as any).llmConfig.control.setValue(llmConfigurations$.value[0]);
    (subject as any).targetLanguage.control.setValue(TargetLanguage.JAVA);
    (subject as any).prompt.control.setValue('new prompt');

    (subject as any).start();

    expect(conversationServiceMock.start).toHaveBeenCalledWith(
      'new prompt',
      llmConfigurations$.value[0],
      TargetLanguage.JAVA,
      'Conversation Mar 10, 2026',
    );
    expect((subject as any).conversation()?.id).toBe('convo-1');
    expect((subject as any).isProcessing()).toBe(false);
  });

  it('maps llm connection failures to the llm error key', () => {
    conversationServiceMock.start.mockReturnValue(of(Maybe.createNo(Errors.LlmConnection)));
    const subject = TestBed.runInInjectionContext(() => new ConversationsViewModel());
    (subject as any).llmConfig.control.setValue(llmConfigurations$.value[0]);
    (subject as any).targetLanguage.control.setValue(TargetLanguage.SPICE);
    (subject as any).prompt.control.setValue('new prompt');

    (subject as any).start();

    expect((subject as any).genericError()).toBe('conversations.errors.llm');
    expect((subject as any).isInitial()).toBe(true);
    expect((subject as any).isProcessing()).toBe(false);
  });
});
