import { describe, it, beforeEach, vi, expect } from "vitest";
import { TestBed } from "@angular/core/testing";
import { AppInitializer } from "./AppInitializer";
import { AuthenticationService_T } from "./model/authentication/AuthenticationService";
import { EnvironmentLoader_T } from "./environment/EnvironmentLoader";
import { ConversationService_T } from "./model/service/ConversationService";
import { InformationService_T } from "./model/service/InformationService";
import { SettingsManager_T } from "./model/settings/SettingsManager";
import { TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";

describe("AppInitializer", () => {
  let initializer: AppInitializer;

  const authMock = { refreshAccount: vi.fn(() => Promise.resolve()) };
  const envMock = { load: vi.fn(() => of({})) };
  const conversationServiceMock = { refreshConversations: vi.fn(() => of({})) };
  const infoServiceMock = {
    refreshLLmConfigs: vi.fn(() => of({})),
    refreshQuota: vi.fn(() => of({})),
    refreshAnalytics: vi.fn(() => of({})),
  };
  const settingsMock = {
    settings$: { value: { language: "en" } }
  };
  const translateMock = {
    addLangs: vi.fn(),
    setFallbackLang: vi.fn(),
    setTranslation: vi.fn(),
    use: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AppInitializer,
        { provide: AuthenticationService_T, useValue: authMock },
        { provide: EnvironmentLoader_T, useValue: envMock },
        { provide: ConversationService_T, useValue: conversationServiceMock },
        { provide: InformationService_T, useValue: infoServiceMock },
        { provide: SettingsManager_T, useValue: settingsMock },
        { provide: TranslateService, useValue: translateMock },
      ],
    });

    initializer = TestBed.runInInjectionContext(() => new AppInitializer());
  });

  it("runs init without errors and calls dependencies", async () => {
    await initializer.init();

    expect(envMock.load).toHaveBeenCalled();
    expect(authMock.refreshAccount).toHaveBeenCalled();
    expect(infoServiceMock.refreshLLmConfigs).toHaveBeenCalled();
    expect(infoServiceMock.refreshQuota).toHaveBeenCalled();
    expect(infoServiceMock.refreshAnalytics).toHaveBeenCalled();
    expect(conversationServiceMock.refreshConversations).toHaveBeenCalled();

    expect(translateMock.addLangs).toHaveBeenCalledWith(['en', 'de']);
    expect(translateMock.setFallbackLang).toHaveBeenCalledWith('en');
    expect(translateMock.setTranslation).toHaveBeenCalledTimes(2);
    expect(translateMock.use).toHaveBeenCalledWith('en');
  });
});
