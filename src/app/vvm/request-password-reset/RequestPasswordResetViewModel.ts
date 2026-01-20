import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CodexValidators} from '../_common/CodexValidators';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {CodexError} from '../../model/domain/domain_models';
import {genericErrorTranslation} from '../_common/error_translation';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {TranslatePipe} from '@ngx-translate/core';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';

/**
 * ViewModel for the password reset request screen.
 */
@Component({
  templateUrl: "RequestPasswordReset.html",
  imports: [
    MatButton,
    CardLayout,
    TranslatePipe,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule
  ],
  styleUrl: "RequestPasswordReset.css"
})
export class RequestPasswordResetViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router)

  private readonly auth = inject(AuthenticationService_T)

  /**
   * The email field.
   */
  protected readonly email = new CodexFormControl("", [CodexValidators.email])

  protected readonly genericError = signal<string | null>(null)

  /**
   * Whether the email was sent.
   */
  protected readonly mailSent = signal(false)

  protected requestPasswordReset() {
    this.genericError.set(null)
    if (this.email.control.invalid)
      return

    const reactYes = () => this.mailSent.set(true)
    const reactNo = (err: CodexError) => {
      this.genericError.set(genericErrorTranslation(err))
    }

    this.auth.requestPasswordReset$(this.email.getOrBlank())
      .subscribe(maybe => {
        if (maybe.isYes) reactYes()
        else reactNo(maybe.no())
      })
  }

  protected continue() {
    this.router.navigate([""])
  }

}
