/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {boolean} [options.list]
 * @param {string} [options.category]
 * @param {string} [options.package] - Scope to a specific external package (e.g. '@acme/xds-widgets')
 * @param {boolean} [options.props]
 * @param {boolean} [options.source]
 * @param {boolean} [options.showcase]
 * @param {boolean} [options.blocks]
 * @param {'full'|'compact'|'brief'} [options.detail] - Defaults to 'full' for a single component, 'brief' for list views (list/category/no name), matching the CLI.
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<(
 *   import('./component.type.mjs').ComponentListResponse
 *   | import('./component.type.mjs').ComponentDetailResponse
 *   | import('./component.type.mjs').ComponentDetailPropsResponse
 *   | import('./component.type.mjs').ComponentDetailSourceResponse
 *   | import('./component.type.mjs').ComponentDetailShowcaseResponse
 *   | import('./component.type.mjs').ComponentDetailBlocksResponse
 * )>}
 */
export function component(name?: string, options?: {
    cwd?: string | undefined;
    list?: boolean | undefined;
    category?: string | undefined;
    package?: string | undefined;
    props?: boolean | undefined;
    source?: boolean | undefined;
    showcase?: boolean | undefined;
    blocks?: boolean | undefined;
    detail?: "compact" | "full" | "brief" | undefined;
    lang?: string | undefined;
    zh?: boolean | undefined;
    dense?: boolean | undefined;
}): Promise<(import("./component.type.mjs").ComponentListResponse | import("./component.type.mjs").ComponentDetailResponse | import("./component.type.mjs").ComponentDetailPropsResponse | import("./component.type.mjs").ComponentDetailSourceResponse | import("./component.type.mjs").ComponentDetailShowcaseResponse | import("./component.type.mjs").ComponentDetailBlocksResponse)>;
