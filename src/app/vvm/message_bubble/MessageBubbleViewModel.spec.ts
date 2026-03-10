import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Conversation, Message, TargetLanguage } from '../../model/domain/domain_models';
import { MessageBubbleViewModel } from './MessageBubbleViewModel';

describe('MessageBubbleViewModel', () => {
  let subject: MessageBubbleViewModel;
  let message: Message;
  let conversation: Conversation;

  beforeEach(() => {
    subject = TestBed.runInInjectionContext(() => new MessageBubbleViewModel());
    message = {
      id: 'msg-1',
      prompt: 'prompt',
      response: 'print("hello")',
      secondaryResponse: null,
      generationMillis: 2345,
      createdAt: '2026-03-10',
    };
    conversation = {
      id: 'conv-1',
      name: 'Conversation',
      targetLanguage: TargetLanguage.SPICE,
      pinned: false,
      createdAt: '2026-03-10',
      llmConfig: {
        id: 'llm-1',
        name: 'Test',
        modelName: 'gpt',
        url: 'https://example.com',
        hasApiKey: true,
      },
      messages: [message],
    };

    (subject as any).message = () => message;
    (subject as any).conversation = () => conversation;
  });

  it('computes generation time in seconds with one decimal place', () => {
    expect((subject as any).generationMillis()).toBe(2.3);
  });

  it('detects when a conversation can be visualized', () => {
    expect((subject as any).canBeVisualized()).toBe(true);

    conversation.targetLanguage = TargetLanguage.JAVA;

    expect((subject as any).canBeVisualized()).toBe(false);
  });

  it('downloads code with the file extension derived from the target language', () => {
    const click = vi.fn();
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      href: '',
      download: '',
    } as unknown as HTMLAnchorElement);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:url'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });

    (subject as any).downloadCode();

    const anchor = createElement.mock.results[0]!.value as HTMLAnchorElement;
    expect(anchor.download).toBe('msg-1.cir');
    expect(anchor.href).toBe('blob:url');
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
  });
});
