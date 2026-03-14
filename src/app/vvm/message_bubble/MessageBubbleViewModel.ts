import {Component, input} from '@angular/core';
import {Conversation, Message, TargetLanguage} from '../../model/domain/domain_models';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CircuitGraphViewModel} from '../circuit-graph/CircuitGraphViewModel';
import {SimulationResultViewModel} from '../simulation-result/SimulationResultViewModel';

@Component({
  templateUrl: 'MessageBubble.html',
  imports: [
    TranslatePipe,
    MatSlideToggle,
    ReactiveFormsModule,
    MatIconButton,
    MatIcon,
    CircuitGraphViewModel,
    SimulationResultViewModel
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
  protected readonly generationMillis = () => Number((this.message().generationMillis / 1000).toFixed(1));

  /**
   * The parent conversation
   */
  public conversation = input.required<Conversation>()

  /**
   * Whether the circuit visualization is switched on
   */
  protected readonly isVisualized = new FormControl<boolean>(false)

  /**
   * Whether the simulation result is switched on
   */
  protected readonly isSimulationShown = new FormControl<boolean>(false)

  /**
   * Whether the message can be visualized (circuit graph)
   */
  protected readonly canBeVisualized = () => [TargetLanguage.SPICE].includes(this.conversation()?.targetLanguage)

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