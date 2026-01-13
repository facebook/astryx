import { transformAsync } from '@babel/core';
import * as unist from 'unist';
import { Node as Node$2, Point as Point$2, Position as Position$2, Data as Data$6 } from 'unist';
import * as hast from 'hast';
import { ElementContent as ElementContent$1, Properties, Literal, Data as Data$4, Parent as Parent$1 } from 'hast';
import * as mdast from 'mdast';
import { Parent, BlockContent, DefinitionContent, Data as Data$5, PhrasingContent, Literal as Literal$1 } from 'mdast';
import { Program } from 'estree-jsx';

/**
 * Message.
 */
declare class VFileMessage extends Error {
  constructor(reason: string, options?: Options$5 | null | undefined)
  constructor(
    reason: string,
    parent: Node$1 | NodeLike$1 | null | undefined,
    origin?: string | null | undefined
  )
  constructor(
    reason: string,
    place: Point$1 | Position$1 | null | undefined,
    origin?: string | null | undefined
  )
  constructor(reason: string, origin?: string | null | undefined)
  constructor(
    cause: Error | VFileMessage,
    parent: Node$1 | NodeLike$1 | null | undefined,
    origin?: string | null | undefined
  )
  constructor(
    cause: Error | VFileMessage,
    place: Point$1 | Position$1 | null | undefined,
    origin?: string | null | undefined
  )
  constructor(cause: Error | VFileMessage, origin?: string | null | undefined)
  /**
   * Stack of ancestor nodes surrounding the message.
   *
   * @type {Array<Node> | undefined}
   */
  ancestors: Array<Node$1> | undefined
  /**
   * Starting column of message.
   *
   * @type {number | undefined}
   */
  column: number | undefined
  /**
   * State of problem.
   *
   * * `true` — error, file not usable
   * * `false` — warning, change may be needed
   * * `undefined` — change likely not needed
   *
   * @type {boolean | null | undefined}
   */
  fatal: boolean | null | undefined
  /**
   * Path of a file (used throughout the `VFile` ecosystem).
   *
   * @type {string | undefined}
   */
  file: string | undefined
  /**
   * Starting line of error.
   *
   * @type {number | undefined}
   */
  line: number | undefined
  /**
   * Place of message.
   *
   * @type {Point | Position | undefined}
   */
  place: Point$1 | Position$1 | undefined
  /**
   * Reason for message, should use markdown.
   *
   * @type {string}
   */
  reason: string
  /**
   * Category of message (example: `'my-rule'`).
   *
   * @type {string | undefined}
   */
  ruleId: string | undefined
  /**
   * Namespace of message (example: `'my-package'`).
   *
   * @type {string | undefined}
   */
  source: string | undefined
  /**
   * Specify the source value that’s being reported, which is deemed
   * incorrect.
   *
   * @type {string | undefined}
   */
  actual: string | undefined
  /**
   * Suggest acceptable values that can be used instead of `actual`.
   *
   * @type {Array<string> | undefined}
   */
  expected: Array<string> | undefined
  /**
   * Long form description of the message (you should use markdown).
   *
   * @type {string | undefined}
   */
  note: string | undefined
  /**
   * Link to docs for the message.
   *
   * > 👉 **Note**: this must be an absolute URL that can be passed as `x`
   * > to `new URL(x)`.
   *
   * @type {string | undefined}
   */
  url: string | undefined
}
type Node$1 = unist.Node
type Point$1 = unist.Point
type Position$1 = unist.Position
type NodeLike$1 = object & {
  type: string
  position?: Position$1 | undefined
}
/**
 * Configuration.
 */
type Options$5 = {
  /**
   * Stack of (inclusive) ancestor nodes surrounding the message (optional).
   */
  ancestors?: Array<Node$1> | null | undefined
  /**
   * Original error cause of the message (optional).
   */
  cause?: Error | null | undefined
  /**
   * Place of message (optional).
   */
  place?: Point$1 | Position$1 | null | undefined
  /**
   * Category of message (optional, example: `'my-rule'`).
   */
  ruleId?: string | null | undefined
  /**
   * Namespace of who sent the message (optional, example: `'my-package'`).
   */
  source?: string | null | undefined
}

type Options$4 = Options$5

