import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {MatError, MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CodexValidators} from '../_common/CodexValidators';
import {MatIcon} from '@angular/material/icon';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {CodexError} from '../../model/domain/domain_models';
import {genericErrorTranslation} from '../_common/error_translation';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "PasswordReset.html",
  imports: [
    MatButton,
    CardLayout,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslatePipe,
    MatIconButton,
    MatIcon,
    MatSuffix
  ],
  styleUrl: "PasswordReset.css"
})
export class PasswordResetViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router)

  /**
   * The current route.
   */
  private readonly route = inject(ActivatedRoute)

  private readonly auth = inject(AuthenticationService_T)

  /**
   * Whether the password was reset.
   */
  protected readonly reset = signal(false)

  /**
   * A generic error message.
   */
  protected readonly genericError = signal<string | null>(null)

  /**
   * Visibility of the password form field.
   */
  protected readonly passwordVisibility = signal(false)

  /**
   * The password form field.
   */
  protected readonly password = new CodexFormControl("", [CodexValidators.password])

  protected resetPassword() {
    if (this.password.control.invalid)
      return

    const token = this.route.snapshot.params["token"] as string

    const reactYes = () => this.reset.set(true)
    const reactNo = (error: CodexError) => this.genericError.set(genericErrorTranslation(error))

    this.auth.submitPasswordReset(token, this.password.getOrBlank())
      .subscribe(maybe => {
        if (maybe.isYes) reactYes()
        else reactNo(maybe.no())
      })
  }

  protected togglePasswordVisibility() {
    this.passwordVisibility.set(!this.passwordVisibility())
  }

  protected continue() {
    this.router.navigate([""])
  }

}
