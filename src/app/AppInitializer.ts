import {inject, Injectable} from '@angular/core';
import {AuthenticationService_T} from './model/authentication/AuthenticationService';
import {EnvironmentLoader_T} from './environment/EnvironmentLoader';
import {firstValueFrom} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import translationEN from '../../public/i18n/en.json';
import translationDE from '../../public/i18n/de.json';
import {ConversationService_T} from './model/service/ConversationService';
import {InformationService_T} from './model/service/InformationService';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';

@Injectable({
  providedIn: "root"
})
export class AppInitializer {

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  /**
   * The conversation service.
   */
  private readonly conversationService = inject(ConversationService_T)

  /**
   * The info service.
   */
  private readonly infoService = inject(InformationService_T)

  /**
   * The environment loader
   */
  private readonly env = inject(EnvironmentLoader_T)

  /**
   * The translation service.
   */
  private readonly translation = inject(TranslateService);

  async init(): Promise<void> {
    console.info(`Will start app initialization`)
    // Environment config
    await firstValueFrom(this.env.load())

    // Account
    await this.auth.refreshAccount()

    // LLM configs, analytics & quota
    await firstValueFrom(this.infoService.refreshLLmConfigs())
    await firstValueFrom(this.infoService.refreshQuota())
    await firstValueFrom(this.infoService.refreshAnalytics())

    // Conversations
    await firstValueFrom(this.conversationService.refreshConversations())

    this.loadTranslations()
  }

  private loadTranslations() {
    this.translation.addLangs(['en', 'de']);
    this.translation.setFallbackLang(this.translation.getBrowserLang() ?? 'en');
    this.translation.setTranslation('en', translationEN);
    this.translation.setTranslation('de', translationDE);
    this.translation.use(this.translation.getBrowserLang() ?? 'en')

    registerLocaleData(localeDe)
    registerLocaleData(localeEn)
  }

}