declare class VFile$1 {
    /**
     * Create a new virtual file.
     *
     * `options` is treated as:
     *
     * *   `string` or `Uint8Array` — `{value: options}`
     * *   `URL` — `{path: options}`
     * *   `VFile` — shallow copies its data over to the new file
     * *   `object` — all fields are shallow copied over to the new file
     *
     * Path related fields are set in the following order (least specific to
     * most specific): `history`, `path`, `basename`, `stem`, `extname`,
     * `dirname`.
     *
     * You cannot set `dirname` or `extname` without setting either `history`,
     * `path`, `basename`, or `stem` too.
     *
     * @param {Compatible | null | undefined} [value]
     *   File value.
     * @returns
     *   New instance.
     */
    constructor(value?: Compatible$2 | null | undefined);
    /**
     * Base of `path` (default: `process.cwd()` or `'/'` in browsers).
     *
     * @type {string}
     */
    cwd: string;
    /**
     * Place to store custom info (default: `{}`).
     *
     * It’s OK to store custom data directly on the file but moving it to
     * `data` is recommended.
     *
     * @type {Data}
     */
    data: Data$3;
    /**
     * List of file paths the file moved between.
     *
     * The first is the original path and the last is the current path.
     *
     * @type {Array<string>}
     */
    history: Array<string>;
    /**
     * List of messages associated with the file.
     *
     * @type {Array<VFileMessage>}
     */
    messages: Array<VFileMessage>;
    /**
     * Raw value.
     *
     * @type {Value}
     */
    value: Value$1;
    /**
     * Source map.
     *
     * This type is equivalent to the `RawSourceMap` type from the `source-map`
     * module.
     *
     * @type {Map | null | undefined}
     */
    map: Map$1 | null | undefined;
    /**
     * Custom, non-string, compiled, representation.
     *
     * This is used by unified to store non-string results.
     * One example is when turning markdown into React nodes.
     *
     * @type {unknown}
     */
    result: unknown;
    /**
     * Whether a file was saved to disk.
     *
     * This is used by vfile reporters.
     *
     * @type {boolean}
     */
    stored: boolean;
    /**
     * Set basename (including extname) (`'index.min.js'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be nullified (use `file.path = file.dirname` instead).
     *
     * @param {string} basename
     *   Basename.
     * @returns {undefined}
     *   Nothing.
     */
    set basename(basename: string);
    /**
     * Get the basename (including extname) (example: `'index.min.js'`).
     *
     * @returns {string | undefined}
     *   Basename.
     */
    get basename(): string | undefined;
    /**
     * Set the full path (example: `'~/index.min.js'`).
     *
     * Cannot be nullified.
     * You can set a file URL (a `URL` object with a `file:` protocol) which will
     * be turned into a path with `url.fileURLToPath`.
     *
     * @param {URL | string} path
     *   Path.
     * @returns {undefined}
     *   Nothing.
     */
    set path(path: string | URL);
    /**
     * Get the full path (example: `'~/index.min.js'`).
     *
     * @returns {string}
     *   Path.
     */
    get path(): string;
    /**
     * Set the parent path (example: `'~'`).
     *
     * Cannot be set if there’s no `path` yet.
     *
     * @param {string | undefined} dirname
     *   Dirname.
     * @returns {undefined}
     *   Nothing.
     */
    set dirname(dirname: string | undefined);
    /**
     * Get the parent path (example: `'~'`).
     *
     * @returns {string | undefined}
     *   Dirname.
     */
    get dirname(): string | undefined;
    /**
     * Set the extname (including dot) (example: `'.js'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be set if there’s no `path` yet.
     *
     * @param {string | undefined} extname
     *   Extname.
     * @returns {undefined}
     *   Nothing.
     */
    set extname(extname: string | undefined);
    /**
     * Get the extname (including dot) (example: `'.js'`).
     *
     * @returns {string | undefined}
     *   Extname.
     */
    get extname(): string | undefined;
    /**
     * Set the stem (basename w/o extname) (example: `'index.min'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be nullified (use `file.path = file.dirname` instead).
     *
     * @param {string} stem
     *   Stem.
     * @returns {undefined}
     *   Nothing.
     */
    set stem(stem: string);
    /**
     * Get the stem (basename w/o extname) (example: `'index.min'`).
     *
     * @returns {string | undefined}
     *   Stem.
     */
    get stem(): string | undefined;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(reason: string, options?: Options$4 | null | undefined): never;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(reason: string, parent: Node$2 | NodeLike | null | undefined, origin?: string | null | undefined): never;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(reason: string, place: Point$2 | Position$2 | null | undefined, origin?: string | null | undefined): never;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(reason: string, origin?: string | null | undefined): never;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(cause: Error | VFileMessage, parent: Node$2 | NodeLike | null | undefined, origin?: string | null | undefined): never;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(cause: Error | VFileMessage, place: Point$2 | Position$2 | null | undefined, origin?: string | null | undefined): never;
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(cause: Error | VFileMessage, origin?: string | null | undefined): never;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(reason: string, options?: Options$4 | null | undefined): VFileMessage;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(reason: string, parent: Node$2 | NodeLike | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(reason: string, place: Point$2 | Position$2 | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(reason: string, origin?: string | null | undefined): VFileMessage;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(cause: Error | VFileMessage, parent: Node$2 | NodeLike | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(cause: Error | VFileMessage, place: Point$2 | Position$2 | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(cause: Error | VFileMessage, origin?: string | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(reason: string, options?: Options$4 | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(reason: string, parent: Node$2 | NodeLike | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(reason: string, place: Point$2 | Position$2 | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(reason: string, origin?: string | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(cause: Error | VFileMessage, parent: Node$2 | NodeLike | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(cause: Error | VFileMessage, place: Point$2 | Position$2 | null | undefined, origin?: string | null | undefined): VFileMessage;
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(cause: Error | VFileMessage, origin?: string | null | undefined): VFileMessage;
    /**
     * Serialize the file.
     *
     * > **Note**: which encodings are supported depends on the engine.
     * > For info on Node.js, see:
     * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
     *
     * @param {string | null | undefined} [encoding='utf8']
     *   Character encoding to understand `value` as when it’s a `Uint8Array`
     *   (default: `'utf-8'`).
     * @returns {string}
     *   Serialized file.
     */
    toString(encoding?: string | null | undefined): string;
}
type NodeLike = object & {
    type: string;
    position?: Position$2 | undefined;
};

// See: <https://github.com/sindresorhus/type-fest/blob/main/source/empty-object.d.ts>
declare const emptyObjectSymbol$2: unique symbol


/**
 * Things that can be passed to the constructor.
 */
type Compatible$2 = Options$3 | URL | VFile$1 | Value$1

/**
 * Raw source map.
 *
 * See:
 * <https://github.com/mozilla/source-map/blob/60adcb0/source-map.d.ts#L15-L23>.
 */
interface Map$1 {
  /**
   * The generated file this source map is associated with.
   */
  file: string
  /**
   * A string of base64 VLQs which contain the actual mappings.
   */
  mappings: string
  /**
   * An array of identifiers which can be referenced by individual mappings.
   */
  names: Array<string>
  /**
   * An array of contents of the original source files.
   */
  sourcesContent?: Array<string> | undefined
  /**
   * The URL root from which all sources are relative.
   */
  sourceRoot?: string | undefined
  /**
   * An array of URLs to the original source files.
   */
  sources: Array<string>
  /**
   * Which version of the source map spec this map is following.
   */
  version: number
}

/**
 * This map registers the type of the `data` key of a `VFile`.
 *
 * This type can be augmented to register custom `data` types.
 *
 * @example
 * declare module 'vfile' {
 *   interface DataMap {
 *     // `file.data.name` is typed as `string`
 *     name: string
 *   }
 * }
 */
interface DataMap {
  [emptyObjectSymbol$2]?: never
}

/**
 * Custom info.
 *
 * Known attributes can be added to {@linkcode DataMap}
 */
type Data$3 = Record<string, unknown> & Partial<DataMap>

/**
 * Configuration.
 */
interface Options$3 {
  /**
   * Arbitrary fields that will be shallow copied over to the new file.
   */
  [key: string]: unknown
  /**
   * Set `basename` (name).
   */
  basename?: string | null | undefined
  /**
   * Set `cwd` (working directory).
   */
  cwd?: string | null | undefined
  /**
   * Set `data` (associated info).
   */
  data?: Data$3 | null | undefined
  /**
   * Set `dirname` (path w/o basename).
   */
  dirname?: string | null | undefined
  /**
   * Set `extname` (extension with dot).
   */
  extname?: string | null | undefined
  /**
   * Set `history` (paths the file moved between).
   */
  history?: Array<string> | null | undefined
  /**
   * Set `path` (current path).
   */
  path?: URL | string | null | undefined
  /**
   * Set `stem` (name without extension).
   */
  stem?: string | null | undefined
  /**
   * Set `value` (the contents of the file).
   */
  value?: Value$1 | null | undefined
}

/**
 * Contents of the file.
 *
 * Can either be text or a `Uint8Array` structure.
 */
type Value$1 = Uint8Array | string

// See: <https://github.com/sindresorhus/type-fest/blob/main/source/empty-object.d.ts>
declare const emptyObjectSymbol$1: unique symbol

/**
 * Interface of known results from compilers.
 *
 * Normally, compilers result in text ({@link Value `Value`} of `vfile`).
 * When you compile to something else, such as a React node (as in,
 * `rehype-react`), you can augment this interface to include that type.
 *
 * ```ts
 * import type {ReactNode} from 'somewhere'
 *
 * declare module 'unified' {
 *   interface CompileResultMap {
 *     // Register a new result (value is used, key should match it).
 *     ReactNode: ReactNode
 *   }
 * }
 *
 * export {} // You may not need this, but it makes sure the file is a module.
 * ```
 *
 * Use {@link CompileResults `CompileResults`} to access the values.
 */
interface CompileResultMap$1 {
  // Note: if `Value` from `VFile` is changed, this should too.
  Uint8Array: Uint8Array
  string: string
}

/**
 * Interface of known data that can be supported by all plugins.
 *
 * Typically, options can be given to a specific plugin, but sometimes it makes
 * sense to have information shared with several plugins.
 * For example, a list of HTML elements that are self-closing, which is needed
 * during all phases.
 *
 * To type this, do something like:
 *
 * ```ts
 * declare module 'unified' {
 *   interface Data {
 *     htmlVoidElements?: Array<string> | undefined
 *   }
 * }
 *
 * export {} // You may not need this, but it makes sure the file is a module.
 * ```
 */
interface Data$2 {
  settings?: Settings$2 | undefined
}

/**
 * Interface of known extra options, that can be supported by parser and
 * compilers.
 *
 * This exists so that users can use packages such as `remark`, which configure
 * both parsers and compilers (in this case `remark-parse` and
 * `remark-stringify`), and still provide options for them.
 *
 * When you make parsers or compilers, that could be packaged up together,
 * you should support `this.data('settings')` as input and merge it with
 * explicitly passed `options`.
 * Then, to type it, using `remark-stringify` as an example, do something like:
 *
 * ```ts
 * declare module 'unified' {
 *   interface Settings {
 *     bullet: '*' | '+' | '-'
 *     // …
 *   }
 * }
 *
 * export {} // You may not need this, but it makes sure the file is a module.
 * ```
 */
interface Settings$2 {
  [emptyObjectSymbol$1]?: never
}

type Middleware = (...input: Array<any>) => any
/**
 * Call all middleware.
 */
type Run = (...input: Array<any>) => void
/**
 * Add `fn` (middleware) to the list.
 */
type Use = (fn: Middleware) => Pipeline$1
/**
 * Middleware.
 */
type Pipeline$1 = {
  run: Run
  use: Use
}

declare const CallableInstance: new <Parameters_1 extends unknown[], Result>(property: string | symbol) => (...parameters: Parameters_1) => Result;

/**
 * @template {Node | undefined} [ParseTree=undefined]
 *   Output of `parse` (optional).
 * @template {Node | undefined} [HeadTree=undefined]
 *   Input for `run` (optional).
 * @template {Node | undefined} [TailTree=undefined]
 *   Output for `run` (optional).
 * @template {Node | undefined} [CompileTree=undefined]
 *   Input of `stringify` (optional).
 * @template {CompileResults | undefined} [CompileResult=undefined]
 *   Output of `stringify` (optional).
 * @extends {CallableInstance<[], Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>>}
 */
declare class Processor<ParseTree extends unist.Node | undefined = undefined, HeadTree extends unist.Node | undefined = undefined, TailTree extends unist.Node | undefined = undefined, CompileTree extends unist.Node | undefined = undefined, CompileResult extends CompileResults | undefined = undefined> extends CallableInstance<[], Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>> {
    /**
     * Create a processor.
     */
    constructor();
    /**
     * Compiler to use (deprecated).
     *
     * @deprecated
     *   Use `compiler` instead.
     * @type {(
     *   Compiler<
     *     CompileTree extends undefined ? Node : CompileTree,
     *     CompileResult extends undefined ? CompileResults : CompileResult
     *   > |
     *   undefined
     * )}
     */
    Compiler: (Compiler<CompileTree extends undefined ? Node : CompileTree, CompileResult extends undefined ? CompileResults : CompileResult> | undefined);
    /**
     * Parser to use (deprecated).
     *
     * @deprecated
     *   Use `parser` instead.
     * @type {(
     *   Parser<ParseTree extends undefined ? Node : ParseTree> |
     *   undefined
     * )}
     */
    Parser: (Parser<ParseTree extends undefined ? Node : ParseTree> | undefined);
    /**
     * Internal list of configured plugins.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {Array<PluginTuple<Array<unknown>>>}
     */
    attachers: Array<[plugin: Plugin<unknown[], undefined, undefined>, ...parameters: unknown[]]>;
    /**
     * Compiler to use.
     *
     * @type {(
     *   Compiler<
     *     CompileTree extends undefined ? Node : CompileTree,
     *     CompileResult extends undefined ? CompileResults : CompileResult
     *   > |
     *   undefined
     * )}
     */
    compiler: (Compiler<CompileTree extends undefined ? Node : CompileTree, CompileResult extends undefined ? CompileResults : CompileResult> | undefined);
    /**
     * Internal state to track where we are while freezing.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {number}
     */
    freezeIndex: number;
    /**
     * Internal state to track whether we’re frozen.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {boolean | undefined}
     */
    frozen: boolean | undefined;
    /**
     * Internal state.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {Data}
     */
    namespace: Data$1;
    /**
     * Parser to use.
     *
     * @type {(
     *   Parser<ParseTree extends undefined ? Node : ParseTree> |
     *   undefined
     * )}
     */
    parser: (Parser<ParseTree extends undefined ? Node : ParseTree> | undefined);
    /**
     * Internal list of configured transformers.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {Pipeline}
     */
    transformers: Pipeline;
    /**
     * Copy a processor.
     *
     * @deprecated
     *   This is a private internal method and should not be used.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   New *unfrozen* processor ({@link Processor `Processor`}) that is
     *   configured to work the same as its ancestor.
     *   When the descendant processor is configured in the future it does not
     *   affect the ancestral processor.
     */
    copy(): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>;
    /**
     * Configure the processor with info available to all plugins.
     * Information is stored in an object.
     *
     * Typically, options can be given to a specific plugin, but sometimes it
     * makes sense to have information shared with several plugins.
     * For example, a list of HTML elements that are self-closing, which is
     * needed during all phases.
     *
     * > 👉 **Note**: setting information cannot occur on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * > 👉 **Note**: to register custom data in TypeScript, augment the
     * > {@link Data `Data`} interface.
     *
     * @example
     *   This example show how to get and set info:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   const processor = unified().data('alpha', 'bravo')
     *
     *   processor.data('alpha') // => 'bravo'
     *
     *   processor.data() // => {alpha: 'bravo'}
     *
     *   processor.data({charlie: 'delta'})
     *
     *   processor.data() // => {charlie: 'delta'}
     *   ```
     *
     * @template {keyof Data} Key
     *
     * @overload
     * @returns {Data}
     *
     * @overload
     * @param {Data} dataset
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Key} key
     * @returns {Data[Key]}
     *
     * @overload
     * @param {Key} key
     * @param {Data[Key]} value
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @param {Data | Key} [key]
     *   Key to get or set, or entire dataset to set, or nothing to get the
     *   entire dataset (optional).
     * @param {Data[Key]} [value]
     *   Value to set (optional).
     * @returns {unknown}
     *   The current processor when setting, the value at `key` when getting, or
     *   the entire dataset when getting without key.
     */
    data<Key extends keyof Data>(): Data$1;
    /**
     * Configure the processor with info available to all plugins.
     * Information is stored in an object.
     *
     * Typically, options can be given to a specific plugin, but sometimes it
     * makes sense to have information shared with several plugins.
     * For example, a list of HTML elements that are self-closing, which is
     * needed during all phases.
     *
     * > 👉 **Note**: setting information cannot occur on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * > 👉 **Note**: to register custom data in TypeScript, augment the
     * > {@link Data `Data`} interface.
     *
     * @example
     *   This example show how to get and set info:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   const processor = unified().data('alpha', 'bravo')
     *
     *   processor.data('alpha') // => 'bravo'
     *
     *   processor.data() // => {alpha: 'bravo'}
     *
     *   processor.data({charlie: 'delta'})
     *
     *   processor.data() // => {charlie: 'delta'}
     *   ```
     *
     * @template {keyof Data} Key
     *
     * @overload
     * @returns {Data}
     *
     * @overload
     * @param {Data} dataset
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Key} key
     * @returns {Data[Key]}
     *
     * @overload
     * @param {Key} key
     * @param {Data[Key]} value
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @param {Data | Key} [key]
     *   Key to get or set, or entire dataset to set, or nothing to get the
     *   entire dataset (optional).
     * @param {Data[Key]} [value]
     *   Value to set (optional).
     * @returns {unknown}
     *   The current processor when setting, the value at `key` when getting, or
     *   the entire dataset when getting without key.
     */
    data<Key extends keyof Data>(dataset: Data$1): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>;
    /**
     * Configure the processor with info available to all plugins.
     * Information is stored in an object.
     *
     * Typically, options can be given to a specific plugin, but sometimes it
     * makes sense to have information shared with several plugins.
     * For example, a list of HTML elements that are self-closing, which is
     * needed during all phases.
     *
     * > 👉 **Note**: setting information cannot occur on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * > 👉 **Note**: to register custom data in TypeScript, augment the
     * > {@link Data `Data`} interface.
     *
     * @example
     *   This example show how to get and set info:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   const processor = unified().data('alpha', 'bravo')
     *
     *   processor.data('alpha') // => 'bravo'
     *
     *   processor.data() // => {alpha: 'bravo'}
     *
     *   processor.data({charlie: 'delta'})
     *
     *   processor.data() // => {charlie: 'delta'}
     *   ```
     *
     * @template {keyof Data} Key
     *
     * @overload
     * @returns {Data}
     *
     * @overload
     * @param {Data} dataset
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Key} key
     * @returns {Data[Key]}
     *
     * @overload
     * @param {Key} key
     * @param {Data[Key]} value
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @param {Data | Key} [key]
     *   Key to get or set, or entire dataset to set, or nothing to get the
     *   entire dataset (optional).
     * @param {Data[Key]} [value]
     *   Value to set (optional).
     * @returns {unknown}
     *   The current processor when setting, the value at `key` when getting, or
     *   the entire dataset when getting without key.
     */
    data<Key extends keyof Data>(key: Key): Data[Key];
    /**
     * Configure the processor with info available to all plugins.
     * Information is stored in an object.
     *
     * Typically, options can be given to a specific plugin, but sometimes it
     * makes sense to have information shared with several plugins.
     * For example, a list of HTML elements that are self-closing, which is
     * needed during all phases.
     *
     * > 👉 **Note**: setting information cannot occur on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * > 👉 **Note**: to register custom data in TypeScript, augment the
     * > {@link Data `Data`} interface.
     *
     * @example
     *   This example show how to get and set info:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   const processor = unified().data('alpha', 'bravo')
     *
     *   processor.data('alpha') // => 'bravo'
     *
     *   processor.data() // => {alpha: 'bravo'}
     *
     *   processor.data({charlie: 'delta'})
     *
     *   processor.data() // => {charlie: 'delta'}
     *   ```
     *
     * @template {keyof Data} Key
     *
     * @overload
     * @returns {Data}
     *
     * @overload
     * @param {Data} dataset
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Key} key
     * @returns {Data[Key]}
     *
     * @overload
     * @param {Key} key
     * @param {Data[Key]} value
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @param {Data | Key} [key]
     *   Key to get or set, or entire dataset to set, or nothing to get the
     *   entire dataset (optional).
     * @param {Data[Key]} [value]
     *   Value to set (optional).
     * @returns {unknown}
     *   The current processor when setting, the value at `key` when getting, or
     *   the entire dataset when getting without key.
     */
    data<Key extends keyof Data>(key: Key, value: Data[Key]): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>;
    /**
     * Freeze a processor.
     *
     * Frozen processors are meant to be extended and not to be configured
     * directly.
     *
     * When a processor is frozen it cannot be unfrozen.
     * New processors working the same way can be created by calling the
     * processor.
     *
     * It’s possible to freeze processors explicitly by calling `.freeze()`.
     * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
     * `.stringify()`, `.process()`, or `.processSync()` are called.
     *
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   The current processor.
     */
    freeze(): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>;
    /**
     * Parse text to a syntax tree.
     *
     * > 👉 **Note**: `parse` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `parse` performs the parse phase, not the run phase or other
     * > phases.
     *
     * @param {Compatible | undefined} [file]
     *   file to parse (optional); typically `string` or `VFile`; any value
     *   accepted as `x` in `new VFile(x)`.
     * @returns {ParseTree extends undefined ? Node : ParseTree}
     *   Syntax tree representing `file`.
     */
    parse(file?: Compatible$1 | undefined): ParseTree extends undefined ? Node : ParseTree;
    /**
     * Process the given file as configured on the processor.
     *
     * > 👉 **Note**: `process` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `process` performs the parse, run, and stringify phases.
     *
     * @overload
     * @param {Compatible | undefined} file
     * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
     * @returns {undefined}
     *
     * @overload
     * @param {Compatible | undefined} [file]
     * @returns {Promise<VFileWithOutput<CompileResult>>}
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`]; any value accepted as
     *   `x` in `new VFile(x)`.
     * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
     *   Callback (optional).
     * @returns {Promise<VFile> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise a promise, rejected with a fatal error or resolved with the
     *   processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > 👉 **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@link CompileResultMap `CompileResultMap`}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    process(file: Compatible$1 | undefined, done: ProcessCallback<VFileWithOutput<CompileResult>>): undefined;
    /**
     * Process the given file as configured on the processor.
     *
     * > 👉 **Note**: `process` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `process` performs the parse, run, and stringify phases.
     *
     * @overload
     * @param {Compatible | undefined} file
     * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
     * @returns {undefined}
     *
     * @overload
     * @param {Compatible | undefined} [file]
     * @returns {Promise<VFileWithOutput<CompileResult>>}
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`]; any value accepted as
     *   `x` in `new VFile(x)`.
     * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
     *   Callback (optional).
     * @returns {Promise<VFile> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise a promise, rejected with a fatal error or resolved with the
     *   processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > 👉 **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@link CompileResultMap `CompileResultMap`}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    process(file?: Compatible$1 | undefined): Promise<VFileWithOutput<CompileResult>>;
    /**
     * Process the given file as configured on the processor.
     *
     * An error is thrown if asynchronous transforms are configured.
     *
     * > 👉 **Note**: `processSync` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `processSync` performs the parse, run, and stringify phases.
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`; any value accepted as
     *   `x` in `new VFile(x)`.
     * @returns {VFileWithOutput<CompileResult>}
     *   The processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > 👉 **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@link CompileResultMap `CompileResultMap`}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    processSync(file?: Compatible$1 | undefined): VFileWithOutput<CompileResult>;
    /**
     * Run *transformers* on a syntax tree.
     *
     * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `run` performs the run phase, not other phases.
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} file
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} [file]
     * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {(
     *   RunCallback<TailTree extends undefined ? Node : TailTree> |
     *   Compatible
     * )} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
     *   Callback (optional).
     * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise, a promise rejected with a fatal error or resolved with the
     *   transformed tree.
     */
    run(tree: HeadTree extends undefined ? Node : HeadTree, done: RunCallback<TailTree extends undefined ? Node : TailTree>): undefined;
    /**
     * Run *transformers* on a syntax tree.
     *
     * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `run` performs the run phase, not other phases.
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} file
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} [file]
     * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {(
     *   RunCallback<TailTree extends undefined ? Node : TailTree> |
     *   Compatible
     * )} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
     *   Callback (optional).
     * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise, a promise rejected with a fatal error or resolved with the
     *   transformed tree.
     */
    run(tree: HeadTree extends undefined ? Node : HeadTree, file: Compatible$1 | undefined, done: RunCallback<TailTree extends undefined ? Node : TailTree>): undefined;
    /**
     * Run *transformers* on a syntax tree.
     *
     * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `run` performs the run phase, not other phases.
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} file
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} [file]
     * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {(
     *   RunCallback<TailTree extends undefined ? Node : TailTree> |
     *   Compatible
     * )} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
     *   Callback (optional).
     * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise, a promise rejected with a fatal error or resolved with the
     *   transformed tree.
     */
    run(tree: HeadTree extends undefined ? Node : HeadTree, file?: Compatible$1 | undefined): Promise<TailTree extends undefined ? Node : TailTree>;
    /**
     * Run *transformers* on a syntax tree.
     *
     * An error is thrown if asynchronous transforms are configured.
     *
     * > 👉 **Note**: `runSync` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `runSync` performs the run phase, not other phases.
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {Compatible | undefined} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @returns {TailTree extends undefined ? Node : TailTree}
     *   Transformed tree.
     */
    runSync(tree: HeadTree extends undefined ? Node : HeadTree, file?: Compatible$1 | undefined): TailTree extends undefined ? Node : TailTree;
    /**
     * Compile a syntax tree.
     *
     * > 👉 **Note**: `stringify` freezes the processor if not already *frozen*.
     *
     * > 👉 **Note**: `stringify` performs the stringify phase, not the run phase
     * > or other phases.
     *
     * @param {CompileTree extends undefined ? Node : CompileTree} tree
     *   Tree to compile.
     * @param {Compatible | undefined} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @returns {CompileResult extends undefined ? Value : CompileResult}
     *   Textual representation of the tree (see note).
     *
     *   > 👉 **Note**: unified typically compiles by serializing: most compilers
     *   > return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@link CompileResultMap `CompileResultMap`}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    stringify(tree: CompileTree extends undefined ? Node : CompileTree, file?: Compatible$1 | undefined): CompileResult extends undefined ? Value : CompileResult;
    /**
     * Configure the processor to use a plugin, a list of usable values, or a
     * preset.
     *
     * If the processor is already using a plugin, the previous plugin
     * configuration is changed based on the options that are passed in.
     * In other words, the plugin is not added a second time.
     *
     * > 👉 **Note**: `use` cannot be called on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * @example
     *   There are many ways to pass plugins to `.use()`.
     *   This example gives an overview:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   unified()
     *     // Plugin with options:
     *     .use(pluginA, {x: true, y: true})
     *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
     *     .use(pluginA, {y: false, z: true})
     *     // Plugins:
     *     .use([pluginB, pluginC])
     *     // Two plugins, the second with options:
     *     .use([pluginD, [pluginE, {}]])
     *     // Preset with plugins and settings:
     *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
     *     // Settings only:
     *     .use({settings: {position: false}})
     *   ```
     *
     * @template {Array<unknown>} [Parameters=[]]
     * @template {Node | string | undefined} [Input=undefined]
     * @template [Output=Input]
     *
     * @overload
     * @param {Preset | null | undefined} [preset]
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {PluggableList} list
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Plugin<Parameters, Input, Output>} plugin
     * @param {...(Parameters | [boolean])} parameters
     * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
     *
     * @param {PluggableList | Plugin | Preset | null | undefined} value
     *   Usable value.
     * @param {...unknown} parameters
     *   Parameters, when a plugin is given as a usable value.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   Current processor.
     */
    use<Parameters_2 extends unknown[] = [], Input extends string | unist.Node | undefined = undefined, Output = Input>(preset?: Preset | null | undefined): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>;
    /**
     * Configure the processor to use a plugin, a list of usable values, or a
     * preset.
     *
     * If the processor is already using a plugin, the previous plugin
     * configuration is changed based on the options that are passed in.
     * In other words, the plugin is not added a second time.
     *
     * > 👉 **Note**: `use` cannot be called on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * @example
     *   There are many ways to pass plugins to `.use()`.
     *   This example gives an overview:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   unified()
     *     // Plugin with options:
     *     .use(pluginA, {x: true, y: true})
     *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
     *     .use(pluginA, {y: false, z: true})
     *     // Plugins:
     *     .use([pluginB, pluginC])
     *     // Two plugins, the second with options:
     *     .use([pluginD, [pluginE, {}]])
     *     // Preset with plugins and settings:
     *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
     *     // Settings only:
     *     .use({settings: {position: false}})
     *   ```
     *
     * @template {Array<unknown>} [Parameters=[]]
     * @template {Node | string | undefined} [Input=undefined]
     * @template [Output=Input]
     *
     * @overload
     * @param {Preset | null | undefined} [preset]
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {PluggableList} list
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Plugin<Parameters, Input, Output>} plugin
     * @param {...(Parameters | [boolean])} parameters
     * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
     *
     * @param {PluggableList | Plugin | Preset | null | undefined} value
     *   Usable value.
     * @param {...unknown} parameters
     *   Parameters, when a plugin is given as a usable value.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   Current processor.
     */
    use<Parameters_2 extends unknown[] = [], Input extends string | unist.Node | undefined = undefined, Output = Input>(list: PluggableList): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>;
    /**
     * Configure the processor to use a plugin, a list of usable values, or a
     * preset.
     *
     * If the processor is already using a plugin, the previous plugin
     * configuration is changed based on the options that are passed in.
     * In other words, the plugin is not added a second time.
     *
     * > 👉 **Note**: `use` cannot be called on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * @example
     *   There are many ways to pass plugins to `.use()`.
     *   This example gives an overview:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   unified()
     *     // Plugin with options:
     *     .use(pluginA, {x: true, y: true})
     *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
     *     .use(pluginA, {y: false, z: true})
     *     // Plugins:
     *     .use([pluginB, pluginC])
     *     // Two plugins, the second with options:
     *     .use([pluginD, [pluginE, {}]])
     *     // Preset with plugins and settings:
     *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
     *     // Settings only:
     *     .use({settings: {position: false}})
     *   ```
     *
     * @template {Array<unknown>} [Parameters=[]]
     * @template {Node | string | undefined} [Input=undefined]
     * @template [Output=Input]
     *
     * @overload
     * @param {Preset | null | undefined} [preset]
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {PluggableList} list
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Plugin<Parameters, Input, Output>} plugin
     * @param {...(Parameters | [boolean])} parameters
     * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
     *
     * @param {PluggableList | Plugin | Preset | null | undefined} value
     *   Usable value.
     * @param {...unknown} parameters
     *   Parameters, when a plugin is given as a usable value.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   Current processor.
     */
    use<Parameters_2 extends unknown[] = [], Input extends string | unist.Node | undefined = undefined, Output = Input>(plugin: Plugin<Parameters_2, Input, Output>, ...parameters: Parameters_2 | [boolean]): UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>;
}
type Pipeline = Pipeline$1;
type Node = unist.Node;
type Compatible$1 = Compatible$2;
type Value = Value$1;
type CompileResultMap = CompileResultMap$1;
type Data$1 = Data$2;
type Settings$1 = Settings$2;
/**
 * Acceptable results from compilers.
 *
 * To register custom results, add them to
 * {@link CompileResultMap `CompileResultMap`}.
 */
type CompileResults = CompileResultMap[keyof CompileResultMap];
/**
 * A **compiler** handles the compiling of a syntax tree to something else
 * (in most cases, text) (TypeScript type).
 *
 * It is used in the stringify phase and called with a {@link Node `Node`}
 * and {@link VFile `VFile`} representation of the document to compile.
 * It should return the textual representation of the given tree (typically
 * `string`).
 *
 * > 👉 **Note**: unified typically compiles by serializing: most compilers
 * > return `string` (or `Uint8Array`).
 * > Some compilers, such as the one configured with
 * > [`rehype-react`][rehype-react], return other values (in this case, a
 * > React tree).
 * > If you’re using a compiler that doesn’t serialize, expect different
 * > result values.
 * >
 * > To register custom results in TypeScript, add them to
 * > {@link CompileResultMap `CompileResultMap`}.
 *
 * [rehype-react]: https://github.com/rehypejs/rehype-react
 */
type Compiler<Tree extends unist.Node = unist.Node, Result extends CompileResults = CompileResults> = (tree: Tree, file: VFile$1) => Result;
/**
 * A **parser** handles the parsing of text to a syntax tree.
 *
 * It is used in the parse phase and is called with a `string` and
 * {@link VFile `VFile`} of the document to parse.
 * It must return the syntax tree representation of the given file
 * ({@link Node `Node`}).
 */
type Parser<Tree extends unist.Node = unist.Node> = (document: string, file: VFile$1) => Tree;
/**
 * Union of the different ways to add plugins and settings.
 */
type Pluggable = (Plugin<Array<any>, any, any> | PluginTuple<Array<any>, any, any> | Preset);
/**
 * List of plugins and presets.
 */
type PluggableList = Array<Pluggable>;
/**
 * Single plugin.
 *
 * Plugins configure the processors they are applied on in the following
 * ways:
 *
 * *   they change the processor, such as the parser, the compiler, or by
 *   configuring data
 * *   they specify how to handle trees and files
 *
 * In practice, they are functions that can receive options and configure the
 * processor (`this`).
 *
 * > 👉 **Note**: plugins are called when the processor is *frozen*, not when
 * > they are applied.
 */
type Plugin<PluginParameters extends unknown[] = [], Input extends string | unist.Node | undefined = unist.Node, Output = Input> = (this: Processor, ...parameters: PluginParameters) => Input extends string ? Output extends Node | undefined ? undefined | void : never : Output extends CompileResults ? Input extends Node | undefined ? undefined | void : never : Transformer<Input extends Node ? Input : Node, Output extends Node ? Output : Node> | undefined | void;
/**
 * Tuple of a plugin and its configuration.
 *
 * The first item is a plugin, the rest are its parameters.
 */
type PluginTuple<TupleParameters extends unknown[] = [], Input extends string | unist.Node | undefined = undefined, Output = undefined> = ([
    plugin: Plugin<TupleParameters, Input, Output>,
    ...parameters: TupleParameters
]);
/**
 * Sharable configuration.
 *
 * They can contain plugins and settings.
 */
type Preset = {
    /**
     * List of plugins and presets (optional).
     */
    plugins?: PluggableList | undefined;
    /**
     * Shared settings for parsers and compilers (optional).
     */
    settings?: Settings$1 | undefined;
};
/**
 * Callback called when the process is done.
 *
 * Called with either an error or a result.
 */
type ProcessCallback<File extends VFile$1 = VFile$1> = (error?: Error | undefined, file?: File | undefined) => undefined;
/**
 * Callback called when transformers are done.
 *
 * Called with either an error or results.
 */
type RunCallback<Tree extends unist.Node = unist.Node> = (error?: Error | undefined, tree?: Tree | undefined, file?: VFile$1 | undefined) => undefined;
/**
 * Callback passed to transforms.
 *
 * If the signature of a `transformer` accepts a third argument, the
 * transformer may perform asynchronous operations, and must call it.
 */
type TransformCallback<Output extends unist.Node = unist.Node> = (error?: Error | undefined, tree?: Output | undefined, file?: VFile$1 | undefined) => undefined;
/**
 * Transformers handle syntax trees and files.
 *
 * They are functions that are called each time a syntax tree and file are
 * passed through the run phase.
 * When an error occurs in them (either because it’s thrown, returned,
 * rejected, or passed to `next`), the process stops.
 *
 * The run phase is handled by [`trough`][trough], see its documentation for
 * the exact semantics of these functions.
 *
 * > 👉 **Note**: you should likely ignore `next`: don’t accept it.
 * > it supports callback-style async work.
 * > But promises are likely easier to reason about.
 *
 * [trough]: https://github.com/wooorm/trough#function-fninput-next
 */
type Transformer<Input extends unist.Node = unist.Node, Output extends unist.Node = Input> = (tree: Input, file: VFile$1, next: TransformCallback<Output>) => (Promise<Output | undefined | void> | Promise<never> | // For some reason this is needed separately.
Output | Error | undefined | void);
/**
 * Create a processor based on the input/output of a {@link Plugin plugin}.
 */
type UsePlugin<ParseTree extends unist.Node | undefined, HeadTree extends unist.Node | undefined, TailTree extends unist.Node | undefined, CompileTree extends unist.Node | undefined, CompileResult extends CompileResults | undefined, Input extends string | unist.Node | undefined, Output> = (Input extends string ? Output extends Node | undefined ? Processor<Output extends undefined ? ParseTree : Output, HeadTree, TailTree, CompileTree, CompileResult> : Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult> : Output extends CompileResults ? Input extends Node | undefined ? Processor<ParseTree, HeadTree, TailTree, Input extends undefined ? CompileTree : Input, Output extends undefined ? CompileResult : Output> : Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult> : Input extends Node | undefined ? Output extends Node | undefined ? Processor<ParseTree, HeadTree extends undefined ? Input : HeadTree, Output extends undefined ? TailTree : Output, CompileTree, CompileResult> : Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult> : Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>);
/**
 * Type to generate a {@link VFile `VFile`} corresponding to a compiler result.
 *
 * If a result that is not acceptable on a `VFile` is used, that will
 * be stored on the `result` field of {@link VFile `VFile`}.
 */
type VFileWithOutput<Result extends CompileResults | undefined> = (Result extends Value | undefined ? VFile$1 : VFile$1 & {
    result: Result;
});

// See: <https://github.com/sindresorhus/type-fest/blob/main/source/empty-object.d.ts>
declare const emptyObjectSymbol: unique symbol

/**
 * Interface of known data that can be supported by all plugins.
 *
 * Typically, options can be given to a specific plugin, but sometimes it makes
 * sense to have information shared with several plugins.
 * For example, a list of HTML elements that are self-closing, which is needed
 * during all phases.
 *
 * To type this, do something like:
 *
 * ```ts
 * declare module 'unified' {
 *   interface Data {
 *     htmlVoidElements?: Array<string> | undefined
 *   }
 * }
 *
 * export {} // You may not need this, but it makes sure the file is a module.
 * ```
 */
interface Data {
  settings?: Settings | undefined
}

/**
 * Interface of known extra options, that can be supported by parser and
 * compilers.
 *
 * This exists so that users can use packages such as `remark`, which configure
 * both parsers and compilers (in this case `remark-parse` and
 * `remark-stringify`), and still provide options for them.
 *
 * When you make parsers or compilers, that could be packaged up together,
 * you should support `this.data('settings')` as input and merge it with
 * explicitly passed `options`.
 * Then, to type it, using `remark-stringify` as an example, do something like:
 *
 * ```ts
 * declare module 'unified' {
 *   interface Settings {
 *     bullet: '*' | '+' | '-'
 *     // …
 *   }
 * }
 *
 * export {} // You may not need this, but it makes sure the file is a module.
 * ```
 */
interface Settings {
  [emptyObjectSymbol]?: never
}

// Type definitions for source-map 0.7
// Project: https://github.com/mozilla/source-map
// Definitions by: Morten Houston Ludvigsen <https://github.com/MortenHoustonLudvigsen>,
//                 Ron Buckton <https://github.com/rbuckton>,
//                 John Vilk <https://github.com/jvilk>
// Definitions: https://github.com/mozilla/source-map
type SourceMapUrl = string;

interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
    skipValidation?: boolean;
}

interface RawSourceMap {
    version: number;
    sources: string[];
    names: string[];
    sourceRoot?: string;
    sourcesContent?: string[];
    mappings: string;
    file: string;
}

interface RawIndexMap extends StartOfSourceMap {
    version: number;
    sections: RawSection[];
}

interface RawSection {
    offset: Position;
    map: RawSourceMap;
}

interface Position {
    line: number;
    column: number;
}

interface NullablePosition {
    line: number | null;
    column: number | null;
    lastColumn: number | null;
}

interface MappedPosition {
    source: string;
    line: number;
    column: number;
    name?: string;
}

interface NullableMappedPosition {
    source: string | null;
    line: number | null;
    column: number | null;
    name: string | null;
}

interface MappingItem {
    source: string;
    generatedLine: number;
    generatedColumn: number;
    originalLine: number;
    originalColumn: number;
    name: string;
}

interface Mapping {
    generated: Position;
    original: Position;
    source: string;
    name?: string;
}

interface SourceMapConsumerConstructor {
    prototype: SourceMapConsumer;

    GENERATED_ORDER: number;
    ORIGINAL_ORDER: number;
    GREATEST_LOWER_BOUND: number;
    LEAST_UPPER_BOUND: number;

    new (rawSourceMap: RawSourceMap, sourceMapUrl?: SourceMapUrl): Promise<BasicSourceMapConsumer>;
    new (rawSourceMap: RawIndexMap, sourceMapUrl?: SourceMapUrl): Promise<IndexedSourceMapConsumer>;
    new (rawSourceMap: RawSourceMap | RawIndexMap | string, sourceMapUrl?: SourceMapUrl): Promise<BasicSourceMapConsumer | IndexedSourceMapConsumer>;

    /**
     * Create a BasicSourceMapConsumer from a SourceMapGenerator.
     *
     * @param sourceMap
     *        The source map that will be consumed.
     */
    fromSourceMap(sourceMap: SourceMapGenerator$1, sourceMapUrl?: SourceMapUrl): Promise<BasicSourceMapConsumer>;

    /**
     * Construct a new `SourceMapConsumer` from `rawSourceMap` and `sourceMapUrl`
     * (see the `SourceMapConsumer` constructor for details. Then, invoke the `async
     * function f(SourceMapConsumer) -> T` with the newly constructed consumer, wait
     * for `f` to complete, call `destroy` on the consumer, and return `f`'s return
     * value.
     *
     * You must not use the consumer after `f` completes!
     *
     * By using `with`, you do not have to remember to manually call `destroy` on
     * the consumer, since it will be called automatically once `f` completes.
     *
     * ```js
     * const xSquared = await SourceMapConsumer.with(
     *   myRawSourceMap,
     *   null,
     *   async function (consumer) {
     *     // Use `consumer` inside here and don't worry about remembering
     *     // to call `destroy`.
     *
     *     const x = await whatever(consumer);
     *     return x * x;
     *   }
     * );
     *
     * // You may not use that `consumer` anymore out here; it has
     * // been destroyed. But you can use `xSquared`.
     * console.log(xSquared);
     * ```
     */
    with<T>(rawSourceMap: RawSourceMap | RawIndexMap | string, sourceMapUrl: SourceMapUrl | null | undefined, callback: (consumer: BasicSourceMapConsumer | IndexedSourceMapConsumer) => Promise<T> | T): Promise<T>;
}

interface SourceMapConsumer {
    /**
     * Compute the last column for each generated mapping. The last column is
     * inclusive.
     */
    computeColumnSpans(): void;

    /**
     * Returns the original source, line, and column information for the generated
     * source's line and column positions provided. The only argument is an object
     * with the following properties:
     *
     *   - line: The line number in the generated source.
     *   - column: The column number in the generated source.
     *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
     *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
     *     closest element that is smaller than or greater than the one we are
     *     searching for, respectively, if the exact element cannot be found.
     *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
     *
     * and an object is returned with the following properties:
     *
     *   - source: The original source file, or null.
     *   - line: The line number in the original source, or null.
     *   - column: The column number in the original source, or null.
     *   - name: The original identifier, or null.
     */
    originalPositionFor(generatedPosition: Position & { bias?: number }): NullableMappedPosition;

    /**
     * Returns the generated line and column information for the original source,
     * line, and column positions provided. The only argument is an object with
     * the following properties:
     *
     *   - source: The filename of the original source.
     *   - line: The line number in the original source.
     *   - column: The column number in the original source.
     *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
     *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
     *     closest element that is smaller than or greater than the one we are
     *     searching for, respectively, if the exact element cannot be found.
     *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
     *
     * and an object is returned with the following properties:
     *
     *   - line: The line number in the generated source, or null.
     *   - column: The column number in the generated source, or null.
     */
    generatedPositionFor(originalPosition: MappedPosition & { bias?: number }): NullablePosition;

    /**
     * Returns all generated line and column information for the original source,
     * line, and column provided. If no column is provided, returns all mappings
     * corresponding to a either the line we are searching for or the next
     * closest line that has any mappings. Otherwise, returns all mappings
     * corresponding to the given line and either the column we are searching for
     * or the next closest column that has any offsets.
     *
     * The only argument is an object with the following properties:
     *
     *   - source: The filename of the original source.
     *   - line: The line number in the original source.
     *   - column: Optional. the column number in the original source.
     *
     * and an array of objects is returned, each with the following properties:
     *
     *   - line: The line number in the generated source, or null.
     *   - column: The column number in the generated source, or null.
     */
    allGeneratedPositionsFor(originalPosition: MappedPosition): NullablePosition[];

    /**
     * Return true if we have the source content for every source in the source
     * map, false otherwise.
     */
    hasContentsOfAllSources(): boolean;

    /**
     * Returns the original source content. The only argument is the url of the
     * original source file. Returns null if no original source content is
     * available.
     */
    sourceContentFor(source: string, returnNullOnMissing?: boolean): string | null;

    /**
     * Iterate over each mapping between an original source/line/column and a
     * generated line/column in this source map.
     *
     * @param callback
     *        The function that is called with each mapping.
     * @param context
     *        Optional. If specified, this object will be the value of `this` every
     *        time that `aCallback` is called.
     * @param order
     *        Either `SourceMapConsumer.GENERATED_ORDER` or
     *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
     *        iterate over the mappings sorted by the generated file's line/column
     *        order or the original's source/line/column order, respectively. Defaults to
     *        `SourceMapConsumer.GENERATED_ORDER`.
     */
    eachMapping(callback: (mapping: MappingItem) => void, context?: any, order?: number): void;
    /**
     * Free this source map consumer's associated wasm data that is manually-managed.
     * Alternatively, you can use SourceMapConsumer.with to avoid needing to remember to call destroy.
     */
    destroy(): void;
}

declare const SourceMapConsumer: SourceMapConsumerConstructor;

interface BasicSourceMapConsumerConstructor {
    prototype: BasicSourceMapConsumer;

    new (rawSourceMap: RawSourceMap | string): Promise<BasicSourceMapConsumer>;

    /**
     * Create a BasicSourceMapConsumer from a SourceMapGenerator.
     *
     * @param sourceMap
     *        The source map that will be consumed.
     */
    fromSourceMap(sourceMap: SourceMapGenerator$1): Promise<BasicSourceMapConsumer>;
}

interface BasicSourceMapConsumer extends SourceMapConsumer {
    file: string;
    sourceRoot: string;
    sources: string[];
    sourcesContent: string[];
}

declare const BasicSourceMapConsumer: BasicSourceMapConsumerConstructor;

interface IndexedSourceMapConsumerConstructor {
    prototype: IndexedSourceMapConsumer;

    new (rawSourceMap: RawIndexMap | string): Promise<IndexedSourceMapConsumer>;
}

interface IndexedSourceMapConsumer extends SourceMapConsumer {
    sources: string[];
}

declare const IndexedSourceMapConsumer: IndexedSourceMapConsumerConstructor;

declare class SourceMapGenerator$1 {
    constructor(startOfSourceMap?: StartOfSourceMap);

    /**
     * Creates a new SourceMapGenerator based on a SourceMapConsumer
     *
     * @param sourceMapConsumer The SourceMap.
     */
    static fromSourceMap(sourceMapConsumer: SourceMapConsumer): SourceMapGenerator$1;

    /**
     * Add a single mapping from original source line and column to the generated
     * source's line and column for this source map being created. The mapping
     * object should have the following properties:
     *
     *   - generated: An object with the generated line and column positions.
     *   - original: An object with the original line and column positions.
     *   - source: The original source file (relative to the sourceRoot).
     *   - name: An optional original token name for this mapping.
     */
    addMapping(mapping: Mapping): void;

    /**
     * Set the source content for a source file.
     */
    setSourceContent(sourceFile: string, sourceContent: string): void;

    /**
     * Applies the mappings of a sub-source-map for a specific source file to the
     * source map being generated. Each mapping to the supplied source file is
     * rewritten using the supplied source map. Note: The resolution for the
     * resulting mappings is the minimium of this map and the supplied map.
     *
     * @param sourceMapConsumer The source map to be applied.
     * @param sourceFile Optional. The filename of the source file.
     *        If omitted, SourceMapConsumer's file property will be used.
     * @param sourceMapPath Optional. The dirname of the path to the source map
     *        to be applied. If relative, it is relative to the SourceMapConsumer.
     *        This parameter is needed when the two source maps aren't in the same
     *        directory, and the source map to be applied contains relative source
     *        paths. If so, those relative source paths need to be rewritten
     *        relative to the SourceMapGenerator.
     */
    applySourceMap(sourceMapConsumer: SourceMapConsumer, sourceFile?: string, sourceMapPath?: string): void;

    toString(): string;

    toJSON(): RawSourceMap;
}

type HastElementContent = hast.ElementContent;
type HastNodes = hast.Nodes;
type HastProperties = hast.Properties;
type MdastDefinition = mdast.Definition;
type MdastFootnoteDefinition = mdast.FootnoteDefinition;
type MdastNodes = mdast.Nodes;
type MdastParents = mdast.Parents;
type FootnoteBackContentTemplate$1 = FootnoteBackContentTemplate;
type FootnoteBackLabelTemplate$1 = FootnoteBackLabelTemplate;
/**
 * Handle a node.
 */
type Handler = (state: State$1, node: any, parent: MdastParents | undefined) => Array<HastElementContent> | HastElementContent | undefined;
/**
 * Handle nodes.
 */
type Handlers = Partial<Record<MdastNodes['type'], Handler>>;
/**
 * Configuration (optional).
 */
type Options$2 = {
    /**
     * Whether to persist raw HTML in markdown in the hast tree (default:
     * `false`).
     */
    allowDangerousHtml?: boolean | null | undefined;
    /**
     * Prefix to use before the `id` property on footnotes to prevent them from
     * *clobbering* (default: `'user-content-'`).
     *
     * Pass `''` for trusted markdown and when you are careful with
     * polyfilling.
     * You could pass a different prefix.
     *
     * DOM clobbering is this:
     *
     * ```html
     * <p id="x"></p>
     * <script>alert(x) // `x` now refers to the `p#x` DOM element</script>
     * ```
     *
     * The above example shows that elements are made available by browsers, by
     * their ID, on the `window` object.
     * This is a security risk because you might be expecting some other variable
     * at that place.
     * It can also break polyfills.
     * Using a prefix solves these problems.
     */
    clobberPrefix?: string | null | undefined;
    /**
     * Content of the backreference back to references (default: `defaultFootnoteBackContent`).
     *
     * The default value is:
     *
     * ```js
     * function defaultFootnoteBackContent(_, rereferenceIndex) {
     * const result = [{type: 'text', value: '↩'}]
     *
     * if (rereferenceIndex > 1) {
     * result.push({
     * type: 'element',
     * tagName: 'sup',
     * properties: {},
     * children: [{type: 'text', value: String(rereferenceIndex)}]
     * })
     * }
     *
     * return result
     * }
     * ```
     *
     * This content is used in the `a` element of each backreference (the `↩`
     * links).
     */
    footnoteBackContent?: FootnoteBackContentTemplate$1 | string | null | undefined;
    /**
     * Label to describe the backreference back to references (default:
     * `defaultFootnoteBackLabel`).
     *
     * The default value is:
     *
     * ```js
     * function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
     * return (
     * 'Back to reference ' +
     * (referenceIndex + 1) +
     * (rereferenceIndex > 1 ? '-' + rereferenceIndex : '')
     * )
     * }
     * ```
     *
     * Change it when the markdown is not in English.
     *
     * This label is used in the `ariaLabel` property on each backreference
     * (the `↩` links).
     * It affects users of assistive technology.
     */
    footnoteBackLabel?: FootnoteBackLabelTemplate$1 | string | null | undefined;
    /**
     * Textual label to use for the footnotes section (default: `'Footnotes'`).
     *
     * Change it when the markdown is not in English.
     *
     * This label is typically hidden visually (assuming a `sr-only` CSS class
     * is defined that does that) and so affects screen readers only.
     * If you do have such a class, but want to show this section to everyone,
     * pass different properties with the `footnoteLabelProperties` option.
     */
    footnoteLabel?: string | null | undefined;
    /**
     * Properties to use on the footnote label (default: `{className:
     * ['sr-only']}`).
     *
     * Change it to show the label and add other properties.
     *
     * This label is typically hidden visually (assuming an `sr-only` CSS class
     * is defined that does that) and so affects screen readers only.
     * If you do have such a class, but want to show this section to everyone,
     * pass an empty string.
     * You can also add different properties.
     *
     * > 👉 **Note**: `id: 'footnote-label'` is always added, because footnote
     * > calls use it with `aria-describedby` to provide an accessible label.
     */
    footnoteLabelProperties?: HastProperties | null | undefined;
    /**
     * HTML tag name to use for the footnote label element (default: `'h2'`).
     *
     * Change it to match your document structure.
     *
     * This label is typically hidden visually (assuming a `sr-only` CSS class
     * is defined that does that) and so affects screen readers only.
     * If you do have such a class, but want to show this section to everyone,
     * pass different properties with the `footnoteLabelProperties` option.
     */
    footnoteLabelTagName?: string | null | undefined;
    /**
     * Extra handlers for nodes (optional).
     */
    handlers?: Handlers | null | undefined;
    /**
     * List of custom mdast node types to pass through (keep) in hast (note that
     * the node itself is passed, but eventual children are transformed)
     * (optional).
     */
    passThrough?: Array<MdastNodes['type']> | null | undefined;
    /**
     * Handler for all unknown nodes (optional).
     */
    unknownHandler?: Handler | null | undefined;
};
/**
 * Info passed around.
 */
type State$1 = {
    /**
     *   Transform the children of an mdast parent to hast.
     */
    all: (node: MdastNodes) => Array<HastElementContent>;
    /**
     *   Honor the `data` of `from`, and generate an element instead of `node`.
     */
    applyData: <Type extends hast.Nodes>(from: MdastNodes, to: Type) => hast.Element | Type;
    /**
     *   Definitions by their identifier.
     */
    definitionById: Map<string, MdastDefinition>;
    /**
     *   Footnote definitions by their identifier.
     */
    footnoteById: Map<string, MdastFootnoteDefinition>;
    /**
     *   Counts for how often the same footnote was called.
     */
    footnoteCounts: Map<string, number>;
    /**
     *   Identifiers of order when footnote calls first appear in tree order.
     */
    footnoteOrder: Array<string>;
    /**
     *   Applied handlers.
     */
    handlers: Handlers;
    /**
     *   Transform an mdast node to hast.
     */
    one: (node: MdastNodes, parent: MdastParents | undefined) => Array<HastElementContent> | HastElementContent | undefined;
    /**
     *   Configuration.
     */
    options: Options$2;
    /**
     *   Copy a node’s positional info.
     */
    patch: (from: MdastNodes, node: HastNodes) => undefined;
    /**
     *   Wrap `nodes` with line endings between each node, adds initial/final line endings when `loose`.
     */
    wrap: <Type_1 extends hast.RootContent>(nodes: Type_1[], loose?: boolean | undefined) => (hast.Text | Type_1)[];
};

type ElementContent = hast.ElementContent;
/**
 * Generate content for the backreference dynamically.
 *
 * For the following markdown:
 *
 * ```markdown
 * Alpha[^micromark], bravo[^micromark], and charlie[^remark].
 *
 * [^remark]: things about remark
 * [^micromark]: things about micromark
 * ```
 *
 * This function will be called with:
 *
 * *  `0` and `0` for the backreference from `things about micromark` to
 *  `alpha`, as it is the first used definition, and the first call to it
 * *  `0` and `1` for the backreference from `things about micromark` to
 *  `bravo`, as it is the first used definition, and the second call to it
 * *  `1` and `0` for the backreference from `things about remark` to
 *  `charlie`, as it is the second used definition
 */
type FootnoteBackContentTemplate = (referenceIndex: number, rereferenceIndex: number) => Array<ElementContent> | ElementContent | string;
/**
 * Generate a back label dynamically.
 *
 * For the following markdown:
 *
 * ```markdown
 * Alpha[^micromark], bravo[^micromark], and charlie[^remark].
 *
 * [^remark]: things about remark
 * [^micromark]: things about micromark
 * ```
 *
 * This function will be called with:
 *
 * *  `0` and `0` for the backreference from `things about micromark` to
 *  `alpha`, as it is the first used definition, and the first call to it
 * *  `0` and `1` for the backreference from `things about micromark` to
 *  `bravo`, as it is the first used definition, and the second call to it
 * *  `1` and `0` for the backreference from `things about remark` to
 *  `charlie`, as it is the second used definition
 */
type FootnoteBackLabelTemplate = (referenceIndex: number, rereferenceIndex: number) => string;

/**
 * Raw string of HTML embedded into HTML AST.
 */
interface Raw$1 extends Literal {
  /**
   * Node type of raw.
   */
  type: 'raw'

  /**
   * Data associated with the hast raw.
   */
  data?: RawData$1 | undefined
}

/**
 * Info associated with hast raw nodes by the ecosystem.
 */
interface RawData$1 extends Data$4 {}

// Register nodes in content.
declare module 'hast' {
  interface ElementContentMap {
    /**
     * Raw string of HTML embedded into HTML AST.
     */
    raw: Raw$1
  }

  interface RootContentMap {
    /**
     * Raw string of HTML embedded into HTML AST.
     */
    raw: Raw$1
  }
}

// Register data on mdast.
declare module 'mdast' {
  interface Data {
    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in something with these children.
     *
     * When this is defined, when a parent is created, these children will
     * be used.
     */
    hChildren?: ElementContent$1[] | undefined

    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in a particular element, instead of its default behavior.
     *
     * When this is defined, an element with the given tag name is created.
     * For example, when setting `hName` to `'b'`, a `<b>` element is created.
     */
    hName?: string | undefined

    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in an element with these properties.
     *
     * When this is defined, when an element is created, these properties will
     * be used.
     */
    hProperties?: Properties | undefined
  }
}

/**
 * Raw string of HTML embedded into HTML AST.
 */
interface Raw extends Literal {
  /**
   * Node type of raw.
   */
  type: 'raw'

  /**
   * Data associated with the hast raw.
   */
  data?: RawData | undefined
}

/**
 * Info associated with hast raw nodes by the ecosystem.
 */
interface RawData extends Data$4 {}

// Register nodes in content.
declare module 'hast' {
  interface ElementContentMap {
    /**
     * Raw string of HTML embedded into HTML AST.
     */
    raw: Raw
  }

  interface RootContentMap {
    /**
     * Raw string of HTML embedded into HTML AST.
     */
    raw: Raw
  }
}

// Register data on mdast.
declare module 'mdast' {
  interface Data {
    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in something with these children.
     *
     * When this is defined, when a parent is created, these children will
     * be used.
     */
    hChildren?: ElementContent$1[] | undefined

    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in a particular element, instead of its default behavior.
     *
     * When this is defined, an element with the given tag name is created.
     * For example, when setting `hName` to `'b'`, a `<b>` element is created.
     */
    hName?: string | undefined

    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in an element with these properties.
     *
     * When this is defined, when an element is created, these properties will
     * be used.
     */
    hProperties?: Properties | undefined
  }
}

type Options$1 = Options$2;

type Options = Options$1;

// Expose node types.
/**
 * MDX JSX attribute value set to an expression.
 *
 * ```markdown
 * > | <a b={c} />
 *          ^^^
 * ```
 */
interface MdxJsxAttributeValueExpression$1 extends Node$2 {
  /**
   * Node type.
   */
  type: 'mdxJsxAttributeValueExpression'

  /**
   * Value.
   */
  value: string

  /**
   * Data associated with the mdast MDX JSX attribute value expression.
   */
  data?: MdxJsxAttributeValueExpressionData$1 | undefined
}

/**
 * Info associated with mdast MDX JSX attribute value expression nodes by the
 * ecosystem.
 */
interface MdxJsxAttributeValueExpressionData$1 extends Data$6 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX JSX attribute as an expression.
 *
 * ```markdown
 * > | <a {...b} />
 *        ^^^^^^
 * ```
 */
interface MdxJsxExpressionAttribute$2 extends Node$2 {
  /**
   * Node type.
   */
  type: 'mdxJsxExpressionAttribute'

  /**
   * Value.
   */
  value: string

  /**
   * Data associated with the mdast MDX JSX expression attributes.
   */
  data?: MdxJsxExpressionAttributeData$1 | undefined
}

/**
 * Info associated with mdast MDX JSX expression attribute nodes by the
 * ecosystem.
 */
interface MdxJsxExpressionAttributeData$1 extends Data$6 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX JSX attribute with a key.
 *
 * ```markdown
 * > | <a b="c" />
 *        ^^^^^
 * ```
 */
interface MdxJsxAttribute$2 extends Node$2 {
  /**
   * Node type.
   */
  type: 'mdxJsxAttribute'
  /**
   * Attribute name.
   */
  name: string
  /**
   * Attribute value.
   */
  value?: MdxJsxAttributeValueExpression$1 | string | null | undefined
  /**
   * Data associated with the mdast MDX JSX attribute.
   */
  data?: MdxJsxAttributeData$1 | undefined
}

/**
 * Info associated with mdast MDX JSX attribute nodes by the
 * ecosystem.
 */
interface MdxJsxAttributeData$1 extends Data$6 {}

/**
 * MDX JSX element node, occurring in flow (block).
 */
interface MdxJsxFlowElement$1 extends Parent {
  /**
   * Node type.
   */
  type: 'mdxJsxFlowElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute$2 | MdxJsxExpressionAttribute$2>
  /**
   * Content.
   */
  children: Array<BlockContent | DefinitionContent>
  /**
   * Data associated with the mdast MDX JSX elements (flow).
   */
  data?: MdxJsxFlowElementData$1 | undefined
}

/**
 * Info associated with mdast MDX JSX element (flow) nodes by the
 * ecosystem.
 */
interface MdxJsxFlowElementData$1 extends Data$5 {}

/**
 * MDX JSX element node, occurring in text (phrasing).
 */
interface MdxJsxTextElement$1 extends Parent {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute$2 | MdxJsxExpressionAttribute$2>
  /**
   * Content.
   */
  children: PhrasingContent[]
  /**
   * Data associated with the mdast MDX JSX elements (text).
   */
  data?: MdxJsxTextElementData$1 | undefined
}

/**
 * Info associated with mdast MDX JSX element (text) nodes by the
 * ecosystem.
 */
interface MdxJsxTextElementData$1 extends Data$5 {}

/**
 * MDX JSX element node, occurring in flow (block), for hast.
 */
interface MdxJsxFlowElementHast$1 extends Parent$1 {
  /**
   * Node type.
   */
  type: 'mdxJsxFlowElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute$2 | MdxJsxExpressionAttribute$2>
  /**
   * Content.
   */
  children: ElementContent$1[]
  /**
   * Data associated with the hast MDX JSX elements (flow).
   */
  data?: MdxJsxFlowElementHastData$1 | undefined
}

/**
 * Info associated with hast MDX JSX element (flow) nodes by the
 * ecosystem.
 */
interface MdxJsxFlowElementHastData$1 extends Data$4 {}

/**
 * MDX JSX element node, occurring in text (phrasing), for hast.
 */
interface MdxJsxTextElementHast$1 extends Parent$1 {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute$2 | MdxJsxExpressionAttribute$2>
  /**
   * Content.
   */
  children: ElementContent$1[]
  /**
   * Data associated with the hast MDX JSX elements (text).
   */
  data?: MdxJsxTextElementHastData$1 | undefined
}

/**
 * Info associated with hast MDX JSX element (text) nodes by the
 * ecosystem.
 */
interface MdxJsxTextElementHastData$1 extends Data$4 {}

// Add nodes to mdast content.
declare module 'mdast' {
  interface BlockContentMap {
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElement$1
  }

  interface PhrasingContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElement$1
  }

  interface RootContentMap {
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElement$1
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElement$1
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface ElementContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElementHast$1
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElementHast$1
  }

  interface RootContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElementHast$1
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElementHast$1
  }
}

// Add custom data tracked to turn markdown into a tree.
declare module 'mdast-util-from-markdown' {
  interface CompileData {
    /**
     * Current MDX JSX tag.
     */
    mdxJsxTag?: Tag | undefined

    /**
     * Current stack of open MDX JSX tags.
     */
    mdxJsxTagStack?: Tag[] | undefined
  }
}

// Add custom data tracked to turn a syntax tree into markdown.
declare module 'mdast-util-to-markdown' {
  interface ConstructNameMap {
    /**
     * Whole JSX element, in flow.
     *
     * ```markdown
     * > | <a />
     *     ^^^^^
     * ```
     */
    mdxJsxFlowElement: 'mdxJsxFlowElement'

    /**
     * Whole JSX element, in text.
     *
     * ```markdown
     * > | a <b />.
     *       ^^^^^
     * ```
     */
    mdxJsxTextElement: 'mdxJsxTextElement'
  }
}

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    listItem: 'listItem'
  }

  interface Token {
    _spread?: boolean
  }
}

// Note: this file is authored manually, not generated from `index.js`.

/**
 * A character code.
 *
 * This is often the same as what `String#charCodeAt()` yields but micromark
 * adds meaning to certain other values.
 *
 * `null` represents the end of the input stream (called eof).
 * Negative integers are used instead of certain sequences of characters (such
 * as line endings and tabs).
 */
type Code = number | null

/**
 * A chunk is either a character code or a slice of a buffer in the form of a
 * string.
 *
 * Chunks are used because strings are more efficient storage that character
 * codes, but limited in what they can represent.
 */
type Chunk = Code | string

/**
 * Enumeration of the content types.
 *
 * Technically `document` is also a content type, which includes containers
 * (lists, block quotes) and flow.
 * As `ContentType` is used on tokens to define the type of subcontent but
 * `document` is the highest level of content, so it’s not listed here.
 *
 * Containers in markdown come from the margin and include more constructs
 * on the lines that define them.
 * Take for example a block quote with a paragraph inside it (such as
 * `> asd`).
 *
 * `flow` represents the sections, such as headings, code, and content, which
 * is also parsed per line
 * An example is HTML, which has a certain starting condition (such as
 * `<script>` on its own line), then continues for a while, until an end
 * condition is found (such as `</style>`).
 * If that line with an end condition is never found, that flow goes until
 * the end.
 *
 * `content` is zero or more definitions, and then zero or one paragraph.
 * It’s a weird one, and needed to make certain edge cases around definitions
 * spec compliant.
 * Definitions are unlike other things in markdown, in that they behave like
 * `text` in that they can contain arbitrary line endings, but *have* to end
 * at a line ending.
 * If they end in something else, the whole definition instead is seen as a
 * paragraph.
 *
 * The content in markdown first needs to be parsed up to this level to
 * figure out which things are defined, for the whole document, before
 * continuing on with `text`, as whether a link or image reference forms or
 * not depends on whether it’s defined.
 * This unfortunately prevents a true streaming markdown to HTML compiler.
 *
 * `text` contains phrasing content such as attention (emphasis, strong),
 * media (links, images), and actual text.
 *
 * `string` is a limited `text` like content type which only allows character
 * references and character escapes.
 * It exists in things such as identifiers (media references, definitions),
 * titles, or URLs.
 */
type ContentType = 'content' | 'document' | 'flow' | 'string' | 'text'

/**
 * A location in the document (`line`/`column`/`offset`) and chunk (`_index`,
 * `_bufferIndex`).
 *
 * `_bufferIndex` is `-1` when `_index` points to a code chunk and it’s a
 * non-negative integer when pointing to a string chunk.
 *
 * The interface for the location in the document comes from unist `Point`:
 * <https://github.com/syntax-tree/unist#point>
 */
type Point = {
  /**
   * Position in a string chunk (or `-1` when pointing to a numeric chunk).
   */
  _bufferIndex: number

  /**
   * Position in a list of chunks.
   */
  _index: number

  /**
   * 1-indexed column number.
   */
  column: number

  /**
   * 1-indexed line number.
   */
  line: number

  /**
   * 0-indexed position in the document.
   */
  offset: number
}

/**
 * A token: a span of chunks.
 *
 * Tokens are what the core of micromark produces: the built in HTML compiler
 * or other tools can turn them into different things.
 *
 * Tokens are essentially names attached to a slice of chunks, such as
 * `lineEndingBlank` for certain line endings, or `codeFenced` for a whole
 * fenced code.
 *
 * Sometimes, more info is attached to tokens, such as `_open` and `_close`
 * by `attention` (strong, emphasis) to signal whether the sequence can open
 * or close an attention run.
 *
 * Linked tokens are used because outer constructs are parsed first.
 * Take for example:
 *
 * ```markdown
 * > *a
 * b*.
 * ```
 *
 * 1.  The block quote marker and the space after it is parsed first
 * 2.  The rest of the line is a `chunkFlow` token
 * 3.  The two spaces on the second line are a `linePrefix`
 * 4.  The rest of the line is another `chunkFlow` token
 *
 * The two `chunkFlow` tokens are linked together.
 * The chunks they span are then passed through the flow tokenizer.
 */
interface Token$2 {
  /**
   * Token type.
   */
  type: TokenType

  /**
   * Point where the token starts.
   */
  start: Point

  /**
   * Point where the token ends.
   */
  end: Point

  /**
   * The previous token in a list of linked tokens.
   */
  previous?: Token$2 | undefined

  /**
   * The next token in a list of linked tokens.
   */
  next?: Token$2 | undefined

  /**
   * Declares a token as having content of a certain type.
   */
  contentType?: ContentType | undefined

  /**
   * Connected tokenizer.
   *
   * Used when dealing with linked tokens.
   * A child tokenizer is needed to tokenize them, which is stored on those
   * tokens.
   */
  _tokenizer?: TokenizeContext | undefined

  /**
   * Field to help parse attention.
   *
   * Depending on the character before sequences (`**`), the sequence can open,
   * close, both, or none.
   */
  _open?: boolean | undefined

  /**
   * Field to help parse attention.
   *
   * Depending on the character before sequences (`**`), the sequence can open,
   * close, both, or none.
   */
  _close?: boolean | undefined

  /**
   * Field to help parse GFM task lists.
   *
   * This boolean is used internally to figure out if a token is in the first
   * content of a list item construct.
   */
  _isInFirstContentOfListItem?: boolean | undefined

  /**
   * Field to help parse containers.
   *
   * This boolean is used internally to figure out if a token is a container
   * token.
   */
  _container?: boolean | undefined

  /**
   * Field to help parse lists.
   *
   * This boolean is used internally to figure out if a list is loose or not.
   */
  _loose?: boolean | undefined

  /**
   * Field to help parse links.
   *
   * This boolean is used internally to figure out if a link opening
   * can’t be used (because links in links are incorrect).
   */
  _inactive?: boolean | undefined

  /**
   * Field to help parse links.
   *
   * This boolean is used internally to figure out if a link opening is
   * balanced: it’s not a link opening but has a balanced closing.
   */
  _balanced?: boolean | undefined
}

/**
 * The start or end of a token amongst other events.
 *
 * Tokens can “contain” other tokens, even though they are stored in a flat
 * list, through `enter`ing before them, and `exit`ing after them.
 */
type Event = ['enter' | 'exit', Token$2, TokenizeContext]

/**
 * Open a token.
 *
 * @param type
 *   Token type.
 * @param fields
 *   Extra fields.
 * @returns {Token}
 *   Token.
 */
type Enter = (
  type: TokenType,
  fields?: Omit<Partial<Token$2>, 'type'> | undefined
) => Token$2

/**
 * Close a token.
 *
 * @param type
 *   Token type.
 * @returns
 *   Token.
 */
type Exit = (type: TokenType) => Token$2

/**
 * Deal with the character and move to the next.
 *
 * @param code
 *   Current code.
 */
type Consume = (code: Code) => undefined

/**
 * Attempt deals with several values, and tries to parse according to those
 * values.
 *
 * If a value resulted in `ok`, it worked, the tokens that were made are used,
 * and `ok` is switched to.
 * If the result is `nok`, the attempt failed, so we revert to the original
 * state, and `nok` is used.
 *
 * @param construct
 *   Construct(s) to try.
 * @param ok
 *   State to move to when successful.
 * @param nok
 *   State to move to when unsuccessful.
 * @returns
 *   Next state.
 */
type Attempt = (
  construct: Array<Construct> | Construct | ConstructRecord,
  ok: State,
  nok?: State | undefined
) => State

/**
 * A context object to transition the state machine.
 */
type Effects = {
  /**
   * Start a new token.
   */
  enter: Enter

  /**
   * End a started token.
   */
  exit: Exit

  /**
   * Deal with the character and move to the next.
   */
  consume: Consume

  /**
   * Try to tokenize a construct.
   */
  attempt: Attempt

  /**
   * Interrupt is used for stuff right after a line of content.
   */
  interrupt: Attempt

  /**
   * Attempt, then revert.
   */
  check: Attempt
}

/**
 * The main unit in the state machine: a function that gets a character code
 * and has certain effects.
 *
 * A state function should return another function: the next
 * state-as-a-function to go to.
 *
 * But there is one case where they return `undefined`: for the eof character
 * code (at the end of a value).
 * The reason being: well, there isn’t any state that makes sense, so
 * `undefined` works well.
 * Practically that has also helped: if for some reason it was a mistake, then
 * an exception is throw because there is no next function, meaning it
 * surfaces early.
 *
 * @param code
 *   Current code.
 * @returns
 *   Next state.
 */
type State = (code: Code) => State | undefined

/**
 * A resolver handles and cleans events coming from `tokenize`.
 *
 * @param events
 *   List of events.
 * @param context
 *   Tokenize context.
 * @returns
 *   The given, modified, events.
 */
type Resolver = (
  events: Array<Event>,
  context: TokenizeContext
) => Array<Event>

/**
 * A tokenize function sets up a state machine to handle character codes streaming in.
 *
 * @param this
 *   Tokenize context.
 * @param effects
 *   Effects.
 * @param ok
 *   State to go to when successful.
 * @param nok
 *   State to go to when unsuccessful.
 * @returns
 *   First state.
 */
type Tokenizer = (
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State
) => State

/**
 * Like a tokenizer, but without `ok` or `nok`, and returning `undefined`.
 *
 * This is the final hook when a container must be closed.
 *
 * @param this
 *   Tokenize context.
 * @param effects
 *   Effects.
 * @returns
 *   Nothing.
 */
type Exiter = (this: TokenizeContext, effects: Effects) => undefined

/**
 * Guard whether `code` can come before the construct.
 *
 * In certain cases a construct can hook into many potential start characters.
 * Instead of setting up an attempt to parse that construct for most
 * characters, this is a speedy way to reduce that.
 *
 * @param this
 *   Tokenize context.
 * @param code
 *   Previous code.
 * @returns
 *   Whether `code` is allowed before.
 */
type Previous = (this: TokenizeContext, code: Code) => boolean

/**
 * An object describing how to parse a markdown construct.
 */
type Construct = {
  /**
   * Set up a state machine to handle character codes streaming in.
   */
  tokenize: Tokenizer

  /**
   * Guard whether the previous character can come before the construct.
   */
  previous?: Previous | undefined

  /**
   * For containers, a continuation construct.
   */
  continuation?: Construct | undefined

  /**
   * For containers, a final hook.
   */
  exit?: Exiter | undefined

  /**
   * Name of the construct, used to toggle constructs off.
   *
   * Named constructs must not be `partial`.
   */
  name?: string | undefined

  /**
   * Whether this construct represents a partial construct.
   *
   * Partial constructs must not have a `name`.
   */
  partial?: boolean | undefined

  /**
   * Resolve the events parsed by `tokenize`.
   *
   * For example, if we’re currently parsing a link title and this construct
   * parses character references, then `resolve` is called with the events
   * ranging from the start to the end of a character reference each time one is
   * found.
   */
  resolve?: Resolver | undefined

  /**
   * Resolve the events from the start of the content (which includes other
   * constructs) to the last one parsed by `tokenize`.
   *
   * For example, if we’re currently parsing a link title and this construct
   * parses character references, then `resolveTo` is called with the events
   * ranging from the start of the link title to the end of a character
   * reference each time one is found.
   */
  resolveTo?: Resolver | undefined

  /**
   * Resolve all events when the content is complete, from the start to the end.
   * Only used if `tokenize` is successful once in the content.
   *
   * For example, if we’re currently parsing a link title and this construct
   * parses character references, then `resolveAll` is called *if* at least one
   * character reference is found, ranging from the start to the end of the link
   * title to the end.
   */
  resolveAll?: Resolver | undefined

  /**
   * Concrete constructs cannot be interrupted by more containers.
   *
   * For example, when parsing the document (containers, such as block quotes
   * and lists) and this construct is parsing fenced code:
   *
   * ````markdown
   * > ```js
   * > - list?
   * ````
   *
   * …then `- list?` cannot form if this fenced code construct is concrete.
   *
   * An example of a construct that is not concrete is a GFM table:
   *
   * ````markdown
   * | a |
   * | - |
   * > | b |
   * ````
   *
   * …`b` is not part of the table.
   */
  concrete?: boolean | undefined

  /**
   * Whether the construct, when in a `ConstructRecord`, precedes over existing
   * constructs for the same character code when merged.
   *
   * The default is that new constructs precede over existing ones.
   */
  add?: 'after' | 'before' | undefined
}

/**
 * Several constructs, mapped from their initial codes.
 */
type ConstructRecord = Record<
  string,
  Array<Construct> | Construct | undefined
>

/**
 * State shared between container calls.
 */
interface ContainerState {
  /**
   * Special field to close the current flow (or containers).
   */
  _closeFlow?: boolean | undefined

  /**
   * Used by block quotes.
   */
  open?: boolean | undefined

  /**
   * Current marker, used by lists.
   */
  marker?: Code | undefined

  /**
   * Current token type, used by lists.
   */
  type?: TokenType | undefined

  /**
   * Current size, used by lists.
   */
  size?: number | undefined

  /**
   * Whether there first line is blank, used by lists.
   */
  initialBlankLine?: boolean | undefined

  /**
   * Whether there are further blank lines, used by lists.
   */
  furtherBlankLines?: boolean | undefined
}

/**
 * A context object that helps w/ tokenizing markdown constructs.
 */
interface TokenizeContext {
  /**
   * The previous code.
   */
  previous: Code

  /**
   * Current code.
   */
  code: Code

  /**
   * Whether we’re currently interrupting.
   *
   * Take for example:
   *
   * ```markdown
   * a
   * # b
   * ```
   *
   * At 2:1, we’re “interrupting”.
   */
  interrupt?: boolean | undefined

  /**
   * The current construct.
   *
   * Constructs that are not `partial` are set here.
   */
  currentConstruct?: Construct | undefined

  /**
   * share state set when parsing containers.
   *
   * Containers are parsed in separate phases: their first line (`tokenize`),
   * continued lines (`continuation.tokenize`), and finally `exit`.
   * This record can be used to store some information between these hooks.
   */
  containerState?: ContainerState | undefined

  /**
   * Current list of events.
   */
  events: Array<Event>

  /**
   * The relevant parsing context.
   */
  parser: ParseContext

  /**
   * Get the chunks that span a token (or location).
   *
   * @param token
   *   Start/end in stream.
   * @returns
   *   List of chunks.
   */
  sliceStream: (token: Pick<Token$2, 'end' | 'start'>) => Array<Chunk>

  /**
   * Get the source text that spans a token (or location).
   *
   * @param token
   *   Start/end in stream.
   * @param expandTabs
   *   Whether to expand tabs.
   * @returns
   *   Serialized chunks.
   */
  sliceSerialize: (
    token: Pick<Token$2, 'end' | 'start'>,
    expandTabs?: boolean | undefined
  ) => string

  /**
   * Get the current place.
   *
   * @returns
   *   Current point.
   */
  now: () => Point

  /**
   * Define a skip
   *
   * As containers (block quotes, lists), “nibble” a prefix from the margins,
   * where a line starts after that prefix is defined here.
   * When the tokenizers moves after consuming a line ending corresponding to
   * the line number in the given point, the tokenizer shifts past the prefix
   * based on the column in the shifted point.
   *
   * @param point
   *   Skip.
   * @returns
   *   Nothing.
   */
  defineSkip: (point: Point) => undefined

  /**
   * Write a slice of chunks.
   *
   * The eof code (`null`) can be used to signal the end of the stream.
   *
   * @param slice
   *   Chunks.
   * @returns
   *   Events.
   */
  write: (slice: Array<Chunk>) => Array<Event>

  /**
   * Internal boolean shared with `micromark-extension-gfm-task-list-item` to
   * signal whether the tokenizer is tokenizing the first content of a list item
   * construct.
   */
  _gfmTasklistFirstContentOfListItem?: boolean | undefined

  // To do: next major: remove `_gfmTableDynamicInterruptHack` (no longer
  // needed in micromark-extension-gfm-table@1.0.6).
  /**
   * Internal boolean shared with `micromark-extension-gfm-table` whose body
   * rows are not affected by normal interruption rules.
   * “Normal” rules are, for example, that an empty list item can’t interrupt:
   *
   * ````markdown
   * a
   * *
   * ````
   *
   * The above is one paragraph.
   * These rules don’t apply to table body rows:
   *
   * ````markdown
   * | a |
   * | - |
   * *
   * ````
   *
   * The above list interrupts the table.
   */
  _gfmTableDynamicInterruptHack?: boolean
}

/**
 * A syntax extension changes how markdown is tokenized.
 *
 * See: <https://github.com/micromark/micromark#syntaxextension>
 */
interface Extension {
  document?: ConstructRecord | undefined
  contentInitial?: ConstructRecord | undefined
  flowInitial?: ConstructRecord | undefined
  flow?: ConstructRecord | undefined
  string?: ConstructRecord | undefined
  text?: ConstructRecord | undefined
  disable?: {null?: Array<string> | undefined} | undefined
  insideSpan?:
    | {null?: Array<Pick<Construct, 'resolveAll'>> | undefined}
    | undefined
  attentionMarkers?: {null?: Array<Code> | undefined} | undefined
}

/**
 * A full, filtereed, normalized, extension.
 */
type FullNormalizedExtension = {
  [Key in keyof Extension]-?: Exclude<Extension[Key], undefined>
}

/**
 * Create a context.
 *
 * @param from
 *   Where to create from.
 * @returns
 *   Context.
 */
type Create = (
  from?: Omit<Point, '_bufferIndex' | '_index'> | undefined
) => TokenizeContext

/**
 * A context object that helps w/ parsing markdown.
 */
interface ParseContext {
  /**
   * All constructs.
   */
  constructs: FullNormalizedExtension

  /**
   * Create a content tokenizer.
   */
  content: Create

  /**
   * Create a document tokenizer.
   */
  document: Create

  /**
   * Create a flow tokenizer.
   */
  flow: Create

  /**
   * Create a string tokenizer.
   */
  string: Create

  /**
   * Create a text tokenizer.
   */
  text: Create

  /**
   * List of defined identifiers.
   */
  defined: Array<string>

  /**
   * Map of line numbers to whether they are lazy (as opposed to the line before
   * them).
   * Take for example:
   *
   * ```markdown
   * > a
   * b
   * ```
   *
   * L1 here is not lazy, L2 is.
   */
  lazy: Record<number, boolean>
}

/**
 * Enum of allowed token types.
 */
type TokenType = keyof TokenTypeMap

// Note: when changing the next interface, you likely also have to change
// `micromark-util-symbol`.
/**
 * Map of allowed token types.
 */
interface TokenTypeMap {
  // Note: these are compiled away.
  attentionSequence: 'attentionSequence' // To do: remove.
  space: 'space' // To do: remove.

  data: 'data'
  whitespace: 'whitespace'
  lineEnding: 'lineEnding'
  lineEndingBlank: 'lineEndingBlank'
  linePrefix: 'linePrefix'
  lineSuffix: 'lineSuffix'
  atxHeading: 'atxHeading'
  atxHeadingSequence: 'atxHeadingSequence'
  atxHeadingText: 'atxHeadingText'
  autolink: 'autolink'
  autolinkEmail: 'autolinkEmail'
  autolinkMarker: 'autolinkMarker'
  autolinkProtocol: 'autolinkProtocol'
  characterEscape: 'characterEscape'
  characterEscapeValue: 'characterEscapeValue'
  characterReference: 'characterReference'
  characterReferenceMarker: 'characterReferenceMarker'
  characterReferenceMarkerNumeric: 'characterReferenceMarkerNumeric'
  characterReferenceMarkerHexadecimal: 'characterReferenceMarkerHexadecimal'
  characterReferenceValue: 'characterReferenceValue'
  codeFenced: 'codeFenced'
  codeFencedFence: 'codeFencedFence'
  codeFencedFenceSequence: 'codeFencedFenceSequence'
  codeFencedFenceInfo: 'codeFencedFenceInfo'
  codeFencedFenceMeta: 'codeFencedFenceMeta'
  codeFlowValue: 'codeFlowValue'
  codeIndented: 'codeIndented'
  codeText: 'codeText'
  codeTextData: 'codeTextData'
  codeTextPadding: 'codeTextPadding'
  codeTextSequence: 'codeTextSequence'
  content: 'content'
  definition: 'definition'
  definitionDestination: 'definitionDestination'
  definitionDestinationLiteral: 'definitionDestinationLiteral'
  definitionDestinationLiteralMarker: 'definitionDestinationLiteralMarker'
  definitionDestinationRaw: 'definitionDestinationRaw'
  definitionDestinationString: 'definitionDestinationString'
  definitionLabel: 'definitionLabel'
  definitionLabelMarker: 'definitionLabelMarker'
  definitionLabelString: 'definitionLabelString'
  definitionMarker: 'definitionMarker'
  definitionTitle: 'definitionTitle'
  definitionTitleMarker: 'definitionTitleMarker'
  definitionTitleString: 'definitionTitleString'
  emphasis: 'emphasis'
  emphasisSequence: 'emphasisSequence'
  emphasisText: 'emphasisText'
  escapeMarker: 'escapeMarker'
  hardBreakEscape: 'hardBreakEscape'
  hardBreakTrailing: 'hardBreakTrailing'
  htmlFlow: 'htmlFlow'
  htmlFlowData: 'htmlFlowData'
  htmlText: 'htmlText'
  htmlTextData: 'htmlTextData'
  image: 'image'
  label: 'label'
  labelText: 'labelText'
  labelLink: 'labelLink'
  labelImage: 'labelImage'
  labelMarker: 'labelMarker'
  labelImageMarker: 'labelImageMarker'
  labelEnd: 'labelEnd'
  link: 'link'
  paragraph: 'paragraph'
  reference: 'reference'
  referenceMarker: 'referenceMarker'
  referenceString: 'referenceString'
  resource: 'resource'
  resourceDestination: 'resourceDestination'
  resourceDestinationLiteral: 'resourceDestinationLiteral'
  resourceDestinationLiteralMarker: 'resourceDestinationLiteralMarker'
  resourceDestinationRaw: 'resourceDestinationRaw'
  resourceDestinationString: 'resourceDestinationString'
  resourceMarker: 'resourceMarker'
  resourceTitle: 'resourceTitle'
  resourceTitleMarker: 'resourceTitleMarker'
  resourceTitleString: 'resourceTitleString'
  setextHeading: 'setextHeading'
  setextHeadingText: 'setextHeadingText'
  setextHeadingLine: 'setextHeadingLine'
  setextHeadingLineSequence: 'setextHeadingLineSequence'
  strong: 'strong'
  strongSequence: 'strongSequence'
  strongText: 'strongText'
  thematicBreak: 'thematicBreak'
  thematicBreakSequence: 'thematicBreakSequence'
  blockQuote: 'blockQuote'
  blockQuotePrefix: 'blockQuotePrefix'
  blockQuoteMarker: 'blockQuoteMarker'
  blockQuotePrefixWhitespace: 'blockQuotePrefixWhitespace'
  listOrdered: 'listOrdered'
  listUnordered: 'listUnordered'
  listItemIndent: 'listItemIndent'
  listItemMarker: 'listItemMarker'
  listItemPrefix: 'listItemPrefix'
  listItemPrefixWhitespace: 'listItemPrefixWhitespace'
  listItemValue: 'listItemValue'
  chunkDocument: 'chunkDocument'
  chunkContent: 'chunkContent'
  chunkFlow: 'chunkFlow'
  chunkText: 'chunkText'
  chunkString: 'chunkString'
}

type Token$1 = Token$2

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    listItem: 'listItem'
  }

  interface Token {
    _spread?: boolean
  }
}

type Token = Token$1
type MdxJsxAttribute$1 = MdxJsxAttribute$2
type MdxJsxExpressionAttribute$1 =
  MdxJsxExpressionAttribute$2
/**
 * Single tag.
 */
type Tag = {
  /**
   *   Name of tag, or `undefined` for fragment.
   *
   *   > 👉 **Note**: `null` is used in the AST for fragments, as it serializes in
   *   > JSON.
   */
  name: string | undefined
  /**
   *   Attributes.
   */
  attributes: Array<MdxJsxAttribute$1 | MdxJsxExpressionAttribute$1>
  /**
   *   Whether the tag is closing (`</x>`).
   */
  close: boolean
  /**
   *   Whether the tag is self-closing (`<x/>`).
   */
  selfClosing: boolean
  /**
   *   Start point.
   */
  start: Token['start']
  /**
   *   End point.
   */
  end: Token['start']
}

// Expose node types.
/**
 * MDX JSX attribute value set to an expression.
 *
 * ```markdown
 * > | <a b={c} />
 *          ^^^
 * ```
 */
interface MdxJsxAttributeValueExpression extends Node$2 {
  /**
   * Node type.
   */
  type: 'mdxJsxAttributeValueExpression'

  /**
   * Value.
   */
  value: string

  /**
   * Data associated with the mdast MDX JSX attribute value expression.
   */
  data?: MdxJsxAttributeValueExpressionData | undefined
}

/**
 * Info associated with mdast MDX JSX attribute value expression nodes by the
 * ecosystem.
 */
interface MdxJsxAttributeValueExpressionData extends Data$6 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX JSX attribute as an expression.
 *
 * ```markdown
 * > | <a {...b} />
 *        ^^^^^^
 * ```
 */
interface MdxJsxExpressionAttribute extends Node$2 {
  /**
   * Node type.
   */
  type: 'mdxJsxExpressionAttribute'

  /**
   * Value.
   */
  value: string

  /**
   * Data associated with the mdast MDX JSX expression attributes.
   */
  data?: MdxJsxExpressionAttributeData | undefined
}

/**
 * Info associated with mdast MDX JSX expression attribute nodes by the
 * ecosystem.
 */
interface MdxJsxExpressionAttributeData extends Data$6 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX JSX attribute with a key.
 *
 * ```markdown
 * > | <a b="c" />
 *        ^^^^^
 * ```
 */
interface MdxJsxAttribute extends Node$2 {
  /**
   * Node type.
   */
  type: 'mdxJsxAttribute'
  /**
   * Attribute name.
   */
  name: string
  /**
   * Attribute value.
   */
  value?: MdxJsxAttributeValueExpression | string | null | undefined
  /**
   * Data associated with the mdast MDX JSX attribute.
   */
  data?: MdxJsxAttributeData | undefined
}

/**
 * Info associated with mdast MDX JSX attribute nodes by the
 * ecosystem.
 */
interface MdxJsxAttributeData extends Data$6 {}

/**
 * MDX JSX element node, occurring in flow (block).
 */
interface MdxJsxFlowElement extends Parent {
  /**
   * Node type.
   */
  type: 'mdxJsxFlowElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: Array<BlockContent | DefinitionContent>
  /**
   * Data associated with the mdast MDX JSX elements (flow).
   */
  data?: MdxJsxFlowElementData | undefined
}

/**
 * Info associated with mdast MDX JSX element (flow) nodes by the
 * ecosystem.
 */
interface MdxJsxFlowElementData extends Data$5 {}

/**
 * MDX JSX element node, occurring in text (phrasing).
 */
interface MdxJsxTextElement extends Parent {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: PhrasingContent[]
  /**
   * Data associated with the mdast MDX JSX elements (text).
   */
  data?: MdxJsxTextElementData | undefined
}

/**
 * Info associated with mdast MDX JSX element (text) nodes by the
 * ecosystem.
 */
interface MdxJsxTextElementData extends Data$5 {}

/**
 * MDX JSX element node, occurring in flow (block), for hast.
 */
interface MdxJsxFlowElementHast extends Parent$1 {
  /**
   * Node type.
   */
  type: 'mdxJsxFlowElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: ElementContent$1[]
  /**
   * Data associated with the hast MDX JSX elements (flow).
   */
  data?: MdxJsxFlowElementHastData | undefined
}

/**
 * Info associated with hast MDX JSX element (flow) nodes by the
 * ecosystem.
 */
interface MdxJsxFlowElementHastData extends Data$4 {}

/**
 * MDX JSX element node, occurring in text (phrasing), for hast.
 */
interface MdxJsxTextElementHast extends Parent$1 {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: ElementContent$1[]
  /**
   * Data associated with the hast MDX JSX elements (text).
   */
  data?: MdxJsxTextElementHastData | undefined
}

/**
 * Info associated with hast MDX JSX element (text) nodes by the
 * ecosystem.
 */
interface MdxJsxTextElementHastData extends Data$4 {}

// Add nodes to mdast content.
declare module 'mdast' {
  interface BlockContentMap {
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElement
  }

  interface PhrasingContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElement
  }

  interface RootContentMap {
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElement
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElement
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface ElementContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElementHast
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElementHast
  }

  interface RootContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElementHast
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElementHast
  }
}

// Add custom data tracked to turn markdown into a tree.
declare module 'mdast-util-from-markdown' {
  interface CompileData {
    /**
     * Current MDX JSX tag.
     */
    mdxJsxTag?: Tag | undefined

