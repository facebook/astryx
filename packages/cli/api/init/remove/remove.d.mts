/**
 * Remove the managed agent-docs block and return an `init.remove` receipt.
 * Progress is emitted through the shared `logger` (silent by default).
 *
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('../init.type.mjs').InitRemoveResponse>}
 */
export function remove({ cwd }?: {
    cwd?: string;
}): Promise<import("../init.type.mjs").InitRemoveResponse>;
