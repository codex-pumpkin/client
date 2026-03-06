/**
 * The languages that can be generated.
 */
export enum TargetLanguage {

  /**
   * Spice netlist code
   */
  SPICE,

  /**
   * Java code
   */
  JAVA,

  /**
   * Python code
   */
  PYTHON,

  /**
   * English text
   */
  ENGLISH,

  /**
   * German text
   */
  GERMAN
}

/**
 * Generic errors that can occur when making a network request
 */
export enum Errors {

  /**
   * Server can't be reached
   */
  Connection,

  /**
   * Request timed out
   */
  Timeout,

  /**
   * No permission for an action
   */
  Permission,

  /**
   * Invalid authentication
   */
  Authentication,

  /**
   * Unknown error
   */
  Unknown,

  /**
   * Email is already in use
   */
  EmailUsed,

  /**
   * Username is already in use
   */
  UsernameUsed,

  /**
   * Connection to llm did not work.
   */
  LlmConnection
}

export type CodexError = Errors.Connection | Errors.Timeout | Errors.Permission | Errors.Authentication | Errors.Unknown
export type SignupError = CodexError | Errors.EmailUsed | Errors.UsernameUsed
export type LoginError = CodexError
export type LoginGoogleError = CodexError
export type LlmError = CodexError | Errors.LlmConnection

/**
 * A summary of analytics.
 */
export type Analytics = {

  /**
   * The number of requests today
   */
  today: number,

  /**
   * The number of requests this month
   */
  thisMonth: number
}

/**
 * The quota configuration
 */
export type QuotaConfig = {

  /**
   * Allowed requests for an admin
   */
  admin: number,

  /**
   * Allowed requests for a member
   */
  member: number

}

/**
 * A conditional class that may be successful ('yes') or unsuccessful ('no')
 */
export class Maybe<Y, N> {

  private readonly valueYes?: Y

  private readonly valueNo?: N

  private readonly isYesInstance: boolean

  private constructor(valueYes?: Y, valueNo?: N) {
    if((valueYes == undefined && valueNo == undefined) || (valueYes && valueNo)) {
      console.log(`Will create maybe with values yes: ${JSON.stringify(valueYes)} and no: ${JSON.stringify(valueNo)}`)
      throw new Error("Maybe needs to be either no or yes")
    }

    this.valueYes = valueYes
    this.valueNo = valueNo
    this.isYesInstance = valueYes != undefined
  }

  /**
   * Creates a 'yes' instance
   * @param yes The 'yes' value
   */
  static createYes<Y, N>(yes: Y): Maybe<Y, N> {
    return new Maybe<Y, N>(yes, undefined)
  }

  /**
   * Creates a 'no' instance
   * @param no The 'no' value
   */
  static createNo<Y, N>(no: N): Maybe<Y, N> {
    return new Maybe<Y, N>(undefined, no)
  }

  /**
   * Creates a maybe whose outcome depends on the null-value of the 'yes' value.
   * @param yes The yes value, that can be null
   * @param alt The no value to use if the yes value is null
   */
  static fromNullable<Y, N>(yes: Y | null, alt: N): Maybe<Y, N> {
    if (yes == null) {
      return this.createNo<Y, N>(alt)
    } else {
      return this.createYes<Y, N>(yes)
    }
  }

  /**
   * Whether the maybe is a 'yes' instance
   */
  get isYes() {
    return this.isYesInstance
  }

  /**
   * Whether the maybe is a 'no' instance
   */
  get isNo() {
    return !this.isYesInstance
  }

  /**
   * Gets the 'yes' value if it is a 'yes' instance
   */
  yes = () => {
    if(this.isYes) {
      return this.valueYes!
    } else {
      throw new Error("Tried to get 'yes' value from a non-'yes' instance.")
    }
  }

  /**
   * Gets the 'no' value if it is a 'no' instance
   */
  no = () => {
    if(this.isNo) {
      return this.valueNo!
    } else {
      throw new Error("Tried to get 'no' value from a non-'no' instance.")
    }
  }

}

/**
 * Bundles information about an LLM model
 */
export type LLMConfig = {

  /**
   * The id of the model config
   */
  id: string,

  /**
   * The name of the model
   */
  name: string,

  /**
   * The model name of the llm
   */
  modelName: string,

  /**
   * The url to the openai api of the model
   */
  url: string,

  /**
   * Whether the model has a configured api key
   */
  hasApiKey: boolean
}

/**
 * Type that contains info about an account
 */
export type Account = {

  /**
   * The id of the account
   */
  id: string,

  /**
   * Username of the account
   */
  username: string,

  /**
   * Mail of the account
   */
  email: string,

  /**
   * Whether the account is an admin
   */
  isAdmin: boolean,

  /**
   * Whether the account is verified
   */
  isVerified: boolean,

  /**
   * Whether the account was created via google
   */
  authenticatedViaGoogle: boolean,

  /**
   * The timestamp on which the account was created
   */
  createdAt: string
}

/**
 * Type that contains info about a message in a conversation
 */
export type Message = {

  /**
   * The id of the message
   */
  id: string,

  /**
   * The prompt the message was started by
   */
  prompt: string,

  /**
   * The textual response of the message
   */
  response: string,

  /**
   * The optional secondary response
   */
  secondaryResponse: string | null,

  /**
   * The time the message took to create
   */
  generationMillis: number,

  /**
   * The timestamp of creation of the message
   */
  createdAt: string
}

/**
 * Type that models a conversation with an llm
 */
export type Conversation = {

  /**
   * The id of the conversation
   */
  id: string,

  /**
   * The name of the conversation
   */
  name: string,

  /**
   * The target language that will be generated
   */
  targetLanguage: TargetLanguage,

  /**
   * Whether the conversation is pinned for the user
   */
  pinned: boolean,

  /**
   * The timestamp on which the conversation was created
   */
  createdAt: string,

  /**
   * The llm config to which the conversation is made to
   */
  llmConfig: LLMConfig,

  /**
   * The messages of which the conversation consists of
   */
  messages: Message[]
}

/**
 * Settings bundled
 */
export type Settings = {

  /**
   * Whether the application is set to dark mode.
   */
  isDarkMode: boolean,

  /**
   * UI language of the application.
   */
  language: 'en' | 'de'

}