    /**
     * Current stack of open MDX JSX tags.
     */
    mdxJsxTagStack?: Tag[] | undefined
  }
}

// Add custom data tracked to turn a syntax tree into markdown.
declare module 'mdast-util-to-markdown' {
  interface ConstructNameMap {
    /**
     * Whole JSX element, in flow.
     *
     * ```markdown
     * > | <a />
     *     ^^^^^
     * ```
     */
    mdxJsxFlowElement: 'mdxJsxFlowElement'

    /**
     * Whole JSX element, in text.
     *
     * ```markdown
     * > | a <b />.
     *       ^^^^^
     * ```
     */
    mdxJsxTextElement: 'mdxJsxTextElement'
  }
}

/**
 * Specify casing to use for attribute names.
 *
 * HTML casing is for example `class`, `stroke-linecap`, `xml:lang`.
 * React casing is for example `className`, `strokeLinecap`, `xmlLang`.
 */
type ElementAttributeNameCase$2 = 'html' | 'react';
/**
 * Casing to use for property names in `style` objects.
 *
 * CSS casing is for example `background-color` and `-webkit-line-clamp`.
 * DOM casing is for example `backgroundColor` and `WebkitLineClamp`.
 */
type StylePropertyNameCase$2 = 'css' | 'dom';

/**
 * MDX expression node, occurring in flow (block).
 */
interface MdxFlowExpression$1 extends Literal$1 {
  /**
   * Node type.
   */
  type: 'mdxFlowExpression'

