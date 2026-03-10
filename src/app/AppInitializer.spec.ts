import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppInitializer } from './AppInitializer';
import { AuthenticationService_T } from './model/authentication/AuthenticationService';
import { EnvironmentLoader_T } from './environment/EnvironmentLoader';
import { ConversationService_T } from './model/service/ConversationService';
import { InformationService_T } from './model/service/InformationService';
import { SettingsManager_T } from './model/settings/SettingsManager';

describe('AppInitializer', () => {
  let subject: AppInitializer;

  const authMock = {
    refreshAccount: vi.fn(),
  };

  const conversationMock = {
    refreshConversations: vi.fn(),
  };

  const infoMock = {
    refreshLLmConfigs: vi.fn(),
    refreshQuota: vi.fn(),
    refreshAnalytics: vi.fn(),
  };

  const settingsMock = {
    settings$: new BehaviorSubject({ isDarkMode: false, language: 'de' as const }),
  };

  const envMock = {
    load: vi.fn(),
    get: vi.fn(),
  };

  const translateMock = {
    addLangs: vi.fn(),
    setFallbackLang: vi.fn(),
    setTranslation: vi.fn(),
    use: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authMock.refreshAccount.mockResolvedValue(true);
    conversationMock.refreshConversations.mockReturnValue(of(true));
    infoMock.refreshLLmConfigs.mockReturnValue(of(true));
    infoMock.refreshQuota.mockReturnValue(of(true));
    infoMock.refreshAnalytics.mockReturnValue(of(true));
    envMock.load.mockReturnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        AppInitializer,
        { provide: AuthenticationService_T, useValue: authMock },
        { provide: ConversationService_T, useValue: conversationMock },
        { provide: InformationService_T, useValue: infoMock },
        { provide: SettingsManager_T, useValue: settingsMock },
        { provide: EnvironmentLoader_T, useValue: envMock },
        { provide: TranslateService, useValue: translateMock },
      ],
    });

    subject = TestBed.inject(AppInitializer);
  });

  it('loads environment, account data, info data, conversations, and translations', async () => {
    await subject.init();

    expect(envMock.load).toHaveBeenCalled();
    expect(authMock.refreshAccount).toHaveBeenCalled();
    expect(infoMock.refreshLLmConfigs).toHaveBeenCalled();
    expect(infoMock.refreshQuota).toHaveBeenCalled();
    expect(infoMock.refreshAnalytics).toHaveBeenCalled();
    expect(conversationMock.refreshConversations).toHaveBeenCalled();
    expect(translateMock.addLangs).toHaveBeenCalledWith(['en', 'de']);
    expect(translateMock.setFallbackLang).toHaveBeenCalledWith('en');
    expect(translateMock.use).toHaveBeenCalledWith('de');
  });
});
