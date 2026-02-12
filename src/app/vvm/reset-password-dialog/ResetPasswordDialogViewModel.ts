import {Component, inject} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle,} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';

@Component({
  templateUrl: 'ResetPasswordDialog.html',
  styleUrl: "ResetPasswordDialog.css",
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButton
  ],
})
export class ResetPasswordDialogViewModel {

  /**
   * The dialog reference.
   */
  private readonly dialog = inject(MatDialogRef<ResetPasswordDialogViewModel>);

  /**
   * Event handler for the confirm button.
   */
  protected confirm() {
    console.log("Reset password but clicked")
    this.dialog.close(true);
  }

  /**
   * Event handler for the cancel button.
   */
  protected cancel() {
    console.log("Reset password cancelled")
    this.dialog.close(false);
  }
}