  /**
   * Data associated with the mdast MDX expression (flow).
   */
  data?: MdxFlowExpressionData$1 | undefined
}

/**
 * Info associated with mdast MDX expression (flow) nodes by the ecosystem.
 */
interface MdxFlowExpressionData$1 extends Data$5 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX expression node, occurring in text (phrasing).
 */
interface MdxTextExpression$1 extends Literal$1 {
  /**
   * Node type.
   */
  type: 'mdxTextExpression'

  /**
   * Data associated with the mdast MDX expression (text).
   */
  data?: MdxTextExpressionData$1 | undefined
}

/**
 * Info associated with mdast MDX expression (text) nodes by the ecosystem.
 */
interface MdxTextExpressionData$1 extends Data$5 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX expression node, occurring in flow (block), for hast.
 */
interface MdxFlowExpressionHast$1 extends Literal {
  /**
   * Node type.
   */
  type: 'mdxFlowExpression'

  /**
   * Data associated with the hast MDX expression (flow).
   */
  data?: MdxFlowExpressionHastData$1 | undefined
}

/**
 * Info associated with hast MDX expression (flow) nodes by the ecosystem.
 */
interface MdxFlowExpressionHastData$1 extends Data$4 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX expression node, occurring in text (phrasing), for hast.
 */
interface MdxTextExpressionHast$1 extends Literal {
  /**
   * Node type.
   */
  type: 'mdxTextExpression'

