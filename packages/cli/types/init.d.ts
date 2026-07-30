// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Response types for the `init` API (@astryxdesign/cli/api → init).
 * Options live in api.d.ts (like UpgradeOptions).
 */

export interface InitRunData {
  /** `default` (no flags) or `features` (--features/--all). */
  mode: 'default' | 'features';
  /** Features that were run, in order. */
  features: string[];
  /** Agent-doc files written (empty if agents weren't run or install failed). */
  docsWritten: string[];
  /** Soft agent-docs failure, if any. `path-safety` also implies a non-zero exit. */
  docsError: {kind: 'path-safety' | 'install-failed'; message?: string} | null;
  /** Whether theme guidance was emitted. */
  theme: boolean;
  /** Template outcome (`workflow` is the CLI default; `created`/`skipped` are programmatic). */
  template: 'workflow' | 'created' | 'skipped' | null;
  /** Relative output path when `template === 'created'`. */
  templatePath: string | null;
  /** Whether the getting-started "Next steps" were emitted (default mode). */
  nextSteps: boolean;
}

export interface InitRunResponse {
  type: 'init.run';
  data: InitRunData;
}

export interface InitRemoveResponse {
  type: 'init.remove';
  data: {removed: true};
}
