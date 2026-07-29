/**
 * Build the discover.detail response for a scoped package name. Throws
 * AstryxError (ERR_UNKNOWN_PACKAGE) — with the available packages as
 * suggestions — when no package matches.
 *
 * @param {import('../../../lib/package-scanner.mjs').ScannedPackage[]} packages
 * @param {string} query scoped package name, e.g. `@scope/name`
 * @returns {import('../discover.type.mjs').DiscoverDetailResponse}
 */
export function detail(packages: import("../../../lib/package-scanner.mjs").ScannedPackage[], query: string): import("../discover.type.mjs").DiscoverDetailResponse;