  /**
   * Data associated with the hast MDX expression (text).
   */
  data?: MdxTextExpressionHastData$1 | undefined
}

/**
 * Info associated with hast MDX expression (text) nodes by the ecosystem.
 */
interface MdxTextExpressionHastData$1 extends Data$4 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

// Add nodes to mdast content.
declare module 'mdast' {
  interface RootContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression$1
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression$1
  }

  interface PhrasingContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression$1
  }

  interface BlockContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression$1
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface RootContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpressionHast$1
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpressionHast$1
  }

  interface ElementContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpressionHast$1
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpressionHast$1
  }
}

/**
 * MDX expression node, occurring in flow (block).
 */
interface MdxFlowExpression extends Literal$1 {
  /**
   * Node type.
   */
  type: 'mdxFlowExpression'

  /**
   * Data associated with the mdast MDX expression (flow).
   */
  data?: MdxFlowExpressionData | undefined
}

/**
 * Info associated with mdast MDX expression (flow) nodes by the ecosystem.
 */
interface MdxFlowExpressionData extends Data$5 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX expression node, occurring in text (phrasing).
 */
interface MdxTextExpression extends Literal$1 {
  /**
   * Node type.
   */
  type: 'mdxTextExpression'

  /**
   * Data associated with the mdast MDX expression (text).
   */
  data?: MdxTextExpressionData | undefined
}

