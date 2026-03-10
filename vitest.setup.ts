// vitest.setup.ts
import 'zone.js'; // required by Angular
import 'zone.js/testing';
import { beforeEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';

// Initialize Angular testing environment
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);

const createStorage = () => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: createStorage(),
});

beforeEach(() => {
  globalThis.localStorage.clear();
});
