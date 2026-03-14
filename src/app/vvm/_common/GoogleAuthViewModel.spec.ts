import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { GoogleAuthViewModel } from "./GoogleAuthViewModel";
import { EnvironmentLoader_T } from "../../environment/EnvironmentLoader";

declare const google: any;

describe("GoogleAuthViewModel", () => {

  let vm: TestGoogleAuthVM;
  let callback: any;

  const envMock = {
    get: vi.fn(() => ({
      GOOGLE_CLIENT_ID: "test-client-id"
    }))
  };

  const requestCodeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global google object
    (globalThis as any).google = {
      accounts: {
        oauth2: {
          initCodeClient: vi.fn((config) => {
            callback = config.callback;
            return {
              requestCode: requestCodeMock
            };
          })
        }
      }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: EnvironmentLoader_T, useValue: envMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new TestGoogleAuthVM());
  });

  it("initializes google client on ngOnInit", () => {
    vm.ngOnInit();

    expect(google.accounts.oauth2.initCodeClient).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "test-client-id",
        scope: "openid email profile",
        ux_mode: "popup",
        callback: expect.any(Function)
      })
    );
  });

  it("calls handleGoogleResponse when callback fires", () => {
    vm.ngOnInit();

    const response = { code: "abc" };
    callback(response);

    expect(vm.handleGoogleResponse).toHaveBeenCalledWith(response);
  });

  it("opens google auth window", () => {
    vm.ngOnInit();

    vm.openGoogleAuth();

    expect(requestCodeMock).toHaveBeenCalled();
  });

});

/**
 * Concrete test implementation of the abstract class
 */
class TestGoogleAuthVM extends GoogleAuthViewModel {
  handleGoogleResponse = vi.fn();
}
