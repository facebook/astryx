// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for `@astryxdesign/cli/authoring`: every authoring type
 * plus every parser signature. Zod never appears here.
 */

// ── Types authors write plain objects against ─────────────────────────
export type * from './config/type';
export type * from './integration/type';
export type * from './codemod/type';
export type * from './doctypes/types';

// ── Parsers the CLI calls at the load boundary (types from JSDoc) ──────
export {parseConfig} from './config/parse.mjs';
export {parseIntegration} from './integration/parse.mjs';
export {parseCodemod} from './codemod/parse.mjs';
export {parseDoc} from './doctypes/parse.mjs';
export {parseComponent} from './doctypes/component/parse.mjs';
export {parseHook} from './doctypes/hook/parse.mjs';
export {parseReference} from './doctypes/reference/parse.mjs';
export {parseTemplate} from './doctypes/template/parse.mjs';
export {parseLegacyDoc} from './doctypes/legacy.mjs';
