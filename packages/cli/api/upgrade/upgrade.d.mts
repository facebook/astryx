/**
 * @typedef {import('./_adapter.mjs').UpgradeOptions} UpgradeOptions
 */
/**
 * Run the upgrade pipeline. Validates the invocation, then dispatches to the
 * list/status/run leaves. Returns the leaf's receipt; throws AstryxError on
 * failure. Progress is emitted through the shared `logger` (silent by default).
 *
 * @param {UpgradeOptions} [options]
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('./upgrade.type.mjs').UpgradeListResponse | import('./upgrade.type.mjs').UpgradeStatusResponse | import('./upgrade.type.mjs').UpgradeRunResponse>}
 */
export function upgrade(options?: UpgradeOptions, { cwd }?: {
    cwd?: string;
}): Promise<import("./upgrade.type.mjs").UpgradeListResponse | import("./upgrade.type.mjs").UpgradeStatusResponse | import("./upgrade.type.mjs").UpgradeRunResponse>;
export type UpgradeOptions = import("./_adapter.mjs").UpgradeOptions;
