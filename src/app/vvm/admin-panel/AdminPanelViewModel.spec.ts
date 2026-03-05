import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { of, BehaviorSubject } from "rxjs";

import { AdminPanelViewModel } from "./AdminPanelViewModel";
import { InformationService_T } from "../../model/service/InformationService";

describe("AdminPanelViewModel", () => {
  let vm: AdminPanelViewModel;

  const quotaSubject = new BehaviorSubject({ admin: 0, member: 0 });
  const analyticsSubject = new BehaviorSubject({ activeUsers: 42 });

  const infoServiceMock = {
    quotaInfo$: quotaSubject,
    analytics$: analyticsSubject,
    setQuota: vi.fn(() => of(true))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: InformationService_T, useValue: infoServiceMock }
      ]
    });

    vm = TestBed.runInInjectionContext(() => new AdminPanelViewModel());
    vm.ngOnInit();
  });

  it("initializes quota controls correctly when quota is zero", () => {
    expect(vm.adminQuotaActive.control.value).toBe(false);
    expect(vm.normalQuotaActive.control.value).toBe(false);

    expect(vm.adminQuota.control.value).toBeNull();
    expect(vm.normalQuota.control.value).toBeNull();

    expect(vm.adminQuota.control.disabled).toBe(true);
    expect(vm.normalQuota.control.disabled).toBe(true);
  });

  it("initializes quota controls correctly when quota is non-zero", () => {
    quotaSubject.next({ admin: 10, member: 5 });
    vm.ngOnInit(); // re-initialize with updated quota

    expect(vm.adminQuotaActive.control.value).toBe(true);
    expect(vm.normalQuotaActive.control.value).toBe(true);

    expect(vm.adminQuota.control.value).toBe(10);
    expect(vm.normalQuota.control.value).toBe(5);

    expect(vm.adminQuota.control.enabled).toBe(true);
    expect(vm.normalQuota.control.enabled).toBe(true);
  });

  it("activates admin quota when toggled on", () => {
    vm.adminQuotaActive.control.setValue(true);

    expect(vm.adminQuota.control.value).toBe(100);
    expect(vm.adminQuota.control.enabled).toBe(true);
  });

  it("deactivates admin quota when toggled off", () => {
    vm.adminQuotaActive.control.setValue(false);

    expect(vm.adminQuota.control.value).toBeNull();
    expect(vm.adminQuota.control.disabled).toBe(true);
  });

  it("activates normal quota when toggled on", () => {
    vm.normalQuotaActive.control.setValue(true);

    expect(vm.normalQuota.control.value).toBe(100);
    expect(vm.normalQuota.control.enabled).toBe(true);
  });

  it("deactivates normal quota when toggled off", () => {
    vm.normalQuotaActive.control.setValue(false);

    expect(vm.normalQuota.control.value).toBeNull();
    expect(vm.normalQuota.control.disabled).toBe(true);
  });

  it("updates infoService when admin quota changes", () => {
    vm.adminQuotaActive.control.setValue(true);
    vm.adminQuota.control.setValue(50);

    expect(infoServiceMock.setQuota).toHaveBeenCalledWith({
      admin: 50,
      member: vm.normalQuota.control.value ?? 0
    });
  });

  it("updates infoService when normal quota changes", () => {
    vm.normalQuotaActive.control.setValue(true);
    vm.normalQuota.control.setValue(25);

    expect(infoServiceMock.setQuota).toHaveBeenCalledWith({
      admin: vm.adminQuota.control.value ?? 0,
      member: 25
    });
  });

  it("does not call setQuota when admin quota is invalid", () => {
    vm.adminQuotaActive.control.setValue(true);
    vm.adminQuota.control.setValue(-1); // invalid, negative

    expect(infoServiceMock.setQuota).not.toHaveBeenCalledWith(
      expect.objectContaining({ admin: -1 })
    );
  });

  it("analytics signal initializes correctly", () => {
    expect(vm.analytics()).toEqual({ activeUsers: 42 });
  });
});
