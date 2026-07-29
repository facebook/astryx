/**
 * Remove the managed agent-docs block and return an `init.remove` receipt.
 * Progress is emitted through `logger` (silent by default).
 *
 * @param {{cwd?: string, logger?: import('../_adapter.mjs').InitLogger}} [ctx]
 * @returns {Promise<import('../init.type.mjs').InitRemoveResponse>}
 */
export function remove({ cwd, logger }?: {
    cwd?: string;
    logger?: import("../_adapter.mjs").InitLogger;
}): Promise<import("../init.type.mjs").InitRemoveResponse>;
