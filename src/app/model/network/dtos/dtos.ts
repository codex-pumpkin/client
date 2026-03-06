/**
 * DTO enum that contains a list of all supported languages.
 */
export type TargetLanguage =
  | 'spice_netlist'
  | 'python'
  | 'java'
  | 'english'
  | 'german'

/**
 * DTO for the quota configuration.
 */
export type QuotaConfig = {
  member: number
  admin: number
}
