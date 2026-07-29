/**
 * Run the upgrade pipeline for a validated, non-list invocation. Returns the
 * terminal run receipt, or one of the status short-circuits; throws AstryxError
 * on failure. Progress is emitted through `logger` (silent by default).
 *
 * @param {import('../_adapter.mjs').UpgradeOptions} [options]
 * @param {{cwd?: string, logger?: import('../../../lib/term-log.mjs').CliLogger}} [ctx]
 * @returns {Promise<import('../upgrade.type.mjs').UpgradeStatusResponse | import('../upgrade.type.mjs').UpgradeRunResponse>}
 */
export function run(options?: import("../_adapter.mjs").UpgradeOptions, { cwd, logger }?: {
    cwd?: string;
    logger?: import("../../../lib/term-log.mjs").CliLogger;
}): Promise<import("../upgrade.type.mjs").UpgradeStatusResponse | import("../upgrade.type.mjs").UpgradeRunResponse>;
