import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  templateUrl: 'PromptInput.html',
  imports: [ReactiveFormsModule, MatIconButton, MatIcon, TranslatePipe],
  styleUrl: 'PromptInput.scss',
  selector: 'prompt-input',
})
export class PromptInputViewModel {
  /**
   * The form control for the text field.
   */
  public readonly control = input<FormControl<string | null>>();

  public readonly disabled = input<boolean>();

  /**
   * The handler for when the prompt is sent.
   */
  @Output()
  public onSend = new EventEmitter<void>();
}
