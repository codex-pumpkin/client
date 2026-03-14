import {ValidatorFn} from '@angular/forms';
import {CodexFormControl} from './CodexFormControl';

/**
 * Contains validators for the app.
 */
export class CodexValidators {

  private static readonly EMAIL_REGEX = String.raw`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$`
  private static readonly USERNAME_REGEX = '^[A-Za-z0-9_]{4,32}$'
  // TODO: Make this more secure
  private static readonly PASSWORD_REGEX = String.raw`^[^\s]{4,64}$`

  private static readonly NONEMPTY_REGEX = String.raw`^.{1,999999}$`

  /**
   * Validator for an email input.
   */
  public static readonly email = CodexValidators.pattern(CodexValidators.EMAIL_REGEX, 'errors.validation.format.email')

  /**
   * Validator for a password input.
   */
  public static readonly password = CodexValidators.pattern(CodexValidators.PASSWORD_REGEX, 'errors.validation.format.password')

  /**
   * Validator for a username input.
   */
  public static readonly username = CodexValidators.pattern(CodexValidators.USERNAME_REGEX, 'errors.validation.format.username')

  public static readonly nonempty = CodexValidators.pattern(CodexValidators.NONEMPTY_REGEX, 'errors.validation.format.nonempty')

  /**
   * Validator for a non-null element.
   */
  public static readonly nonnull: ValidatorFn = (elem) => {
    if(elem == null) {
      return this.errorRes("errors.validation.format.nonnull")
    }  else {
      return null
    }
  }
  /**
   * Validator for a integers element.
   */
  public static readonly integer: ValidatorFn = (elem) => {
    if(Number.isInteger(Number(elem.value))) {
      return null
    } else {
      return this.errorRes('errors.validation.format.integer' )
    }
  }
  /**
   * Validator for positive element.
   */
  public static readonly positive: ValidatorFn = (elem) => {
    if(Number(elem.value) <= 0) {
      return this.errorRes("errors.validation.format.positive")
    }  else {
      return null
    }
  }

  /**
   * Creates a validator for checking the format of a url.
   */
  public static url: ValidatorFn = (elem) => {
    const value = elem.value as string;
    
    if (!value || value.trim() === "") return null;
    
    try {
      new URL(value);
      return null;
    } catch (_) {
      return this.errorRes("errors.validation.format.url");
    }
  };

  /**
   * Helper function to create pattern validators.
   * @param pattern The pattern to check against.
   * @param key The error key that should be used.
   * @private
   */
  private static pattern(pattern: string, key: string): ValidatorFn {
    return (elem) => {
      const matches = new RegExp(pattern).test(elem.value as string);
      if (matches) return null;
      else return this.errorRes(key);
    };
  }

  /**
   * Creates the ValidationErrors object with only one error.
   * @param key The error key.
   */
  private static errorRes(key: string) {
    return {[CodexFormControl.ERROR_KEY]: key};
  }
}
