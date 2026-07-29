/**
 * @typedef {import('./_adapter.mjs').UpgradeOptions} UpgradeOptions
 */
/**
 * Run the upgrade pipeline. Validates the invocation, then dispatches to the
 * list/status/run leaves. Returns the leaf's receipt; throws AstryxError on
 * failure. Progress is emitted through `logger` (silent by default).
 *
 * @param {UpgradeOptions} [options]
 * @param {{cwd?: string, logger?: import('../../lib/term-log.mjs').CliLogger}} [ctx]
 * @returns {Promise<import('./upgrade.type.mjs').UpgradeListResponse | import('./upgrade.type.mjs').UpgradeStatusResponse | import('./upgrade.type.mjs').UpgradeRunResponse>}
 */
export function upgrade(options?: UpgradeOptions, { cwd, logger }?: {
    cwd?: string;
    logger?: import("../../lib/term-log.mjs").CliLogger;
}): Promise<import("./upgrade.type.mjs").UpgradeListResponse | import("./upgrade.type.mjs").UpgradeStatusResponse | import("./upgrade.type.mjs").UpgradeRunResponse>;
export { refreshAgentDocs } from "./_adapter.mjs";
export type UpgradeOptions = import("./_adapter.mjs").UpgradeOptions;
