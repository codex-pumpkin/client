import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { EnvironmentLoader_T } from '../../environment/EnvironmentLoader';
import { GoogleAuthViewModel } from './GoogleAuthViewModel';

class TestGoogleAuthViewModel extends GoogleAuthViewModel {
  public readonly handleGoogleResponse = vi.fn();
}

describe('GoogleAuthViewModel', () => {
  const requestCode = vi.fn();
  const initCodeClient = vi.fn(() => ({ requestCode }));

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).google = {
      accounts: {
        oauth2: {
          initCodeClient,
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: EnvironmentLoader_T,
          useValue: {
            load: () => of(true),
            get: () => ({ SERVER_BASE_URL: 'https://example.com', GOOGLE_CLIENT_ID: 'google-client-id' }),
          },
        },
      ],
    });
  });

  it('initializes the google client and forwards callbacks to handleGoogleResponse', () => {
    const subject = TestBed.runInInjectionContext(() => new TestGoogleAuthViewModel());

    subject.ngOnInit();
    subject.openGoogleAuth();

    expect(initCodeClient).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'google-client-id',
        scope: 'openid email profile',
        ux_mode: 'popup',
      }),
    );
    expect(requestCode).toHaveBeenCalled();

    const callback = initCodeClient.mock.calls[0][0].callback;
    callback({ code: 'abc' });

    expect(subject.handleGoogleResponse).toHaveBeenCalledWith({ code: 'abc' });
  });
});
