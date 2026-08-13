// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `@astryxdesign/cli/authoring` — one home for Astryx authoring.
 *
 * Authoring is a pure data contract: TYPES authors write plain objects against,
 * and PARSERS the CLI calls to turn `unknown` into the typed shape (or throw a
 * readable error) at the load boundary. Zod is an implementation detail sealed
 * inside each parser — it is never exported here and never appears in a public
 * type. There are no `create*` factories: author a plain object and stamp its
 * `type` directly.
 *
 * Types (config, integration, codemod, and the doc vocabulary —
 * component/hook/reference/template) are re-exported via `./index.ts`.
 */

export {parseConfig} from './config/parse.mjs';
export {parseIntegration} from './integration/parse.mjs';
export {parseCodemod} from './codemod/parse.mjs';
export {parseDoc} from './doctypes/parse.mjs';
export {parseComponent} from './doctypes/component/parse.mjs';
export {parseHook} from './doctypes/hook/parse.mjs';
export {parseFunction} from './doctypes/function/parse.mjs';
export {parseReference} from './doctypes/reference/parse.mjs';
export {parseTemplate} from './doctypes/template/parse.mjs';
export {parseSchema} from './doctypes/schema/parse.mjs';
export {parseCommand} from './doctypes/command/parse.mjs';
export {parseEnum} from './doctypes/enum/parse.mjs';
export {parseLegacyDoc} from './doctypes/legacy.mjs';
