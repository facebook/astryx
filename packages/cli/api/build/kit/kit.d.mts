/**
 * The grouped composition kit for what you're building.
 *
 * @param {string} query what you're building (e.g. "analytics dashboard")
 * @param {{cwd?: string, type?: import('../../../types/search').SearchDomain, limit?: number}} [options]
 * @returns {Promise<import('../build.type.mjs').BuildKitResponse>}
 */
export function buildKit(query: string, options?: {
    cwd?: string;
    type?: import("../../../types/search").SearchDomain;
    limit?: number;
}): Promise<import("../build.type.mjs").BuildKitResponse>;
