// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file config.ts
 * @input An app's Astryx config object.
 * @output A type-preserving `createConfig` helper plus the `AstryxConfig`
 *   surface authors write in `astryx.config.{ts,mjs,js}`.
 * @position Consumer-facing authoring surface. Lives in `@astryxdesign/core`
 *   (not the CLI) so an app's config file gets editor/type feedback without
 *   taking a dependency on the CLI. The CLI re-exports this from
 *   `@astryxdesign/cli/config` for back-compat.
 *
 * `createConfig` is an intentionally tiny runtime identity function: it returns
 * its argument unchanged. Its value is the exported TypeScript surface.
 * Validation is NOT performed here — it happens at the CLI load boundary.
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

/**
 * Type-preserving helper for the Astryx config file. Returns its argument
 * unchanged; the value is the exported TypeScript surface so config files get
 * editor/type feedback. Validation happens at the CLI load boundary.
 */
export function createConfig<T extends AstryxConfig>(config: T): T {
  return config;
}
