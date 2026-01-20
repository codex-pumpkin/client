import {CodexError, Errors} from '../../model/domain/domain_models';

/**
 * Provides the generic error key for a specific error.
 */
export const genericErrorTranslation = (error: CodexError) => {
  switch (error) {
    case Errors.Connection:
      return "errors.generic.connection";
    case Errors.Timeout:
      return "errors.generic.timeout";
    case Errors.Permission:
      return "errors.generic.permission";
    case Errors.Authentication:
      return "errors.generic.authentication";
    case Errors.Unknown:
      return "errors.generic.unknown";
  }
}
