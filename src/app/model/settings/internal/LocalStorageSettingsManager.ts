import {SettingsManager} from '../SettingsManager';
import {Injectable} from '@angular/core';
import {Settings} from '../../domain/domain_models';
import {BehaviorSubject} from 'rxjs';

const INITIAL_SETTINGS: Settings = {
  isDarkMode: false
}

const KEY_SETTINGS = "codex.localstorage.settings"

@Injectable({
  providedIn: "root"
})
export class LocalStorageSettingsManager implements SettingsManager {

  settings$: BehaviorSubject<Settings>

  constructor() {
    this.settings$ = new BehaviorSubject(this.reloadSettings())
  }

  private saveSettings(settings: Settings) {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings))
  }

  private reloadSettings(): Settings {
    const localContent = localStorage.getItem(KEY_SETTINGS)
    const localSettings = JSON.parse(localContent ?? "")

    let toUseSettings: Settings

    try {
      toUseSettings = localSettings as Settings
    } catch {
      toUseSettings = INITIAL_SETTINGS
      this.saveSettings(INITIAL_SETTINGS)
    }

    return toUseSettings
  }

  setIsDarkMode(isDarkMode: boolean): void {
    const current = this.settings$.getValue()
    current.isDarkMode = isDarkMode
    this.saveSettings(current)
    this.reloadSettings()
  }

}
