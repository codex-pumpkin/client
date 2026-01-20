import { FormControl, ValidatorFn } from '@angular/forms';

/**
 * Wrapper around a form control that allows easier access to the errors.
 */
export class CodexFormControl<T> {
  public static readonly ERROR_KEY = 'codex.form_control.error';

  /**
   * The control.
   */
  public readonly control: FormControl<T | null>;

  /**
   * Creates a new CodexFormControl.
   * @param initial The initial value.
   * @param validators The validators used.
   */
  constructor(initial: T, validators: ValidatorFn[]) {
    this.control = new FormControl<T>(initial, validators);
  }

  /**
   * Gets the saved value for the ERROR_KEY key.
   */
  errorKey(): string {
    if (!this.control.invalid) {
      throw new Error("Tried to call 'errorKey' while the control was valid.");
    }

    return this.control.errors![CodexFormControl.ERROR_KEY] as string;
  }

  /**
   * Gets the value or a blank string
   */
  getOrBlank() {
    return this.control.value ?? ""
  }

  /**
   * Sets an error.
   * @param key The new error.
   */
  setErrorKey(key: string) {
    this.control.setErrors({ [CodexFormControl.ERROR_KEY]: key });
  }
}
