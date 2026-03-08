import {Component, inject, OnInit} from '@angular/core';
import {AccountService_T} from '../../model/service/AccountService';
import {LLMConfig} from '../../model/domain/domain_models';
import {BehaviorSubject, firstValueFrom, from} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CodexValidators} from '../_common/CodexValidators';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatError, MatFormField, MatHint, MatSuffix, MatInput, MatLabel} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {InformationService_T} from '../../model/service/InformationService';
import { Validators } from '@angular/forms';

/**
 * Models an llm configuration in the ui-state.
 */
type LLMConfigDraft = {

  /**
   * The actual config it is bound to, or null if it is new
   */
  config: LLMConfig | null,

  /**
   * If this draft belongs to a preexisting config, this is set if a value was changed.
   */
  dirty: boolean,

  /**
   * The token.
   */
  token: CodexFormControl<string>,

  /**
   * The url.
   */
  url: CodexFormControl<string>,

  /**
   * The name given to this config
   */
  name: CodexFormControl<string>,

  /**
   * The model name of the llm.
    */
  modelName: CodexFormControl<string>

  /**
   * Whether the token is visible.
   */
  tokenVisible: boolean,

  /**
   * The id. If it is based on a normal config, this is the normal id.
   */
  draftId: string
}

/**
 * ViewModel for the Settings component.
 */
@Component({
  templateUrl: "Settings.html",
  imports: [
    FormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    TranslatePipe,
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatIconButton,
    MatSuffix,
    MatHint
  ],
  styleUrl: "Settings.css"
})
export class SettingsViewModel implements OnInit {

  /**
   * The information service.
   */
  infoService = inject(InformationService_T)

  /**
   * The auth service.
   */
  auth = inject(AuthenticationService_T)

  private readonly drafts$ = new BehaviorSubject<LLMConfigDraft[]>([])

  readonly drafts = toSignal(this.drafts$, {initialValue: [] as LLMConfigDraft[]})

  ngOnInit() {
    // When the component loads, we initialize the drafts with all existing configs.
    const configs = this.infoService.llmConfigurations$.value ?? []
    const drafts = configs.map(this.createDraftFromConfig)

    console.log("Got drafts")
    console.table(drafts)

    this.drafts$.next(drafts)
  }

  addDraft() {
    const draft = this.createDraft()
    console.log(`Added draft ${JSON.stringify(draft.draftId)}`)
    const drafts = [...this.drafts$.value, draft]
    this.drafts$.next(drafts)
  }

  removeDraft(draft: LLMConfigDraft) {
    // Remove the draft from the state
    this.drafts$.next(this.drafts$.value.filter(d => d.draftId != draft.draftId))

    // If the draft is an actual one, we also delete it
    if (draft.config != null) {
      this.infoService.deleteLLMConfig$(draft.config.id)
        .subscribe()
    }
  }

  safe() {
    const drafts = this.drafts$.value
    if(drafts.some(draft => draft.url.control.invalid || draft.name.control.invalid || draft.modelName.control.invalid)) return

    const promises = drafts.map(draft => {
      if(draft.config == null) { // Add remote one
        console.log("It was non-remote")
        const res$ = this.infoService.addLLMConfig(draft.name.getOrBlank(), draft.modelName.getOrBlank(), draft.url.getOrBlank(), draft.token.control.value)
        return firstValueFrom(res$)
      } else { // Update remote one
        console.log("It was remote")
        const token: string | null = !!draft.token.control.value ? draft.token.control.value : null
        const res$ = this.infoService.updateLLMConfig(draft.config.id, draft.name.getOrBlank(), draft.modelName.getOrBlank(), draft.url.getOrBlank(), token)
        return firstValueFrom(res$)
      }
    })

    const combined = Promise.all(promises)

    from(combined).subscribe(() => { // All hve been added
      console.log("Finished combined")
      from(this.infoService.refreshLLmConfigs()).subscribe(() => { // Account and its LL M's have been refreshed
        // We use all the configs from remote to repopulate the list of
        const newConfigs = this.infoService.llmConfigurations$.value ?? []
        const newDrafts = newConfigs.map(this.createDraftFromConfig)
        this.drafts$.next(newDrafts)
      })
    })
  }

  toggleVisibility(id: string) {
    this.drafts$.next(this.drafts$.value.map(draft => {
      if(draft.draftId == id) {
        return {
          ...draft,
          tokenVisible: !draft.tokenVisible
        }
      } else {
        return draft
      }
    }))
  }

  private readonly createDraftFromConfig = (config: LLMConfig): LLMConfigDraft => ({
    config: config,
    dirty: false,
    token: new CodexFormControl("", []),
    url: new CodexFormControl(config.url, [CodexValidators.url]),
    tokenVisible: false,
    draftId: config.id,
    name: new CodexFormControl(config.name, [CodexValidators.nonempty]),
    modelName: new CodexFormControl(config.modelName, [CodexValidators.nonempty])
  })

  private readonly createDraft = (): LLMConfigDraft => ({
    config: null,
    dirty: false,
    token: new CodexFormControl("", []),
    url: new CodexFormControl("", [
      (control) => {
        if (!control.value) return null;
        return CodexValidators.url(control);
      }
    ]),
    name: new CodexFormControl("", [CodexValidators.nonempty]),
    modelName: new CodexFormControl("", [CodexValidators.nonempty]),
    tokenVisible: false,
    draftId: this.hex()
  })

  private readonly hex = () => Math.random().toString(16).slice(2, 18).padEnd(16, "0");
}
