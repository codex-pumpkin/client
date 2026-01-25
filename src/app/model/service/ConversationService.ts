import {Observable} from 'rxjs';
import {Conversation, LLMConfig, TargetLanguage} from '../domain/domain_models';
import {inject, InjectionToken} from '@angular/core';
import {NetworkAccountService} from './internal/NetworkAccountService';
import {NetworkConversationService} from './internal/NetworkConversationService';

/**
 * Interface that exposes functionality about conversations.
 */
export interface ConversationService {

  /**
   * All conversations.
   */
  conversations$: Observable<Conversation[]>

  /**
   * Gets a specific conversation.
   */
  conversation(id: string): Observable<Conversation | null>

  /**
   * Starts a conversation.
   * @param prompt The prompt to start it.
   * @param llmConfig The llm to use.
   * @param targetLanguage The target language.
   * @return The id of the created message
   */
  start(prompt: string, llmConfig: LLMConfig, targetLanguage: TargetLanguage, name: string): Observable<string | null>

  /**
   * Updates the name of a conversation.
   * @param id The id.
   * @param name The new name.
   */
  updateName(id: string, name: string): Observable<boolean>

  /**
   * Updates the pinned-status of a conversation.
   * @param id The id.
   * @param pinned Whether the conversation would be pinned
   */
  setPinned(id: string, pinned: boolean): Observable<boolean>

  /**
   * Deletes a conversation.
   * @param id The id.
   */
  delete(id: string): Observable<boolean>

  /**
   * Sends a message to a conversation.
   * @param id The id.
   * @param prompt The prompt to start the message.
   * @return The id of the created message
   */
  sendMessage(id: string, prompt: string): Observable<string | null>

  /**
   * Regenerates a specific message.
   * @param id The id.
   * @param prompt The new prompt.
   */
  regenerateMessage(id: string, prompt: string): Observable<boolean>

  /**
   * Reloads the locally cached conversations.
   */
  refreshConversations(): Observable<boolean>

}

/**
 * Injection token for the ConversationService.
 */
export const ConversationService_T = new InjectionToken<ConversationService>(
  'ConversationService',
  {
    providedIn: 'root',
    factory: () => inject(NetworkConversationService)
  }
)
