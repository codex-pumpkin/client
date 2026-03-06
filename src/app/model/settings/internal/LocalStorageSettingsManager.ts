import {SettingsManager} from '../SettingsManager';
import {Injectable} from '@angular/core';
import {Settings} from '../../domain/domain_models';
import {BehaviorSubject} from 'rxjs';

export const INITIAL_SETTINGS: Settings = {
  isDarkMode: false,
  language: 'en'
}

export const KEY_SETTINGS = "codex.localstorage.settings"

@Injectable({
  providedIn: "root"
})
export class LocalStorageSettingsManager implements SettingsManager {

  settings$: BehaviorSubject<Settings>

  constructor() {

    this.settings$ = new BehaviorSubject(this.reloadSettings())
    console.log("Inside constructor")
  }

  private saveSettings(settings: Settings) {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings))
  }

  private reloadSettings(): Settings {
    const localContent = localStorage.getItem(KEY_SETTINGS)

    if (!localContent) {
      this.saveSettings(INITIAL_SETTINGS)
      return INITIAL_SETTINGS
    }

    try {
      const parsed = JSON.parse(localContent)

      if (
        typeof parsed.isDarkMode === "boolean" &&
        (parsed.language === 'en' || parsed.language === 'de')
      ) {
        return parsed as Settings
      }
    } catch {}

    this.saveSettings(INITIAL_SETTINGS)
    return INITIAL_SETTINGS
  }

  setIsDarkMode(isDarkMode: boolean): void {
    const current = this.settings$.getValue()
    const next = {...current, isDarkMode}
    this.saveSettings(next)
    this.settings$.next(this.reloadSettings())
  }

  setLanguage(language: 'en' | 'de'): void {
    const current = this.settings$.getValue()
    const next = {...current, language}
    this.saveSettings(next)
    this.settings$.next(this.reloadSettings())
  }

}
