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
