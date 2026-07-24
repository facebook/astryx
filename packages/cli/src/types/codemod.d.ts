// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for the file-based codemod-authoring API exported from
 * `@astryxdesign/cli/codemod`.
 */

/** A single source file presented to a codemod's transform. */
export interface AstryxCodemodFile {
  /** Absolute path to the file being transformed. */
  path: string;
  /** The current source contents of the file. */
  source: string;
}

/** Helpers and context passed to a codemod's transform as the second argument. */
export interface AstryxCodemodApi {
  /** A jscodeshift instance configured with a parser for the file. */
  jscodeshift: unknown;
  /** Report a statistic (no-op-friendly; provided for jscodeshift parity). */
  stats: (...args: unknown[]) => void;
  /** Report progress (no-op-friendly; provided for jscodeshift parity). */
  report: (...args: unknown[]) => void;
}

/**
 * A codemod's transform. Return the new source to rewrite the file, or
 * `null`/`undefined` to leave the file unchanged.
 */
export type AstryxCodemodTransform = (
  file: AstryxCodemodFile,
  api: AstryxCodemodApi,
) => string | null | undefined;

/** Definition accepted by {@link createCodemod}. */
export interface AstryxCodemodDef {
  /** Short, human-readable title shown in upgrade output. */
  title: string;
  /** Optional longer description. */
  description?: string;
  /** When true, the codemod runs only when explicitly requested. */
  isOptional?: boolean;
  /** File extensions this codemod applies to (e.g. ['.tsx', '.ts']). */
  fileExtensions?: string[];
  /** The transform function. */
  transform: AstryxCodemodTransform;
}

/** Result of {@link createCodemod}. */
export interface AstryxCodemod extends AstryxCodemodDef {
  isOptional: boolean;
  type: 'code';
}

/** Definition accepted by {@link createConfigCodemod}. */
export interface AstryxConfigCodemodDef {
  /** Short, human-readable title shown in upgrade output. */
  title: string;
  /** Optional longer description. */
  description?: string;
  /** When true, the codemod runs only when explicitly requested. */
  isOptional?: boolean;
  /** The transform function applied to the astryx.config.* file. */
  transform: AstryxCodemodTransform;
}

/** Result of {@link createConfigCodemod}. */
export interface AstryxConfigCodemod extends AstryxConfigCodemodDef {
  isOptional: boolean;
  type: 'config';
}

/** Define a file-transforming codemod. */
export declare function createCodemod<T extends AstryxCodemodDef>(
  def: T,
): AstryxCodemod;

/** Define a codemod that targets the consumer's astryx.config.* file. */
export declare function createConfigCodemod<T extends AstryxConfigCodemodDef>(
  def: T,
): AstryxConfigCodemod;

// ---------------------------------------------------------------------------
// Internal types (used by the CLI codemod runner infrastructure & transforms).
// These are not part of the public authoring surface but are shared across the
// .mjs files under src/codemods/ so JSDoc annotations stay consistent.
// ---------------------------------------------------------------------------

/**
 * jscodeshift transform signature. jscodeshift ships no type declarations, so
 * the AST surface (`api.jscodeshift`, paths, node attributes) is untyped by
 * design; transforms operate on it dynamically.
 */
export type CodemodTransform = (
  file: AstryxCodemodFile,
  api: CodemodTransformApi,
) => string | null | undefined;

/**
 * The `api` argument as seen INSIDE a transform implementation. Identical to
 * {@link AstryxCodemodApi} except `jscodeshift` is typed as the callable
 * factory (jscodeshift ships no types, so the AST it returns is untyped). Used
 * by the .mjs transforms so `const j = api.jscodeshift; j(file.source)` type-checks.
 */
export interface CodemodTransformApi {
  jscodeshift: JscodeshiftFactory;
  stats: (...args: unknown[]) => void;
  report: (...args: unknown[]) => void;
}

/**
 * A normalized codemod entry as produced by both the core registry runner and
 * integration discovery. See the header of `run-codemod.mjs` for the contract.
 */
export interface CodemodEntry {
  /** Unique id within its package/version (e.g. the transform module name). */
  id: string;
  /** Whether this is a source-file codemod or a config-file codemod. */
  type: 'code' | 'config';
  /** The codemod itself. */
  codemod: {
    title: string;
    description?: string;
    isOptional?: boolean;
    fileExtensions?: string[];
    transform: CodemodTransform;
  };
  /** Owning package name. */
  package: string;
  /** Owning package version. */
  version?: string;
}

/** The result of running a single codemod over one or more files. */
export interface CodemodRunResult {
  filesChanged: number;
  writtenFiles: string[];
  errors: Array<{file: string; codemod: string; error: string}>;
}

/** The console-like log surface used across the codemod runners. */
export interface CliLog {
  step: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  message?: (...args: unknown[]) => void;
}

/**
 * The jscodeshift factory (the module's default export / `withParser` root).
 * Callable and carries `withParser`; both return an untyped jscodeshift API.
 *
 * `any` is unavoidable here: jscodeshift ships no types and its AST/builder
 * surface is fully dynamic (`j(src)`, `j.JSXElement`, `path.node`, …). `unknown`
 * would break the callable + index access the transforms rely on.
 */
export interface JscodeshiftFactory {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (...args: any[]): any;
  withParser: (parser: string) => any;
  /** AST node types and builders (j.JSXElement, j.jsxAttribute, ...) are untyped. */
  [key: string]: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
