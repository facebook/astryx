// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Command doc types — the TERMINAL binding of an operation. A command is
 * not its own kind of behavior; it is a FunctionDoc exposed on the CLI, so this
 * doc references the function via `fn` and only carries CLI-surface facts (args,
 * flags, subcommands, terminal examples, exit codes). It is designed to be the
 * single source that a `defineCommand` converter turns into Commander config +
 * `--help`. Colocated at `clients/cli/commands/<name>.doc.mjs`.
 */

import type {ReferenceContentBlock} from '../reference/type';

/** A positional argument. `param` links it to a FunctionDoc param for its description. */
export interface CommandArgDoc {
  name: string;
  /** FunctionDoc param this arg binds to (inherits its description). */
  param?: string;
  /** Override description (else inherited from the referenced param). */
  description?: string;
  required?: boolean;
  variadic?: boolean;
}

/** A flag/option. `param` links it to a FunctionDoc param; `cliOnly` for flags
 *  with no function param (e.g. --json). */
export interface CommandOptionDoc {
  /** Commander flag spec, e.g. '-l, --limit <n>' | '--json'. */
  flag: string;
  /** FunctionDoc param this flag maps to (inherits its description). */
  param?: string;
  /** Override/explicit description (required when cliOnly). */
  description?: string;
  choices?: string[];
  /** Default value applied via Commander `.default()` (shown in --help). A
   *  boolean flag defaults to `false`; a repeatable value flag to `string[]`. */
  default?: string | boolean | string[];
  /** True for CLI-only flags with no function param. */
  cliOnly?: boolean;
}

export interface CommandExampleDoc {
  label?: string;
  /** A full terminal invocation, e.g. 'astryx search button --json'. */
  cli: string;
  /** Optional sample output. */
  output?: string;
}

/**
 * A CLI command documentation file (.doc.mjs).
 *
 *   /\*\* @type {import('@astryxdesign/cli/authoring').CommandDoc} \*\/
 *   export const doc = { type: 'command', name: 'search', fn: 'search', ... };
 */
export interface CommandDoc {
  /** Doc-kind discriminant. */
  type?: 'command';
  /** Command path, e.g. 'search' | 'theme build'. */
  name: string;
  /** Human-readable display name, e.g. 'astryx search'. */
  displayName: string;
  /** One-line summary → Commander `.description()` + the docs listing. */
  summary: string;
  /** Longer help body / when-to-use. */
  description?: string;
  /** Docs namespace path. Defaults to 'cli' when applied by the docs index. */
  namespace?: string;
  /** Alternate slugs that also resolve to this doc. */
  aliases?: string[];
  /** Name of the FunctionDoc (and `@astryxdesign/cli/api` export) this wraps. */
  fn?: string;
  /** Positional arguments. */
  args?: CommandArgDoc[];
  /** Flags/options. */
  options?: CommandOptionDoc[];
  /** Subcommand names (for command groups like `theme` / `layout`). */
  subcommands?: string[];
  /** Terminal examples. */
  examples?: CommandExampleDoc[];
  /** Documented exit codes. */
  exitCodes?: {code: number; when: string}[];
  /** Related command names. */
  related?: string[];
  /** Freeform prose/notes. */
  notes?: ReferenceContentBlock[];
}
