/**
 * DTO enum that contains a list of all supported languages.
 */
export type TargetLanguage =
  | 'spice_netlist'
  | 'python'
  | 'java'

/**
 * DTO for the quota configuration.
 */
export type QuotaConfig = {
  member: number
  admin: number
}
