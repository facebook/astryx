// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for `@astryxdesign/cli/authoring`.
 *
 * Authoring is a pure data contract: the TYPES you write plain objects against,
 * and the PARSERS the CLI runs at the load boundary (`unknown` → typed, or a
 * readable throw). Zod is sealed inside each parser and never appears here.
 * There are no `create*` factories — author a plain object and stamp its `type`.
 *
 * This file reads as a menu: the handful of things you author sit up top, the
 * field/sub-types they compose from are grouped below the divider, and internal
 * runner types are not exported here at all.
 *
 * NOTE: this barrel is a `.d.ts` on purpose. It is a pure re-export (including
 * the parser value bindings from `./*.mjs`), and downstream package builds
 * resolve `@astryxdesign/cli/authoring` here via the `types` condition. Their
 * tsconfigs run with `skipLibCheck` (which skips `.d.ts`) but no `allowJs`, so a
 * real `.ts` barrel would make tsc follow the `.mjs` re-exports and fail TS7016.
 * The runtime entry is the sibling `index.mjs`.
 */

// ═══════════════════════════════════════════════════════════════════════
// AUTHOR THESE — each is the default export of one authored file.
// ═══════════════════════════════════════════════════════════════════════
export type {ComponentDoc} from './doctypes/types'; //   Button.doc.{ts,mjs}
export type {HookDoc} from './doctypes/types'; //         useToast.doc.{ts,mjs}
export type {FunctionDoc} from './doctypes/types'; //     search.doc.mjs (hook | api)
export type {ReferenceDoc} from './doctypes/types'; //    theming.doc.{ts,mjs}
export type {TemplateDoc} from './doctypes/types'; //     Foo.template.{ts,mjs}
export type {SchemaDoc} from './doctypes/types'; //       config.doc.mjs (object shape)
export type {CommandDoc} from './doctypes/types'; //      search.doc.mjs (CLI command)
export type {EnumDoc} from './doctypes/types'; //         error-codes.doc.mjs (vocabulary)
export type {AstryxConfig} from './config/type'; //       astryx.config.{ts,mjs}
export type {AstryxIntegration} from './integration/type'; // astryx.integration.{ts,mjs}
export type {AstryxCodemod, AstryxConfigCodemod} from './codemod/type'; // codemods/*

// ═══════════════════════════════════════════════════════════════════════
// PARSERS — the CLI's load boundary (types come from each parser's JSDoc).
// ═══════════════════════════════════════════════════════════════════════
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
export {parseConfig} from './config/parse.mjs';
export {parseIntegration} from './integration/parse.mjs';
export {parseCodemod} from './codemod/parse.mjs';

// ═══════════════════════════════════════════════════════════════════════
// FIELD & SUB-TYPES — the building blocks of the docs above. Import these
// only to annotate a part directly (or to read/render docs); you rarely
// need them to author. Names carry the doc kind they belong to.
// ═══════════════════════════════════════════════════════════════════════
export type {
  // component
  SingleComponentDoc,
  MultiComponentDoc,
  ComponentEntry,
  ComponentGroupDoc,
  ComponentTranslationDoc,
  ComponentPropDoc,
  ComponentExampleDoc,
  ComponentAnatomyElement,
  ComponentBestPractice,
  ComponentSlotElement,
  ComponentPlaygroundConfig,
  ComponentThemingTarget,
  ComponentThemingVar,
  ComponentThemingDerivedVar,
  UsageDoc,
  // hook
  HookParamDoc,
  HookReturnDoc,
  HookTranslationDoc,
  // function (hooks + CLI/API functions)
  FunctionReturnDoc,
  FunctionThrowsDoc,
  FunctionExampleDoc,
  // reference
  ReferenceSection,
  ReferenceContentBlock,
  ReferenceTokenPreviewType,
  ReferenceTranslationDoc,
  // template
  TemplateCategory,
  // schema
  SchemaFieldDoc,
  // command
  CommandArgDoc,
  CommandOptionDoc,
  CommandExampleDoc,
  // enum
  EnumMemberDoc,
} from './doctypes/types';
export type {PostCodemodHook} from './config/type';
export type {
  AstryxCodemodDef,
  AstryxConfigCodemodDef,
  AstryxCodemodFile,
  AstryxCodemodApi,
  AstryxCodemodTransform,
} from './codemod/type';
