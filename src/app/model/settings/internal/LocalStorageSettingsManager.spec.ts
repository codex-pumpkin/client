import { beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_SETTINGS, KEY_SETTINGS, LocalStorageSettingsManager } from './LocalStorageSettingsManager';

describe("LocalStorageSettingsManager", () => {
  let subject: LocalStorageSettingsManager

  beforeEach(() => {
    subject = new LocalStorageSettingsManager()
  })

  it("settings$ initialized with initial settings", () => {
    expect(subject.settings$.value).equals(INITIAL_SETTINGS)
  })

  it("toggling dark mode works", () => {
    const before = subject.settings$.value.isDarkMode
    subject.setIsDarkMode(!before)
    const after = subject.settings$.value.isDarkMode

    expect(after).equals(!before)
  })

  it("setLanguage persists a valid language", () => {
    subject.setLanguage('de')

    expect(subject.settings$.value.language).toBe('de')
    expect(localStorage.getItem(KEY_SETTINGS)).toContain('"language":"de"')
  })

  it("falls back to initial settings when persisted content is invalid", () => {
    localStorage.setItem(KEY_SETTINGS, '{"isDarkMode":"yes","language":"bg"}')

    subject = new LocalStorageSettingsManager()

    expect(subject.settings$.value).toEqual(INITIAL_SETTINGS)
    expect(localStorage.getItem(KEY_SETTINGS)).toBe(JSON.stringify(INITIAL_SETTINGS))
  })

})
