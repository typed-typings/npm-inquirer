import { Promise } from 'es6-promise';

export function restoreDefaultPrompts (): void;

/**
 * Expose helper functions on the top level for easiest usage by common users
 * @param name
 * @param prompt
 */
export function registerPrompt (name: string, prompt: PromptModule): void;
/**
 * Create a new self-contained prompt module.
 */
export function createPromptModule (): PromptModule;
/**
 * Public CLI helper interface
 * @param questions Questions settings array
 * @param cb Callback being passed the user answers
 * @return
 */
export function prompt (questions: Questions): Promise<Answers>;

export var prompts: Prompts;
export var Separator: objects.SeparatorStatic;

export var ui: {
    BottomBar: UI.BottomBar;
    Prompt: UI.Prompt;
}

export type Prompts = { [name: string]: PromptModule };
export type ChoiceType = string | objects.ChoiceOption | objects.Separator;
export type Questions = Question | Question[];

export interface PromptModule {
  (questions: Questions, cb: (answers: Answers) => any): UI.Prompt;
  /**
   * Register a prompt type
   * @param name Prompt type name
   * @param prompt Prompt constructor
   */
  registerPrompt (name: string, prompt: PromptModule): UI.Prompt;
  /**
   * Register the defaults provider prompts
   */
  restoreDefaultPrompts(): void;
}

export interface Question {
  /**
   * Type of the prompt. Possible values:
   *
   * - input
   * - confirm
   * - list
   * - rawlist
   * - password
   *
   * @defaults: 'input'
   */
  type?: string;
  /**
   * The name to use when storing the answer in the anwers hash.
   */
  name?: string;
  /**
   * The question to print. If defined as a function,
   * the first parameter will be the current inquirer session answers.
   */
  message?: string | ((answers: Answers) => string);
  /**
   * Default value(s) to use if nothing is entered, or a function that returns the default value(s).
   * If defined as a function, the first parameter will be the current inquirer session answers.
   */
  default?: any | ((answers: Answers) => any);
  /**
   * Choices array or a function returning a choices array. If defined as a function,
   * the first parameter will be the current inquirer session answers.
   * Array values can be simple strings, or objects containing a name (to display) and a value properties
   * (to save in the answers hash). Values can also be a Separator.
   */
  choices?: ChoiceType[] | ((answers: Answers) => ChoiceType[]);
  /**
   * Receive the user input and should return true if the value is valid, and an error message (String)
   * otherwise. If false is returned, a default error message is provided.
   */
  validate? (input: string): boolean | string;
  /**
   * Receive the user input and return the filtered value to be used inside the program.
   * The value returned will be added to the Answers hash.
   */
  filter? (input: string): string;
  /**
   * Receive the current user answers hash and should return true or false depending on whether or
   * not this question should be asked. The value can also be a simple boolean.
   */
  when?: boolean | ((answers: Answers) => boolean);
  paginated?: boolean;
}

/**
 * A key/value hash containing the client answers in each prompt.
 */
export interface Answers {
    [key: string]: string | boolean | string[];
}

export namespace UI {
  /**
   * Base interface class other can inherits from
   */
  export class Prompt extends BaseUI <Prompts> {
    constructor (promptModule: Prompts);
    /**
     * Once all prompt are over
     */
    onCompletion (): void;
    processQuestion (question: Question): any;
    fetchAnswer (question: Question): any;
    setDefaultType (question: Question): any;
    filterIfRunnable (question: Question): any;
  }

  /**
   * Sticky bottom bar user interface
   */
  export class BottomBar extends BaseUI <BottomBarOption> {
    constructor (opt?: BottomBarOption);
    /**
     * Render the prompt to screen
     */
    render (): this;
    /**
     * Update the bottom bar content and rerender
     * @param bottomBar Bottom bar content
     */
    updateBottomBar (bottomBar: string): this;
    /**
     * Rerender the prompt
     */
    writeLog (data: any): this;
    /**
     * Make sure line end on a line feed
     * @param str Input string
     * @return The input string with a final line feed
     */
    enforceLF (str: string): string;
    /**
     * Helper for writing message in Prompt
     * @param message The message to be output
     */
    write (message: string): void;
  }

  export interface BottomBarOption {
      bottomBar?: string;
  }

  /**
   * Base interface class other can inherits from
   */
  export class BaseUI<TOpt> {
    constructor (opt: TOpt);
    /**
     * Handle the ^C exit
     * @return {null}
     */
    onForceClose (): void;
    /**
     * Close the interface and cleanup listeners
     */
    close (): void;
    /**
     * Handle and propagate keypress events
     */
    onKeypress (s: string, key: Key): void;
  }

  export interface Key {
    sequence: string;
    name: string;
    meta: boolean;
    shift: boolean;
    ctrl: boolean;
  }
}

export namespace objects {
  /**
   * Choice object
   * Normalize input as choice object
   * @constructor
   * @param {String|Object} val  Choice value. If an object is passed, it should contains
   *                             at least one of `value` or `name` property
   */
  export interface Choice {
    new (str: string): Choice;
    new (separator: Separator): Choice;
    new (option: ChoiceOption): Choice;
  }

  export interface ChoiceOption {
    name?: string;
    value?: string;
    type?: string;
    extra?: any;
    key?: string;
    checked?: boolean;
    disabled?: string | ((answers: Answers) => any);
  }

  export interface SeparatorStatic {
    /**
     * Helper function returning false if object is a separator
     * @param obj object to test against
     * @return `false` if object is a separator
     */
    exclude (obj: any): boolean;
  }

  /**
   * Separator object
   * Used to space/separate choices group
   * @constructor
   * @param {String} line   Separation line content (facultative)
   */
  export interface Separator {
    type: string;
    line: string;
    /**
     * Stringify separator
     * @return {String} the separator display string
     */
    toString(): string;
  }
}