/**
 * Info associated with mdast MDX expression (text) nodes by the ecosystem.
 */
interface MdxTextExpressionData extends Data$5 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX expression node, occurring in flow (block), for hast.
 */
interface MdxFlowExpressionHast extends Literal {
  /**
   * Node type.
   */
  type: 'mdxFlowExpression'

  /**
   * Data associated with the hast MDX expression (flow).
   */
  data?: MdxFlowExpressionHastData | undefined
}

/**
 * Info associated with hast MDX expression (flow) nodes by the ecosystem.
 */
interface MdxFlowExpressionHastData extends Data$4 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX expression node, occurring in text (phrasing), for hast.
 */
interface MdxTextExpressionHast extends Literal {
  /**
   * Node type.
   */
  type: 'mdxTextExpression'

  /**
   * Data associated with the hast MDX expression (text).
   */
  data?: MdxTextExpressionHastData | undefined
}

/**
 * Info associated with hast MDX expression (text) nodes by the ecosystem.
 */
interface MdxTextExpressionHastData extends Data$4 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

// Add nodes to mdast content.
declare module 'mdast' {
  interface RootContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
  }

  interface PhrasingContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
  }

  interface BlockContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface RootContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpressionHast
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpressionHast
  }

  interface ElementContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpressionHast
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpressionHast
  }
}

