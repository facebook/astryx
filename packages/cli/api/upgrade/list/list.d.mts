/**
 * List every available codemod (oldest→newest).
 * @param {{logger?: import('../../../lib/term-log.mjs').CliLogger}} [ctx]
 * @returns {Promise<import('../upgrade.type.mjs').UpgradeListResponse>}
 */
export function list({ logger }?: {
    logger?: import("../../../lib/term-log.mjs").CliLogger;
}): Promise<import("../upgrade.type.mjs").UpgradeListResponse>;
