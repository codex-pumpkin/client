import {ChangeDetectorRef, Component, inject, NgZone, OnInit, Pipe, PipeTransform, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConversationService_T} from '../../model/service/ConversationService';
import {Conversation, Errors, LLMConfig, TargetLanguage} from '../../model/domain/domain_models';
import {map, take, timer} from 'rxjs';
import {InformationService_T} from '../../model/service/InformationService';
import {toSignal} from '@angular/core/rxjs-interop';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CodexValidators} from '../_common/CodexValidators';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {PromptInputViewModel} from '../prompt_input/PromptInputViewModel';
import {MessageBubbleViewModel} from '../message_bubble/MessageBubbleViewModel';
import {formatDate} from '@angular/common';

@Pipe({
  name: 'key'
})
class KeyPipe implements PipeTransform {

  transform(value: TargetLanguage): string {
    return value == TargetLanguage.PYTHON ? 'languages.python.label'
      : value == TargetLanguage.JAVA ? 'languages.java.label'
        : value == TargetLanguage.ENGLISH ? 'languages.english.label'
          : value == TargetLanguage.GERMAN ? 'languages.german.label'
            : 'languages.spice.label'
  }

}

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "Conversations.html",
  imports: [
    MatProgressBar,
    MatFormField,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatLabel,
    TranslatePipe,
    KeyPipe,
    PromptInputViewModel,
    MessageBubbleViewModel
  ],
  styleUrl: "Conversations.css"
})
export class ConversationsViewModel implements OnInit {

  /**
   * The conversation service.
   */
  conversationService = inject(ConversationService_T)

  /**
   * The info service.
   */
  infoService = inject(InformationService_T)

  /**
   * The router
   */
  router = inject(Router)

  translate = inject(TranslateService)

  private readonly ngZone = inject(NgZone)
  private readonly cd = inject(ChangeDetectorRef)

  private readonly route = inject(ActivatedRoute)

  /**
   * Whether the initial state of the screen is loaded.
   */
  protected readonly hasLoaded = signal(false)

  /**
   * Whether the screen is in the initial state for creating a request.
   */
  protected readonly isInitial = signal(false)

  /**
   * Whether the screen is in the initial state for creating a request.
   */
  protected readonly isProcessing = signal(false)

  /**
   * The currently stored conversation.
   */
  protected readonly conversation = signal<Conversation | null>(null)

  /**
   * A generic error key that may have appeared.
   */
  protected readonly genericError = signal<string | null>(null)

  /**
   * The llm-configurations.
   */
  protected readonly llmConfigs = toSignal(
    this.infoService.llmConfigurations$
      .pipe(
        map(configs => configs ?? [])
      ),
    { initialValue: [] as LLMConfig[] }
  )

  /**
   * All available target languages.
   */
  protected readonly TargetLanguages = [
    TargetLanguage.SPICE,
    TargetLanguage.JAVA,
    TargetLanguage.PYTHON,
    TargetLanguage.ENGLISH,
    TargetLanguage.GERMAN
  ]

  /**
   * The selected llm-config.
   */
  protected llmConfig = new CodexFormControl<LLMConfig | null>(null, [CodexValidators.nonnull])

  /**
   * The target language.
   */
  protected targetLanguage = new CodexFormControl<TargetLanguage>(TargetLanguage.SPICE, [CodexValidators.nonnull])

  /**
   * Form control for the prompt input.
   */
  protected prompt = new CodexFormControl<string>("", [CodexValidators.nonempty])

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Contains the ID, or if no ID is given, an empty string, which counts as an invalid id.
      const id = params["id"] as (string | undefined)

      if (id) { // An ID was entered
        this.conversationService.conversation(id)
          .pipe(take(1))
          .subscribe(convo => {
            if (convo) { // The conversation exists
              this.conversation.set(convo)
              if (convo.messages.length == 0) {
                // The conversation does not have any messages.
                // That means, the first message must still be in progress.
                // That means, we are now waiting.
                this.isInitial.set(false)
                this.isProcessing.set(true)
              } else {
                // The conversation has messages.
                // That means, we do a normal display.
                this.isInitial.set(false)
              }

              this.hasLoaded.set(true)
            } else { // The conversation doesn't exist, so we go to the appropriate route
              this.router.navigate(["/home/conversations"])
            }
          })
      } else { // No ID was entered, we go into initial state
        this.conversation.set(null)
        this.isInitial.set(true)
        this.hasLoaded.set(true)
      }
    })

    timer(100, 1000).subscribe(() => {
    const convoBefore = this.conversation()
    this.conversationService.refreshConversations().subscribe(() => {
      this.conversationService.conversation(convoBefore?.id ?? "")
        .pipe(take(1))
        .subscribe(convoAfter => {
          if ((convoAfter?.messages.length ?? -1) > (convoBefore?.messages.length ?? -1)) {
            this.ngZone.run(() => {
              this.isProcessing.set(false)
              this.conversation.set(convoAfter)
              this.cd.detectChanges()
            })
          }
        })
      })
    })
  }

  protected start() {
    if(this.prompt.control.invalid) {
      return
    }

    const prompt = this.prompt.getOrBlank()

    if(this.conversation()) {
      // Set back the prompt
      this.prompt.control.setValue("")

      this.isProcessing.set(true)
      this.isInitial.set(false)

      this.createMessage(prompt)
    } else if (this.llmConfig.control.invalid ||
      this.prompt.control.invalid ||
      this.targetLanguage.control.invalid ||
      this.llmConfig.control.value == null ||
      this.targetLanguage.control.value == null
    ) {
      return
    } else {
      const config = this.llmConfig.control.value
      const language = this.targetLanguage.control.value
      // Set back the prompt
      this.prompt.control.setValue("")

      this.isProcessing.set(true)
      this.isInitial.set(false)

      this.createConvo(prompt, config, language)
    }
  }

  private createMessage(prompt: string) {
    const convo = this.conversation()!

    this.conversationService.sendMessage(convo.id, prompt).subscribe(id => {

    })
  }

  private getDateFormatLanguage() {
    const browser = navigator.language
    const supported = ["en", "de"]
    return supported.includes(browser) ? browser : 'en'
  }

  private createConvo(prompt: string, config: LLMConfig, targetLanguage: TargetLanguage) {
    const date = formatDate(new Date(), 'mediumDate', this.getDateFormatLanguage())
    const convoName = this.translate.instant('conversation.name', { date: date })
    this.conversationService.start(prompt, config, targetLanguage, convoName)
      .subscribe(maybe => {
        if (maybe.isYes) {
          this.conversationService.conversation(maybe.yes())
            .pipe(take(1))
            .subscribe(convo => {
              this.ngZone.run(() => {
                this.conversation.set(convo)
                this.isProcessing.set(false)
                this.cd.detectChanges()
              })
            })
        } else {
          this.ngZone.run(() => {
            if(maybe.no() == Errors.LlmConnection) {
              this.genericError.set('conversations.errors.llm')
            } else {
              this.genericError.set('conversations.errors.other')
            }
            this.isProcessing.set(false)
            this.isInitial.set(true)
            this.cd.detectChanges()
          })
        }
      })
  }
}