/**
 * MDX ESM (import/export) node.
 */
interface MdxjsEsm$1 extends Literal$1 {
  /**
   * Node type.
   */
  type: 'mdxjsEsm'

  /**
   * Data associated with mdast MDX.js ESM.
   */
  data?: MdxjsEsmData$1 | undefined
}

/**
 * Info associated with mdast MDX.js ESM nodes by the ecosystem.
 */
interface MdxjsEsmData$1 extends Data$5 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX ESM (import/export) node (for hast).
 */
interface MdxjsEsmHast$1 extends Literal {
  /**
   * Node type.
   */
  type: 'mdxjsEsm'

  /**
   * Data associated with hast MDX.js ESM.
   */
  data?: MdxjsEsmHastData$1 | undefined
}

/**
 * Info associated with hast MDX.js ESM nodes by the ecosystem.
 */
interface MdxjsEsmHastData$1 extends Data$4 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

// Add nodes to mdast content.
declare module 'mdast' {
  interface FrontmatterContentMap {
    /**
     * MDX ESM.
     */
    mdxjsEsm: MdxjsEsm$1
  }

  interface RootContentMap {
    /**
     * MDX ESM.
     */
    mdxjsEsm: MdxjsEsm$1
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface RootContentMap {
    /**
     * MDX ESM.
     */
    mdxjsEsm: MdxjsEsmHast$1
  }
}

/**
 * MDX ESM (import/export) node.
 */
interface MdxjsEsm extends Literal$1 {
  /**
   * Node type.
   */
  type: 'mdxjsEsm'

