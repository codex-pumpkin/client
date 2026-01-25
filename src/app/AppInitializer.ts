import {inject, Injectable} from '@angular/core';
import {AuthenticationService_T} from './model/authentication/AuthenticationService';
import {EnvironmentLoader_T} from './environment/EnvironmentLoader';
import {firstValueFrom} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import translationEN from '../../public/i18n/en.json';
import translationDE from '../../public/i18n/de.json';
import {ConversationService_T} from './model/service/ConversationService';

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
   * The environment loader
   */
  private readonly env = inject(EnvironmentLoader_T)

  /**
   * The translation service.
   */
  private readonly translation = inject(TranslateService);

  async init(): Promise<void> {
    console.info(`Will start app initialization`)
    await firstValueFrom(this.env.load())
    console.info(`Finished environment loading.`)
    await this.auth.refreshAccount()
    console.info(`Finished account refreshing.`)
    await firstValueFrom(this.conversationService.refreshConversations())
    console.info("Finished conversation reloading.")
    this.loadTranslations()
    console.info(`Finished translation loading.`)
  }

  private loadTranslations() {
    this.translation.addLangs(['en', 'de']);
    this.translation.setFallbackLang('en');
    this.translation.setTranslation('en', translationEN);
    this.translation.setTranslation('de', translationDE);
  }

}
