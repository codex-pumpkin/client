import {beforeEach, describe, expect, vi} from 'vitest';
import {EnvironmentLoader} from '../EnvironmentLoader';
import {TestBed} from '@angular/core/testing';
import {AssetEnvironmentLoader} from './AssetEnvironmentLoader';
import {of, throwError} from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('AssetEnvironmentNetworkClient', () => {
  let subject: EnvironmentLoader

  beforeEach(() => {
    const httpClient = {
      get: vi.fn((_: string) => {
        return of({ SERVER_BASE_URL: "test-base-url" })
      })
    }

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssetEnvironmentLoader]
    })

    subject = TestBed.inject(AssetEnvironmentLoader);

    (subject as any).client = httpClient
  })

  it("get() throws when load() not called", () => {
    expect(() => subject.get()).toThrowError()
  })

  it("get() returns environment when load() was called before", () => {
    subject.load().subscribe(_ => {
      expect(subject.get()).toEqual({ SERVER_BASE_URL: "test-base-url" })
    })
  })

  it("load() returns true when success", () => {
    subject.load().subscribe(suc => {
      expect(suc).toBeTruthy()
    })
  })

  it("load() returns false when success", () => {
    (subject as any).client = {
      get: vi.fn((_: string) => {
        return throwError(() => new Error("Test error"))
      })
    }

    subject.load().subscribe(suc => {
      expect(suc).toBeFalsy()
    })
  })

})
