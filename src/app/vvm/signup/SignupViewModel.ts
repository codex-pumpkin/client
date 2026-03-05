import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {GoogleButton} from '../_common/google-button/GoogleButton';
import {GoogleAuthViewModel} from '../_common/GoogleAuthViewModel';
import {Errors, LoginError, SignupError} from '../../model/domain/domain_models';
import {genericErrorTranslation} from '../_common/error_translation';
import {CodexValidators} from '../_common/CodexValidators';

/**
 * ViewModel for the Signup component.
 */
@Component({
  templateUrl: "Signup.html",
  imports: [
    CardLayout,
    MatFormField,
    ReactiveFormsModule,
    TranslatePipe,
    MatIcon,
    MatIconButton,
    MatIconModule,
    MatButton,
    RouterLink,
    MatInput,
    MatError,
    MatLabel,
    MatDivider,
    GoogleButton,
    MatSuffix
  ],
  styleUrl: "Signup.css"
})
export class SignupViewModel extends GoogleAuthViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router);

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  protected readonly email = new CodexFormControl("", [CodexValidators.email])
  protected readonly username = new CodexFormControl("", [CodexValidators.username])
  protected readonly password = new CodexFormControl("", [CodexValidators.password])
  protected readonly passwordVisible = signal(false)
  protected readonly genericError = signal<string | null>(null)

  protected togglePassword() {
    this.passwordVisible.set(!this.passwordVisible())
  }

  protected signup() {
    console.log("Inside signup() handler")
    this.genericError.set(null)

    const inputs = [this.email, this.username, this.password];
    const anyError = inputs.some((control) => control.control.invalid);
    if (anyError) return;

    const reactNo = (err: SignupError) => {
      console.log("Inside reactNo()")
      switch (err) {
        case Errors.Unknown:
          break;
        case Errors.EmailUsed:
          this.email.setErrorKey("errors.signup.email_used")
          break;
        case Errors.UsernameUsed:
          this.username.setErrorKey("errors.signup.username_used")
          break;
        default:
          this.genericError.set(genericErrorTranslation(err))
      }
    }

    const reactYes = () => {
      console.log("Inside reactYes()")
      this.router.navigate(["/email-not-verified"])
    }

    this.auth.signupWithCredentials$(
      this.email.getOrBlank(),
      this.username.getOrBlank(),
      this.password.getOrBlank()
    ).subscribe(maybe => {
      if (maybe.isYes) reactYes()
      else reactNo(maybe.no())
    })
  }

  protected handleGoogleResponse(response: any): void {
    this.genericError.set(null)
    const code = response.code

    const reactYes = () => {
      console.info("User signed in account via google.")
      this.router.navigate([""])
    }

    const reactNo = (err: LoginError) => {
      if (err == Errors.Authentication) {
        this.genericError.set("errors.signup.invalid_google")
      } else {
        this.genericError.set(genericErrorTranslation(err))
      }
    }

    this.auth.authenticateWithGoogle$(code)
      .subscribe(maybe => {
        if (maybe.isYes) reactYes()
        else reactNo(maybe.no())
      })
  }
}
