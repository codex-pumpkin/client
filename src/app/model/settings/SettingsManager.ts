import {BehaviorSubject} from 'rxjs';
import {Settings} from '../domain/domain_models';
import {inject, InjectionToken} from '@angular/core';
import {LocalStorageSettingsManager} from './internal/LocalStorageSettingsManager';

/**
 * Functionality for settings
 */
export interface SettingsManager {

  /**
   * Contains the current settings.
   */
  settings$: BehaviorSubject<Settings>

  /**
   * Sets whether dark mode is currently enabled
   */
  setIsDarkMode(isDarkMode: boolean): void

  /**
   * Sets the current UI language.
   */
  setLanguage(language: 'en' | 'de'): void

}

/**
 * Injection token for the SettingsManager
 */
export const SettingsManager_T = new InjectionToken<SettingsManager>(
  'SettingsManager',
  {
    providedIn: 'root',
    factory: () => inject(LocalStorageSettingsManager)
  }
)
