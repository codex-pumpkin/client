import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {INITIAL_SETTINGS, KEY_SETTINGS, LocalStorageSettingsManager} from './LocalStorageSettingsManager';
import {TestBed} from '@angular/core/testing';

describe("LocalStorageSettingsManager", () => {
  let subject: LocalStorageSettingsManager

  beforeEach(() => {
    subject = TestBed.inject(LocalStorageSettingsManager)
  })

  afterEach(() => {
    localStorage.removeItem(KEY_SETTINGS)
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

})
