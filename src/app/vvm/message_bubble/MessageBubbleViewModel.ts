import {Component, computed, input} from '@angular/core';
import {Conversation, Message, TargetLanguage} from '../../model/domain/domain_models';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CircuitGraphViewModel} from '../circuit-graph/CircuitGraphViewModel';
import {SimulationResultViewModel} from '../simulation-result/SimulationResultViewModel';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatOption} from '@angular/material/select';
import {MatSelect} from '@angular/material/select';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {CodexFormControl} from '../_common/CodexFormControl';

@Component({
  templateUrl: 'MessageBubble.html',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatIconButton,
    MatIcon,
    CircuitGraphViewModel,
    SimulationResultViewModel,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect
  ],
  styleUrl: 'MessageBubble.css',
  selector: 'message-bubble'
})
export class MessageBubbleViewModel {

  /**
   * The message
   */
  public message = input.required<Message>()

  /**
   * The generation time, in seconds, rounded to one decimal
   */
  readonly generationMillis = () => Number((this.message().generationMillis / 1000).toFixed(1));

  /**
   * The parent conversation
   */
  public conversation = input.required<Conversation>()

  /**
   * View mode
   */
  readonly viewMode = new CodexFormControl<'code' | 'visualization' | 'simulation'>('code', [])

  readonly validViewModes = computed(() => {
    const arr = ['code']
    if(this.message().simulationResult != null) {
      arr.push('simulation')
    }
    if(this.message().secondaryResponse != null) {
      arr.push('visualization')
    }
    return arr
  })

  isVisualized = toSignal(this.viewMode.control.valueChanges.pipe(
    map(mode => mode == 'visualization')
  ))
  isSimulated = toSignal(this.viewMode.control.valueChanges.pipe(
    map(mode => mode == 'simulation')
  ))
  isCode = toSignal(this.viewMode.control.valueChanges.pipe(
    map(mode => mode == 'code')
  ))

  /**
   * Whether the message can be visualized (circuit graph)
   */
  readonly canBeVisualized = () => [TargetLanguage.SPICE].includes(this.conversation()?.targetLanguage)
  /**
   * Whether a simulation result is available for this message
   */
  protected readonly hasSimulationResult = () => this.message().simulationResult != null

  protected downloadCode() {

    const blob = new Blob([this.message().response], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const language = this.conversation().targetLanguage
    const fileExt = language == TargetLanguage.SPICE ? '.cir' :
      language == TargetLanguage.JAVA ? '.java' :
        language == TargetLanguage.PYTHON ? '.py' : '.txt'

    const a = document.createElement('a');
    a.href = url;
    a.download = this.message().id + fileExt;
    a.click();

    URL.revokeObjectURL(url);
  }

}
