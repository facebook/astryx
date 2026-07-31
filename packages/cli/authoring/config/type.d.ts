// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for an Astryx config file (`astryx.config.{ts,mjs,js}`).
 *
 * Authors write a plain object against {@link AstryxConfig} — in TS via
 * `satisfies AstryxConfig`, in JS via `/** @type {import('@astryxdesign/cli/authoring').AstryxConfig} *\/`.
 * The CLI turns the loaded value into this type via `parseConfig` at the load
 * boundary; there is no factory to call.
 */

/**
 * A command to run as part of a post-codemod hook. Returned by a hook's
 * `buildCommand` and executed after codemods write files.
 */
export interface PostCodemodCommand {
  command: string;
  args?: string[];
  options?: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
  };
}

/**
 * A post-codemod hook. `buildCommand` receives the package directory and the
 * list of files changed by codemods, and returns the command to run (or a
 * nullish value to skip).
 */
export type PostCodemodHook = {
  name?: string;
  buildCommand: (ctx: {
    packageDir: string;
    files: string[];
  }) =>
    | PostCodemodCommand
    | null
    | undefined
    | Promise<PostCodemodCommand | null | undefined>;
};

/** A component XLE layout expressions can reference by name via `{hint}`. */
export interface XleComponent {
  /** Import specifier the component is imported from, e.g. '@/components/KpiCard'. */
  from: string;
  /** Optional human description shown in tooling. */
  description?: string;
  /** Import as the module's default export instead of a named export. Defaults to false. */
  default?: boolean;
}

/** User config exported from astryx.config.{ts,mjs,js}. */
export interface AstryxConfig {
  /** Integration package names to load. */
  integrations?: string[];
  /** Where to file issues/feedback for this project. */
  issuesUrl?: string;
  /** Lifecycle hooks. */
  hooks?: {
    postCodemod?: PostCodemodHook[];
  };
  /**
   * EXPERIMENTAL — shape may change and is not part of the stable config
   * contract. Provisional home for features still being proven out.
   */
  experimental?: {
    /** Experimental XLE (layout expression) configuration. */
    xle?: {
      /**
       * Register app-local components so XLE layout expressions can
       * reference them by name via {hint}. Keyed by component name.
       */
      components?: Record<string, XleComponent>;
    };
  };
}
