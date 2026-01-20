import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {CodexFormControl} from '../_common/CodexFormControl';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput, MatLabel, MatPrefix, MatSuffix} from '@angular/material/input';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {GoogleButton} from '../_common/google-button/GoogleButton';
import {GoogleAuthViewModel} from '../_common/GoogleAuthViewModel';
import {Errors, LoginError} from '../../model/domain/domain_models';
import {genericErrorTranslation} from '../_common/error_translation';

/**
 * ViewModel for the Login component.
 */
@Component({
  templateUrl: "Login.html",
  imports: [
    CardLayout,
    MatFormField,
    ReactiveFormsModule,
    TranslatePipe,
    MatIcon,
    MatIconButton,
    MatButton,
    RouterLink,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatError,
    MatLabel,
    MatDivider,
    GoogleButton
  ],
  styleUrl: "Login.css"
})
export class LoginViewModel extends GoogleAuthViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router);

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  protected readonly identifier = new CodexFormControl("", [])
  protected readonly password = new CodexFormControl("", [])
  protected readonly passwordVisible = signal(false)
  protected readonly genericError = signal<string | null>(null)

  protected togglePassword() {
    this.passwordVisible.set(!this.passwordVisible())
  }

  protected login() {
    this.genericError.set(null)

    const isEmail = this.identifier.getOrBlank().includes('@')

    const reactNo = (err: LoginError) => {
      if (err == Errors.Authentication) {
        this.identifier.setErrorKey("errors.login.invalid")
        this.password.setErrorKey("errors.login.invalid")
      } else {
        this.genericError.set(genericErrorTranslation(err))
      }
    }

    const reactYes = () => {
      console.info("User logged in account via credentials.")
      this.router.navigate([""])
    }

    this.auth.loginWithCredentials$(
      isEmail ? this.identifier.getOrBlank() : null,
      isEmail ? null : this.identifier.getOrBlank(),
      this.password.getOrBlank()
    ).subscribe(maybe => {
      console.log(`Got maybe ${JSON.stringify(maybe)}`)
      if(maybe.isYes) reactYes()
      else reactNo(maybe.no())
    })
  }

  protected signup() {
    this.router.navigate(["signup"])
  }

  protected handleGoogleResponse(response: any): void {
    this.genericError.set(null)
    const code = response.code

    const reactYes = () => {
      console.info("User logged in account via google.")
      this.router.navigate([""])
    }

    const reactNo = (err: LoginError) => {
      if (err == Errors.Authentication) {
        this.genericError.set("errors.login.invalid_google")
      } else {
        this.genericError.set(genericErrorTranslation(err))
      }
    }

    this.auth.authenticateWithGoogle$(code)
      .subscribe(maybe => {
        if(maybe.isYes) reactYes()
        else reactNo(maybe.no())
      })
  }
}
