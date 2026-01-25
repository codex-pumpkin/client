import {NetworkConversationService} from './NetworkConversationService';
import {beforeEach, expect} from 'vitest';
import {NetworkClient_T} from '../../network/NetworkClient';
import {SucceedingNetworkClient} from '../../_test_common/SucceedingNetworkClient';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';
import {SucceedingAuthenticationService} from '../../_test_common/SucceedingAuthenticationService';
import {firstValueFrom, Observable} from 'rxjs';
import {NetworkInformationService} from './NetworkInformationService';
import {TestBed} from '@angular/core/testing';
import {FailingNetworkClient} from '../../_test_common/FailingNetworkClient';
import {createAnalytics, createQuotaConfig} from '../../authentication/internal/mapping';

describe("NetworkInformationService", () => {
  let subject: NetworkInformationService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NetworkInformationService,
        {
          provide: NetworkClient_T,
          useValue: new SucceedingNetworkClient()
        },
        {
          provide: AuthenticationService_T,
          useValue: new SucceedingAuthenticationService()
        }
      ]
    })

    subject = TestBed.inject(NetworkInformationService)
  })

  //
  // Test factories
  //
  const expectEmitsFirst = async (obs: Observable<any>, expected: any) => {
    expect((await firstValueFrom(obs))).equals(expected)
  }

  it("analytics$ is null initially", () => {
    expect(subject.analytics$.value).toBeNull()
  })

  it("quotaInfo$ is trivial initially", () => {
    expect(subject.quotaInfo$.value.admin).toEqual(0)
    expect(subject.quotaInfo$.value.member).toEqual(0)
  })

  it("refreshAnalytics$ updates and returns true on success", () => {
    subject.refreshAnalytics().subscribe(res => {
      expect(res).toBeTruthy()
      expect(subject.analytics$.value).toEqual(createAnalytics(SucceedingNetworkClient.analytics))
    })
  })

  it("refreshQuota$ updates and returns true on success", () => {
    subject.refreshQuota().subscribe(res => {
      expect(res).toBeTruthy()
      expect(subject.quotaInfo$.value).toEqual(createQuotaConfig(SucceedingNetworkClient.quota))
    })
  })

  it("refreshQuota$ returns false on failure", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.refreshQuota(), false)
  })

  it("refreshAnalytics returns false on failure", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.refreshAnalytics(), false)
  })

  it("setQuota returns false on failure", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.setQuota({member: 0, admin: 0}), false)
  })

  it("setQuota returns true on success", () => {
    expectEmitsFirst(subject.setQuota({member: 0, admin: 0}), true)
  })
});
