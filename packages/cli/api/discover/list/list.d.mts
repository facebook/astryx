/**
 * Build the discover.list response. An empty `packages` set produces the empty
 * envelope carrying `meta.configured`, so callers can distinguish "nothing
 * configured" from "configured but nothing discovered".
 *
 * @param {import('../../../lib/package-scanner.mjs').ScannedPackage[]} packages
 * @param {{configured: boolean}} meta
 * @returns {import('../discover.type.mjs').DiscoverListResponse}
 */
export function list(packages: import("../../../lib/package-scanner.mjs").ScannedPackage[], { configured }: {
    configured: boolean;
}): import("../discover.type.mjs").DiscoverListResponse;
