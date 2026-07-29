/**
 * Validate an already-LOADED integration (as produced by
 * `loadIntegrations` in lib/integrations.mjs — absolute contribution roots
 * plus identity) and return its issues. This is the reuse seam for everyday
 * commands that have already loaded the configured integrations and want the
 * SAME validators that `validate-integration` runs, without re-resolving the
 * manifest from disk.
 *
 * The manifest schema is intentionally NOT re-validated here: `loadIntegrations`
 * already validated it (and throws otherwise), so by the time a command holds a
 * loaded integration the manifest is known-good. We re-run the on-disk
 * contribution checks (roots + codemods/templates/components) because those can
 * regress independently of the manifest (a deleted directory, a broken template).
 *
 * @param {import('../../lib/integrations.mjs').LoadedIntegration} loaded loaded-integration-shaped object
 * @returns {Promise<Issue[]>}
 */
export function validateLoadedIntegration(loaded: import("../../lib/integrations.mjs").LoadedIntegration): Promise<Issue[]>;
/**
 * Validate the LOCAL integration package rooted at `cwd`: nearest package.json
 * + a single sibling astryx.integration.{ts,mjs,js}. A missing manifest yields
 * `found: false` (guidance, not an error) so callers stay exit-0.
 * @param {string} [cwd]
 * @returns {Promise<ValidateResult>}
 */
export function validateLocalIntegration(cwd?: string): Promise<ValidateResult>;
/**
 * Validate an INSTALLED integration package resolved from `cwd`/node_modules.
 * @param {string} spec package name
 * @param {string} [cwd]
 * @returns {Promise<ValidateResult>}
 */
export function validateInstalledIntegration(spec: string, cwd?: string): Promise<ValidateResult>;
/**
 * Unified entry: validate the LOCAL integration (no `pkg`) or an INSTALLED one
 * (`pkg` given) and return the `integration.validate` envelope. The no-manifest
 * local case is guidance, not an error — it comes back with `name: null` and no
 * issues so the CLI can print a hint and stay exit-0.
 *
 * This is the seam that keeps the CLI a thin wrapper: the command handler calls
 * this and only chooses how to render (human vs --json) + the exit code.
 *
 * @param {string} [pkg] installed package name; omit to validate the cwd package
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('./validate-integration.type.mjs').ValidateIntegrationResponse>}
 */
export function validateIntegration(pkg?: string, options?: {
    cwd?: string;
}): Promise<import("./validate-integration.type.mjs").ValidateIntegrationResponse>;
/**
 * Summarize issues by severity.
 * @param {Issue[]} issues
 * @returns {{errors: number, warnings: number}}
 */
export function summarizeIssues(issues: Issue[]): {
    errors: number;
    warnings: number;
};
export type Issue = import("../../types/integration").AstryxIntegrationIssue;
export type ValidateResult = {
    /**
     * Whether an integration manifest was located.
     */
    found: boolean;
    /**
     * Integration package name (from package.json).
     */
    name?: string | undefined;
    /**
     * Integration package version.
     */
    version?: string | undefined;
    /**
     * Absolute path to the loaded manifest.
     */
    manifestFile?: string | undefined;
    issues: Issue[];
};
