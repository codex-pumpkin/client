import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PromptInputViewModel } from './PromptInputViewModel';

describe('PromptInputViewModel', () => {
  it('creates input signals and an output emitter', () => {
    const subject = TestBed.runInInjectionContext(() => new PromptInputViewModel());

    expect(subject.control).toBeDefined();
    expect(subject.disabled).toBeDefined();
    expect(subject.onSend.observed).toBe(false);
  });
});
