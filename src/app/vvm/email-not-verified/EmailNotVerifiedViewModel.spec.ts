import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { EmailNotVerifiedViewModel } from './EmailNotVerifiedViewModel';

describe('EmailNotVerifiedViewModel', () => {
  it('can be created', () => {
    const subject = new EmailNotVerifiedViewModel();

    expect(subject).toBeInstanceOf(EmailNotVerifiedViewModel);
  });
});
