// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Compact, non-blocking integration-issue nudge for everyday commands.
 *
 * When a CONFIGURED integration (from the Project's `loadedIntegrations`) has
 * validation issues, the everyday commands (component / template / upgrade)
 * should print ONE compact, non-blocking line per integration telling the user
 * to run `validate-integration` — instead of silently skipping broken
 * contributions or spamming per-contribution diagnostics.
 *
 * Design constraints (all enforced here):
 *   - Reuses the validate-integration validators (validateLoadedIntegration);
 *     no validation logic is duplicated.
 *   - Writes to STDERR only, so it never corrupts a --json stdout envelope.
 *   - Suppressed entirely in --json mode.
 *   - Best-effort: never throws, never changes the exit code. Broken
 *     contributions are still skipped downstream exactly as before; this only
 *     ADDS a one-line nudge.
 */

import {validateLoadedIntegration} from '../api/validate-integration.mjs';

/**
 * For each configured (already-loaded) integration, compute its issues using
 * the shared validate-integration validators and, if any exist, print exactly
 * ONE line per integration to stderr:
 *
 *   Warning: <pkg> has N integration issue(s). Run: astryx validate-integration <pkg>
 *
 * @param {Array<object>} loadedIntegrations the Project's loaded integrations
 * @param {{json?: boolean}} [options]
 * @returns {Promise<void>}
 */
export async function warnOnIntegrationIssues(loadedIntegrations, {json = false} = {}) {
  try {
    // Cheap guard: only do work when integrations are actually configured.
    if (json) return;
    if (!Array.isArray(loadedIntegrations) || loadedIntegrations.length === 0) {
      return;
    }
    for (const integration of loadedIntegrations) {
      if (!integration || typeof integration !== 'object') continue;
      let issues;
      try {
        issues = await validateLoadedIntegration(integration);
      } catch {
        // Best-effort: a validator throwing must not break the host command.
        continue;
      }
      if (!Array.isArray(issues) || issues.length === 0) continue;
      const pkg = integration.name ?? integration.__spec ?? '(integration)';
      // Stderr only — keeps stdout (and any --json envelope) clean.
      console.error(
        `Warning: ${pkg} has ${issues.length} integration issue(s). ` +
          `Run: astryx validate-integration ${pkg}`,
      );
    }
  } catch {
    // Never throw, never change the exit code.
  }
}
