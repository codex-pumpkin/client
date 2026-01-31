import {beforeEach, describe, expect} from 'vitest';
import {NetworkAccountService} from './NetworkAccountService';
import {TestBed} from '@angular/core/testing';
import {SucceedingNetworkClient} from '../../_test_common/SucceedingNetworkClient';
import {SucceedingAuthenticationService} from '../../_test_common/SucceedingAuthenticationService';
import {NetworkClient_T} from '../../network/NetworkClient';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';
import {firstValueFrom, Observable} from 'rxjs';
import {FailingAuthenticationService} from '../../_test_common/FailingAuthenticationService';
import {FailingNetworkClient} from '../../_test_common/FailingNetworkClient';

describe("NetworkAccountService", () => {
  let subject: NetworkAccountService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NetworkAccountService,
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

    subject = TestBed.inject(NetworkAccountService)
  })

  //
  // Test factories
  //
  const expectEmitsFirst = async (obs: Observable<any>, expected: any) => {
    expect((await firstValueFrom(obs))).equals(expected)
  }

  it("profilePicture$ gets updated on account emissions", () => {
    // Initial value of profilePicture is null.
    // So we only need to wait a bit for the first emission to process, and then check if it is non-null

    setTimeout(() => expect(subject.profilePicture$.getValue()).toBeTruthy(), 50)
  })

  it("updateProfilePicture returns true on success", () => {
    expectEmitsFirst(subject.updateProfilePicture(new File([], "")), true)
  })

  it("updateUsername$ returns true on success", () => {
    expectEmitsFirst(subject.updateUsername$(""), true)
  })

  it("updateProfilePicture$ returns false when unsuccessful", () => {
    subject.auth = new FailingAuthenticationService()
    expectEmitsFirst(subject.updateProfilePicture(new File([], "")), false)

    subject.auth = new SucceedingAuthenticationService()
    subject.api = new FailingNetworkClient()

    expectEmitsFirst(subject.updateProfilePicture(new File([], "")), false)
  })

})
