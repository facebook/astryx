// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Upgrade command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json upgrade --list                 -> upgrade.list
 * xds --json upgrade [--apply]              -> upgrade.run
 * xds --json upgrade (status short-circuit) -> upgrade.status
 * (version detection failure)               -> CLIError
 */

/** xds --json upgrade --list */
export interface UpgradeListResponse {
  type: 'upgrade.list';
  data: UpgradeListEntry[];
}

export interface UpgradeListEntry {
  name: string;
  title: string;
  version: string;
}

/**
 * State of the managed agent-docs block (`<!-- ASTRYX:START --> … END -->`)
 * relative to the installed core version, plus what `upgrade` did about it.
 * Present on every upgrade response (run, status, and the codemod/config error
 * envelopes) because the block is refreshed independently of codemods.
 *
 * - `refreshed`     — a stale block was rewritten (`--apply` only).
 * - `would-refresh` — a stale block was detected in dry-run; nothing written.
 * - `nudge-init`    — no managed block exists; user should run `init`.
 * - `error`         — refresh was attempted but writing failed.
 * - `none`          — nothing to do (block already current).
 */
export interface AgentDocsSummary {
  status: 'missing' | 'stale' | 'current';
  /** Installed core version the block should reflect. */
  installedVersion: string;
  /** Distinct stale block versions found (the "from" side of the refresh). */
  fromVersions: string[];
  /** Files rewritten (apply) or that would be rewritten (dry-run). */
  files: string[];
  /** True only when a block was actually rewritten (apply mode). */
  refreshed: boolean;
  action: 'refreshed' | 'would-refresh' | 'nudge-init' | 'error' | 'none';
}

/** xds --json upgrade [--apply] */
export interface UpgradeRunResponse {
  type: 'upgrade.run';
  data: {
    from: string;
    to: string;
    codemods: number;
    /** Integration packages processed in this upgrade (by name/spec). */
    integrations: string[];
    agentDocsRefreshed: boolean;
    agentDocs: AgentDocsSummary;
    /** Total files changed across core + integration codemods (apply mode). */
    filesChanged?: number;
    /** Total transforms that reported a change. */
    transformsApplied?: number;
    /** Per-codemod errors, when any codemod failed. */
    errors?: Array<{file: string; codemod: string; error: string}>;
  };
}

/**
 * xds --json upgrade — short-circuit status results.
 *
 * - `up_to_date`: `--from` is >= installed target and `--force` was not passed.
 * - `no_codemods`: no codemods (core or integration) apply to the range.
 * - `config_fixable`: DRY-RUN ONLY. The consumer's astryx.config currently
 *   fails strict validation, but a pending core CONFIG codemod (in the selected
 *   range) would repair it. The dry run previews the fix without writing and
 *   reports the exact command to apply it; integrations are skipped for the
 *   preview (they will be processed on the `--apply` run).
 */
export interface UpgradeStatusResponse {
  type: 'upgrade.status';
  data:
    | {
        status: 'up_to_date';
        from: string;
        to: string;
        agentDocs: AgentDocsSummary;
      }
    | {
        status: 'no_codemods';
        from: string;
        to: string;
        agentDocs: AgentDocsSummary;
      }
    | {
        status: 'config_fixable';
        from: string;
        to: string;
        configError: string;
        configCodemods: string[];
        suggestedCommand: string;
        message: string;
        note: string;
        agentDocs: AgentDocsSummary;
      };
}
