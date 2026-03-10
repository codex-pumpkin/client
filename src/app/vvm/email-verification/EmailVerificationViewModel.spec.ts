import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthenticationService_T } from '../../model/authentication/AuthenticationService';
import { Maybe } from '../../model/domain/domain_models';
import { EmailVerificationViewModel } from './EmailVerificationViewModel';

describe('EmailVerificationViewModel', () => {
  let subject: EmailVerificationViewModel;

  const routerMock = {
    navigate: vi.fn(),
  };

  const authMock = {
    account$: new BehaviorSubject(null),
    submitEmailVerification$: vi.fn(),
    refreshAccount: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authMock.submitEmailVerification$.mockReturnValue(of(Maybe.createYes(true)));
    authMock.refreshAccount.mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { token: 'verification-token' } } } },
        { provide: AuthenticationService_T, useValue: authMock },
      ],
    });

    subject = TestBed.runInInjectionContext(() => new EmailVerificationViewModel());
  });

  it('submits the route token and stores a success state', async () => {
    subject.ngOnInit();
    await Promise.resolve();

    expect(authMock.submitEmailVerification$).toHaveBeenCalledWith('verification-token');
    expect(authMock.refreshAccount).toHaveBeenCalled();
    expect((subject as any).isSuccess()).toBe(true);
  });

  it('continue navigates to the root route', () => {
    (subject as any).continue();

    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });
});
