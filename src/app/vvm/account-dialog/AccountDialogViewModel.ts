import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle,} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {filter, from, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {ChangeUsernameDialogViewModel} from '../change-username-dialog/ChangeUsernameDialogViewModel';
import {AccountService_T} from '../../model/service/AccountService';
import {Router} from '@angular/router';
import {ChangeEmailDialogViewModel} from '../change-email-dialog/ChangeEmailDialogViewModel';
import {ResetPasswordDialogViewModel} from '../reset-password-dialog/ResetPasswordDialogViewModel';
import {MatIcon} from '@angular/material/icon';
import {MatChip} from '@angular/material/chips';

@Component({
  templateUrl: 'AccountDialog.html',
  styleUrl: "AccountDialog.css",
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatDialogActions,
    MatButton,
    MatIconButton,
    MatIcon,
    MatChip,
    MatDialogContent,
    MatDialogTitle
  ],
})
export class AccountDialogViewModel {

  /**
   * The auth service.
   */
  readonly auth = inject(AuthenticationService_T)

  /**
   * The account service.
   */
  readonly accountService = inject(AccountService_T)

  /**
   * The router.
   */
  readonly router = inject(Router)

  /**
   * The dialog handler.
   */
  readonly dialog: MatDialog = inject(MatDialog);

  /**
   * The account.
   */
  account = toSignal(this.auth.account$
    .pipe(
      filter(acc => !!acc)
    ), {initialValue: this.auth.account$.value!})

  /**
   * The profile picture url
   */
  protected readonly profilePicture = toSignal(
    this.accountService.profilePicture$
      .pipe(
        filter(blob => !!blob),
        map(blob => URL.createObjectURL(blob))
      ),
    { initialValue: null }
  )

  /**
   * The dialog reference.
   */
  private readonly dialogRef = inject(MatDialogRef<AccountDialogViewModel>);

  changeUsername() {
    this.dialog.open(ChangeUsernameDialogViewModel, {data: this.account()})
      .afterClosed()
      .subscribe((newUsername: string) => {
        if (newUsername) {
          this.accountService.updateUsername$(newUsername)
            .subscribe(() => {
              from(this.auth.refreshAccount()).subscribe()
            })
        }
      })
  }

  changeEmail() {
    this.dialog.open(ChangeEmailDialogViewModel, {data: this.account()})
      .afterClosed()
      .subscribe((newEmail: string) => {
        if (newEmail) {
          this.accountService.updateEmail$(newEmail)
            .subscribe(() => {
              // The email of the account was changed.
              // Now we need to trigger an authentication, so that an email-verification is sent.
              from(this.auth.refreshAccount())
                .subscribe(suc => {
                  // The refresh was made.
                  // The email should have been sent.
                  // Now we actually log out.
                  this.auth.logout$()
                    .subscribe(() => {
                      this.close(true)
                    })
                })
            })
        }
      })
  }

  resetPassword() {
    this.dialog.open(ResetPasswordDialogViewModel)
      .afterClosed()
      .subscribe(doReset => {
        if (doReset) {
          this.auth.requestPasswordReset$(this.account().email).subscribe()
        }
      })
  }

  logout() {
    this.auth.logout$()
      .subscribe(() => {
        this.close(true)
      })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if(!input.files?.length) return

    const file = input.files[0]

    this.accountService.updateProfilePicture(file)
      .subscribe(res => {
        this.accountService.refreshProfilePicture()
      })
  }

  /**
   * Event handler for the cancel button.
   */
  protected close(navBack: boolean) {
    this.dialogRef.close(navBack);
  }
}
