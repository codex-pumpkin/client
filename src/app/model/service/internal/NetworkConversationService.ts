import {ConversationService} from '../ConversationService';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, tap} from 'rxjs';
import {Conversation, LLMConfig, TargetLanguage} from '../../domain/domain_models';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';
import {NetworkClient_T} from '../../network/NetworkClient';
import {createConversation} from '../../authentication/internal/mapping';
import {TargetLanguage as TargetLanguageDto} from '../../network/dtos/dtos'

@Injectable({
  providedIn: "root"
})
export class NetworkConversationService implements ConversationService {

  auth = inject(AuthenticationService_T)

  api = inject(NetworkClient_T)

  conversations$: BehaviorSubject<Conversation[]> = new BehaviorSubject<Conversation[]>([]);

  conversation(id: string): Observable<Conversation | null> {
    return this.conversations$
      .pipe(
        map(conversations => {
          const single = conversations.filter(convo => convo.id === id)
          if (single.length == 1) return single[0]
          else return null
        })
      )
  }

  delete(id: string): Observable<boolean> {
    const call = (token: string) => this.api
      .deleteConversation$(id, token)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  refreshConversations(): Observable<boolean> {
    const call = (token: string) => this.api.getConversations$(token)

    return this.auth.safe(call)
      .pipe(
        map(convos => convos.map(convo => createConversation(convo, this.auth.account$.value!.llmConfigurations))),
        tap(convos => this.conversations$.next(convos)),
        map(() => true),
        catchError(() => of(false))
      )
  }

  regenerateMessage(id: string, prompt: string): Observable<boolean> {
    const call = (token: string) => this.api.updateMessage$({
      message: prompt
    }, id, token)

    const res$ = this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )

    return res$
  }

  sendMessage(id: string, prompt: string): Observable<string | null> {
    const call = (token: string) => this.api.addMessage$({message: prompt}, id, token)

    const res$ = this.auth.safe(call)
      .pipe(
        catchError(() => of(null))
      )

    return res$
  }

  setPinned(id: string, pinned: boolean): Observable<boolean> {
    const name = this.conversations$.value.find(convo => convo.id == id)?.name
    if(!name) {
      return of(false)
    }

    const call = (token: string) => this.api.updateConversation$({
      name: name,
      pinned: pinned
    }, id, token)

    const res$ = this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )

    return res$
  }

  start(prompt: string, llmConfig: LLMConfig, targetLanguage: TargetLanguage, name: string): Observable<string | null> {
    let lang: TargetLanguageDto
    switch (targetLanguage) {
      case TargetLanguage.SPICE:
        lang = "spice_netlist"
        break
      case TargetLanguage.JAVA:
        lang = "java"
        break
      case TargetLanguage.PYTHON:
        lang = "python"
        break
    }

    const call = (token: string) => this.api.postConversation$({
      message: prompt,
      llm_model_config_id: llmConfig.id,
      target_language: lang,
      name: name
    }, token)

    const res$ = this.auth.safe(call)
      .pipe(
        map(convo => convo.id),
        catchError(() => of(null))
      )

    return res$
  }

  updateName(id: string, name: string): Observable<boolean> {
    const pinned = this.conversations$.value.find(convo => convo.id == id)?.pinned
    if(pinned === undefined) {
      return of(false)
    }

    const call = (token: string) => this.api.updateConversation$({
      name: name,
      pinned: pinned
    }, id, token)

    const res$ = this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )

    return res$
  }

}
