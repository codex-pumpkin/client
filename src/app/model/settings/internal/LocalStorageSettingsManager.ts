import {SettingsManager} from '../SettingsManager';
import {Injectable} from '@angular/core';
import {Settings} from '../../domain/domain_models';
import {BehaviorSubject} from 'rxjs';

export const INITIAL_SETTINGS: Settings = {
  isDarkMode: false
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

      if (typeof parsed.isDarkMode === "boolean") {
        return parsed
      }
    } catch {}

    this.saveSettings(INITIAL_SETTINGS)
    return INITIAL_SETTINGS
  }

  setIsDarkMode(isDarkMode: boolean): void {
    const current = this.settings$.getValue()
    current.isDarkMode = isDarkMode
    this.saveSettings(current)
    this.settings$.next(this.reloadSettings())
  }

}
