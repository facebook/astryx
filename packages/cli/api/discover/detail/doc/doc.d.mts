/**
 * Wrap an already-resolved component in the discover.detail.doc envelope by
 * loading + validating its docs. The single place the envelope is built.
 *
 * @param {import('../../_adapter.mjs').ComponentResolution} result
 * @param {{lang?: string | null, zh?: boolean}} opts
 * @returns {Promise<import('../../discover.type.mjs').DiscoverDetailDocResponse>}
 */
export function docFromResult(result: import("../../_adapter.mjs").ComponentResolution, opts: {
    lang?: string | null;
    zh?: boolean;
}): Promise<import("../../discover.type.mjs").DiscoverDetailDocResponse>;
/**
 * Resolve a `@scope/name/Component` query to its validated docs. Throws
 * AstryxError (ERR_UNKNOWN_PACKAGE) when the scope is unknown, or
 * (ERR_UNKNOWN_COMPONENT) — with substring/fuzzy suggestions — when the
 * component is not in the package.
 *
 * @param {import('../../../../lib/package-scanner.mjs').ScannedPackage[]} packages
 * @param {string} pkgName
 * @param {string} compName
 * @param {{lang?: string | null, zh?: boolean}} opts
 * @returns {Promise<import('../../discover.type.mjs').DiscoverDetailDocResponse>}
 */
export function doc(packages: import("../../../../lib/package-scanner.mjs").ScannedPackage[], pkgName: string, compName: string, { lang, zh }: {
    lang?: string | null;
    zh?: boolean;
}): Promise<import("../../discover.type.mjs").DiscoverDetailDocResponse>;
