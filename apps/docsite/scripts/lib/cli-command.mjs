// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The docsite's door into the CLI's command picker.
 *
 * Docs write commands as bare `astryx ...`, and whoever shows a doc prefixes
 * them with the command its readers run. The CLI does that with the project's
 * invocation; the docsite does it with its own door name, `npx astryx`, the
 * form its pages have always shown. Same monorepo-relative import as the
 * ShadCN registry generator: the door is not part of the CLI's public API.
 *
 * @position apps/docsite/scripts/lib — read by generate-data.mjs.
 */

export {runWithCliDoor} from '../../../../packages/cli/foundation/env/cli-command.mjs';
export {
  getCliInvocation,
  prefixCliCommands,
} from '../../../../packages/cli/foundation/env/package-manager.mjs';

/** The command docsite pages show for running the CLI. */
export const DOCSITE_CLI_COMMAND = 'npx astryx';
