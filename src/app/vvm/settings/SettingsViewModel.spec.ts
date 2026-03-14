import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { BehaviorSubject, of } from "rxjs";

import { SettingsViewModel } from "./SettingsViewModel";
import { InformationService_T } from "../../model/service/InformationService";
import { AuthenticationService_T } from "../../model/authentication/AuthenticationService";

describe("SettingsViewModel", () => {

  let vm: SettingsViewModel;

  const llmConfigurations$ = new BehaviorSubject<any[]>([]);

  const infoServiceMock = {
    llmConfigurations$,
    deleteLLMConfig$: vi.fn(() => of(null)),
    addLLMConfig: vi.fn(() => of(null)),
    updateLLMConfig: vi.fn(() => of(null)),
    refreshLLmConfigs: vi.fn(() => Promise.resolve())
  };

  const authMock = {};

  beforeEach(() => {
    vi.clearAllMocks();

    llmConfigurations$.next([]);

    TestBed.configureTestingModule({
      providers: [
        {provide: InformationService_T, useValue: infoServiceMock},
        {provide: AuthenticationService_T, useValue: authMock}
      ]
    });

    vm = TestBed.runInInjectionContext(() => new SettingsViewModel());
  });

  it("initializes drafts from existing configs", () => {

    llmConfigurations$.next([
      {
        id: "1",
        name: "Test",
        url: "http://api",
        modelName: "gpt"
      }
    ]);

    vm.ngOnInit();

    const drafts = vm.drafts();

    expect(drafts.length).toBe(1);
    expect(drafts[0].draftId).toBe("1");
    expect(drafts[0].config).not.toBeNull();
  });

  it("adds a new draft", () => {

    vm.ngOnInit();

    vm.addDraft();

    const drafts = vm.drafts();

    expect(drafts.length).toBe(1);
    expect(drafts[0].config).toBeNull();
  });

  it("removes a draft that has no config", () => {

    vm.ngOnInit();
    vm.addDraft();

    const draft = vm.drafts()[0];

    vm.removeDraft(draft);

    expect(vm.drafts().length).toBe(0);
    expect(infoServiceMock.deleteLLMConfig$).not.toHaveBeenCalled();
  });

  it("removes a remote config and calls delete", () => {

    llmConfigurations$.next([
      {
        id: "1",
        name: "Test",
        url: "http://api",
        modelName: "gpt"
      }
    ]);

    vm.ngOnInit();

    const draft = vm.drafts()[0];

    vm.removeDraft(draft);

    expect(infoServiceMock.deleteLLMConfig$).toHaveBeenCalledWith("1");
  });

  it("toggles token visibility", () => {

    vm.ngOnInit();
    vm.addDraft();

    const draft = vm.drafts()[0];

    vm.toggleVisibility(draft.draftId);

    expect(vm.drafts()[0].tokenVisible).toBe(true);

    vm.toggleVisibility(draft.draftId);

    expect(vm.drafts()[0].tokenVisible).toBe(false);
  });

  it("calls addLLMConfig for new drafts", async () => {

    vm.ngOnInit();
    vm.addDraft();

    const draft = vm.drafts()[0];

    draft.name.control.setValue("test");
    draft.modelName.control.setValue("gpt");
    draft.url.control.setValue("http://api");

    vm.safe();

    expect(infoServiceMock.addLLMConfig).toHaveBeenCalled();
  });

  it("calls updateLLMConfig for existing drafts", () => {

    llmConfigurations$.next([
      {
        id: "1",
        name: "Test",
        url: "http://api",
        modelName: "gpt"
      }
    ]);

    vm.ngOnInit();

    const draft = vm.drafts()[0];

    draft.name.control.setValue("changed");

    vm.safe();

    expect(infoServiceMock.updateLLMConfig).toHaveBeenCalled();
  });

})
