import {beforeEach, describe, expect} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {SucceedingNetworkClient} from '../../_test_common/SucceedingNetworkClient';
import {SucceedingAuthenticationService} from '../../_test_common/SucceedingAuthenticationService';
import {NetworkClient_T} from '../../network/NetworkClient';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';
import {firstValueFrom, Observable, of} from 'rxjs';
import {NetworkConversationService} from './NetworkConversationService';
import {Conversation, TargetLanguage} from '../../domain/domain_models';
import {FailingNetworkClient} from '../../_test_common/FailingNetworkClient';

describe("NetworkConversationService", () => {
  let subject: NetworkConversationService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NetworkConversationService,
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

    subject = TestBed.inject(NetworkConversationService)
  })

  //
  // Test factories
  //
  const expectEmitsFirst = async (obs: Observable<any>, expected: any) => {
    expect((await firstValueFrom(obs))).equals(expected)
  }

  const conversation: Conversation = {
    id: "convo-id",
    name: "convo-id",
    targetLanguage: TargetLanguage.PYTHON,
    pinned: false,
    createdAt: "convo-created",
    llmConfig: {
      id: "llm-config-id",
      name: "llm-config-name",
      hasApiKey: true,
      url: "https://example.com"
    },
    messages: [
      {
        id: "message-id",
        prompt: "prompt",
        response: "response",
        secondaryResponse: "sec-response",
        generationMillis: 1000,
        createdAt: "timestamp"
      }
    ]
  }

  it("conversations$ is empty in beginning", () => {
    expect(subject.conversations$.value.length).toEqual(0)
  })

  it("conversations() returns only matching conversation", () => {
    const matching = {
      ...conversation,
      id: "id-1"
    }
    subject.conversations$.next([matching, conversation])

    expectEmitsFirst(subject.conversation("id-1"), matching)
  })

  it("conversations() returns null for non-matching conversation", () => {
    subject.conversations$.next([conversation])

    expectEmitsFirst(subject.conversation("id-1"), null)
  })

  it("delete() returns true when success", () => {
    expectEmitsFirst(subject.delete("id-1"), true)
  })

  it("delete() returns false when success", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.delete("id-1"), false)
  })

  it("refreshConversations() returns false when success", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.refreshConversations(), false)
  })

  it("refreshConversations() uses account$.llmConfigurations", () => {
    const auth = new SucceedingAuthenticationService()
    auth.account$.next({
      id: "id",
      username: "username",
      email: "email",
      isAdmin: true,
      isVerified: true,
      authenticatedViaGoogle: true,
      createdAt: "timestamp",
      llmConfigurations: [{
        id: "llm-1",
        name: "name-1",
        hasApiKey: true,
        url: "url"
      }, {
        id: "llm-2",
        name: "name-2",
        hasApiKey: true,
        url: "url"
      },]
    })
    subject.auth = auth

    const api = new SucceedingNetworkClient()
    api.getConversations$ = () => of([{
      ...SucceedingNetworkClient.conversation,
      llm_model_config_id: "llm-1"
    }])
    subject.api = api

    subject.refreshConversations()
      .subscribe(() => {
        // Now it was updated
        const convos = subject.conversations$.value
        expect(convos.length).toEqual(1)
        expect(convos[0].llmConfig.name).toEqual("name-1")
      })
  })

  it("regenerateMessage() returns true when success", () => {
    expectEmitsFirst(subject.regenerateMessage("id", "prompt"), true)
  })

  it("regenerateMessage() returns false when failure", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.regenerateMessage("id", "prompt"), false)
  })

  it("sendMessage() returns not-null when success", () => {
    expectEmitsFirst(subject.sendMessage("id", "prompt"), SucceedingNetworkClient.message.id)
  })

  it("sendMessage() returns null when failure", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.sendMessage("id", "prompt"), null)
  })

  it("setPinned() returns true when success", () => {
    subject.conversations$.next([conversation])
    expectEmitsFirst(subject.setPinned(conversation.id, false), true)
  })

  it("setPinned() returns false when convo is not found", () => {
    expectEmitsFirst(subject.setPinned(conversation.id, false), false)
  })

  it("updateName() returns true when success", () => {
    subject.conversations$.next([conversation])
    expectEmitsFirst(subject.updateName(conversation.id, "false"), true)
  })

  it("updateName() returns false when failure", () => {
    expectEmitsFirst(subject.updateName("id", "false"), false)
  })

  it("start() returns id on success", () => {
    expectEmitsFirst(subject.start("", conversation.llmConfig, TargetLanguage.PYTHON, ""), SucceedingNetworkClient.conversation.id)
  })

  it("start() returns null on success", () => {
    subject.api = new FailingNetworkClient()
    expectEmitsFirst(subject.start("", conversation.llmConfig, TargetLanguage.PYTHON, ""), null)
  })

})
