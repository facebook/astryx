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

/** xds --json upgrade [--apply] */
export interface UpgradeRunResponse {
  type: 'upgrade.run';
  data: {
    from: string;
    to: string;
    codemods: number;
    depsUpdated: string[];
    agentDocsRefreshed: boolean;
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
    | {status: 'up_to_date'; from: string; to: string}
    | {status: 'no_codemods'; from: string; to: string}
    | {
        status: 'config_fixable';
        from: string;
        to: string;
        configError: string;
        configCodemods: string[];
        suggestedCommand: string;
        message: string;
        note: string;
      };
}