  /**
   * Data associated with mdast MDX.js ESM.
   */
  data?: MdxjsEsmData | undefined
}

/**
 * Info associated with mdast MDX.js ESM nodes by the ecosystem.
 */
interface MdxjsEsmData extends Data$5 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

/**
 * MDX ESM (import/export) node (for hast).
 */
interface MdxjsEsmHast extends Literal {
  /**
   * Node type.
   */
  type: 'mdxjsEsm'

  /**
   * Data associated with hast MDX.js ESM.
   */
  data?: MdxjsEsmHastData | undefined
}

/**
 * Info associated with hast MDX.js ESM nodes by the ecosystem.
 */
interface MdxjsEsmHastData extends Data$4 {
  /**
   * Program node from estree.
   */
  estree?: Program | null | undefined
}

// Add nodes to mdast content.
declare module 'mdast' {
  interface FrontmatterContentMap {
    /**
     * MDX ESM.
     */
    mdxjsEsm: MdxjsEsm
  }

  interface RootContentMap {
    /**
     * MDX ESM.
     */
    mdxjsEsm: MdxjsEsm
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface RootContentMap {
    /**
     * MDX ESM.
     */
    mdxjsEsm: MdxjsEsmHast
  }
}

type ElementAttributeNameCase$1 = ElementAttributeNameCase$2;
type StylePropertyNameCase$1 = StylePropertyNameCase$2;

type ElementAttributeNameCase = ElementAttributeNameCase$1;
type StylePropertyNameCase = StylePropertyNameCase$1;
type RemarkRehypeOptions = Options;
type SourceMapGenerator = typeof SourceMapGenerator$1;
/**
 * Configuration for `createProcessor`.
 */
type ProcessorOptions$1 = {
    /**
     * Add a source map (object form) as the `map` field on the resulting file
     * (optional).
     */
    SourceMapGenerator?: SourceMapGenerator | null | undefined;
    /**
     * Use this URL as `import.meta.url` and resolve `import` and `export … from`
     * relative to it (optional, example: `import.meta.url`).
     */
    baseUrl?: URL | string | null | undefined;
    /**
     * Whether to add extra info to error messages in generated code and use the
     * development automatic JSX runtime (`Fragment` and `jsxDEV` from
     * `/jsx-dev-runtime`) (default: `false`);
     * when using the webpack loader (`@mdx-js/loader`) or the Rollup integration
     * (`@mdx-js/rollup`) through Vite, this is automatically inferred from how
     * you configure those tools.
     */
    development?: boolean | null | undefined;
    /**
     * Casing to use for attribute names (default: `'react'`);
     * HTML casing is for example `class`, `stroke-linecap`, `xml:lang`;
     * React casing is for example `className`, `strokeLinecap`, `xmlLang`;
     * for JSX components written in MDX, the author has to be aware of which
     * framework they use and write code accordingly;
     * for AST nodes generated by this project, this option configures it
     */
    elementAttributeNameCase?: ElementAttributeNameCase | null | undefined;
    /**
     * format of the file (default: `'mdx'`);
     * `'md'` means treat as markdown and `'mdx'` means treat as MDX.
     */
    format?: 'md' | 'mdx' | null | undefined;
    /**
     * Whether to keep JSX (default: `false`);
     * the default is to compile JSX away so that the resulting file is
     * immediately runnable.
     */
    jsx?: boolean | null | undefined;
    /**
     * Place to import automatic JSX runtimes from (default: `'react'`);
     * when in the `automatic` runtime, this is used to define an import for
     * `Fragment`, `jsx`, `jsxDEV`, and `jsxs`.
     */
    jsxImportSource?: string | null | undefined;
    /**
     * JSX runtime to use (default: `'automatic'`);
     * the automatic runtime compiles to `import _jsx from
     * '$importSource/jsx-runtime'\n_jsx('p')`;
     * the classic runtime compiles to calls such as `h('p')`.
     *
     * > 👉 **Note**: support for the classic runtime is deprecated and will
     * > likely be removed in the next major version.
     */
    jsxRuntime?: 'automatic' | 'classic' | null | undefined;
    /**
     * List of markdown extensions, with dot (default: `['.md', '.markdown', …]`);
     * affects integrations.
     */
    mdExtensions?: ReadonlyArray<string> | null | undefined;
    /**
     * List of MDX extensions, with dot (default: `['.mdx']`);
     * affects integrations.
     */
    mdxExtensions?: ReadonlyArray<string> | null | undefined;
    /**
     * Output format to generate (default: `'program'`);
     * in most cases `'program'` should be used, it results in a whole program;
     * internally `evaluate` uses `'function-body'` to compile to
     * code that can be passed to `run`;
     * in some cases, you might want what `evaluate` does in separate steps, such
     * as when compiling on the server and running on the client.
     */
    outputFormat?: 'function-body' | 'program' | null | undefined;
    /**
     * Pragma for JSX, used in the classic runtime as an identifier for function
     * calls: `<x />` to `React.createElement('x')` (default:
     * `'React.createElement'`);
     * when changing this, you should also define `pragmaFrag` and
     * `pragmaImportSource` too.
     *
     * > 👉 **Note**: support for the classic runtime is deprecated and will
     * > likely be removed in the next major version.
     */
    pragma?: string | null | undefined;
    /**
     * Pragma for fragment symbol, used in the classic runtime as an identifier
     * for unnamed calls: `<>` to `React.createElement(React.Fragment)` (default:
     * `'React.Fragment'`);
     * when changing this, you should also define `pragma` and
     * `pragmaImportSource` too.
     *
     * > 👉 **Note**: support for the classic runtime is deprecated and will
     * > likely be removed in the next major version.
     */
    pragmaFrag?: string | null | undefined;
    /**
     * Where to import the identifier of `pragma` from, used in the classic
     * runtime (default: `'react'`);
     * to illustrate, when `pragma` is `'a.b'` and `pragmaImportSource` is `'c'`
     * the following will be generated: `import a from 'c'` and things such as
     * `a.b('h1', {})`.
     * when changing this, you should also define `pragma` and `pragmaFrag` too.
     *
     * > 👉 **Note**: support for the classic runtime is deprecated and will
     * > likely be removed in the next major version.
     */
    pragmaImportSource?: string | null | undefined;
    /**
     * Place to import a provider from (optional, example: `'@mdx-js/react'`);
     * normally it’s used for runtimes that support context (React, Preact), but
     * it can be used to inject components into the compiled code;
     * the module must export and identifier `useMDXComponents` which is called
     * without arguments to get an object of components (`MDXComponents` from
     * `mdx/types.js`).
     */
    providerImportSource?: string | null | undefined;
    /**
     * List of recma plugins (optional);
     * this is a new ecosystem, currently in beta, to transform esast trees
     * (JavaScript)
     */
    recmaPlugins?: PluggableList | null | undefined;
    /**
     * List of remark plugins (optional).
     */
    remarkPlugins?: PluggableList | null | undefined;
    /**
     * List of rehype plugins (optional).
     */
    rehypePlugins?: PluggableList | null | undefined;
    /**
     * Options to pass through to `remark-rehype` (optional);
     * the option `allowDangerousHtml` will always be set to `true` and the MDX
     * nodes (see `nodeTypes`) are passed through;
     * In particular, you might want to pass configuration for footnotes if your
     * content is not in English.
     */
    remarkRehypeOptions?: Readonly<RemarkRehypeOptions> | null | undefined;
    /**
     * Casing to use for property names in `style` objects (default: `'dom'`);
     * CSS casing is for example `background-color` and `-webkit-line-clamp`;
     * DOM casing is for example `backgroundColor` and `WebkitLineClamp`;
     * for JSX components written in MDX, the author has to be aware of which
     * framework they use and write code accordingly;
     * for AST nodes generated by this project, this option configures it
     */
    stylePropertyNameCase?: StylePropertyNameCase | null | undefined;
    /**
     * Turn obsolete `align` props on `td` and `th` into CSS `style` props
     * (default: `true`).
     */
    tableCellAlignToStyle?: boolean | null | undefined;
};

/**
 * Compile MDX to JS.
 *
 * @param {Readonly<Compatible>} vfileCompatible
 *   MDX document to parse.
 * @param {Readonly<CompileOptions> | null | undefined} [compileOptions]
 *   Compile configuration (optional).
 * @return {Promise<VFile>}
 *   Promise to compiled file.
 */
declare function compile(vfileCompatible: Readonly<Compatible>, compileOptions?: Readonly<CompileOptions$1> | null | undefined): Promise<VFile>;
type VFile = VFile$1;
type Compatible = Compatible$2;
type ProcessorOptions = ProcessorOptions$1;
/**
 * Core configuration.
 */
type CoreProcessorOptions = Omit<ProcessorOptions, 'format'>;
/**
 * Extra configuration.
 */
type ExtraOptions = {
    /**
     * Format of `file` (default: `'detect'`).
     */
    format?: 'detect' | 'md' | 'mdx' | null | undefined;
};
/**
 * Configuration for `compile`.
 *
 * `CompileOptions` is the same as `ProcessorOptions` with the exception that
 * the `format` option supports a `'detect'` value, which is the default.
 * The `'detect'` format means to use `'md'` for files with an extension in
 * `mdExtensions` and `'mdx'` otherwise.
 */
type CompileOptions$1 = CoreProcessorOptions & ExtraOptions;

type MdxCompileOptions = Parameters<typeof compile>[1];
type BabelOptions = Parameters<typeof transformAsync>[1];
interface CompileOptions {
    mdxCompileOptions?: MdxCompileOptions;
}
type LoaderOptions = {
    filepath?: string;
    [key: string]: any;
} & any;
interface LoaderContext {
    async: () => (err: Error | null, result?: string) => void;
    getOptions: () => LoaderOptions;
    resourcePath: string;
}
declare function loader(this: LoaderContext, content: string): Promise<void>;

export { BabelOptions, CompileOptions, MdxCompileOptions, loader as default };
