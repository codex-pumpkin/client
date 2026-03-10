import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangeConversationNameDialogViewModel } from './change-conversation-name-dialog/ChangeConversationNameDialogViewModel';
import { ChangeEmailDialogViewModel } from './change-email-dialog/ChangeEmailDialogViewModel';
import { ChangeUsernameDialogViewModel } from './change-username-dialog/ChangeUsernameDialogViewModel';
import { ResetPasswordDialogViewModel } from './reset-password-dialog/ResetPasswordDialogViewModel';

describe('dialog view models', () => {
  const dialogRef = {
    close: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ChangeEmailDialogViewModel confirms and cancels with the expected values', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { email: 'initial@example.com' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    const subject = TestBed.runInInjectionContext(() => new ChangeEmailDialogViewModel());
    subject.email.control.setValue('next@example.com');

    (subject as any).confirm();
    (subject as any).cancel();

    expect(dialogRef.close).toHaveBeenNthCalledWith(1, 'next@example.com');
    expect(dialogRef.close).toHaveBeenNthCalledWith(2);
  });

  it('ChangeUsernameDialogViewModel confirms and cancels with the expected values', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { username: 'initial-user' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    const subject = TestBed.runInInjectionContext(() => new ChangeUsernameDialogViewModel());
    subject.name.control.setValue('next-user');

    (subject as any).confirm();
    (subject as any).cancel();

    expect(dialogRef.close).toHaveBeenNthCalledWith(1, 'next-user');
    expect(dialogRef.close).toHaveBeenNthCalledWith(2);
  });

  it('ChangeConversationNameDialogViewModel confirms and cancels with the expected values', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { name: 'initial conversation' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    const subject = TestBed.runInInjectionContext(() => new ChangeConversationNameDialogViewModel());
    subject.name.control.setValue('renamed conversation');

    (subject as any).confirm();
    (subject as any).cancel();

    expect(dialogRef.close).toHaveBeenNthCalledWith(1, 'renamed conversation');
    expect(dialogRef.close).toHaveBeenNthCalledWith(2);
  });

  it('ResetPasswordDialogViewModel closes with true for confirm and false for cancel', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    const subject = TestBed.runInInjectionContext(() => new ResetPasswordDialogViewModel());

    (subject as any).confirm();
    (subject as any).cancel();

    expect(dialogRef.close).toHaveBeenNthCalledWith(1, true);
    expect(dialogRef.close).toHaveBeenNthCalledWith(2, false);
  });
});
