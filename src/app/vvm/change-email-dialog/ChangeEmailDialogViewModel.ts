import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {Account} from '../../model/domain/domain_models';
import {CodexFormControl} from '../_common/CodexFormControl';
import {TranslatePipe} from '@ngx-translate/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatError} from '@angular/material/form-field';
import {CodexValidators} from '../_common/CodexValidators';

@Component({
  templateUrl: 'ChangeEmailDialog.html',
  styleUrl: "ChangeEmailDialog.css",
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    MatDialogTitle,
    MatInput,
    MatButton,
    MatLabel,
    MatError
  ],
})
export class ChangeEmailDialogViewModel {
  /**
   * The account for which the dialog is displayed.
   */
  protected readonly account = inject<Account>(MAT_DIALOG_DATA);

  /**
   * The email in the form.
   */
  protected readonly email = new CodexFormControl<string>(this.account.email, [CodexValidators.email]);

  /**
   * The dialog reference.
   */
  private readonly dialog = inject(MatDialogRef<ChangeEmailDialogViewModel>);

  /**
   * Event handler for the confirm button.
   */
  protected confirm() {
    this.dialog.close(this.email.control.value);
  }

  /**
   * Event handler for the cancel button.
   */
  protected cancel() {
    this.dialog.close();
  }
}
