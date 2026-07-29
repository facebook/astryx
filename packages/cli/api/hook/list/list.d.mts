/**
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {string} [options.category] - When set, list only this category.
 * @param {'full'|'compact'|'brief'|'names'} [options.detail] - Anything other than 'compact'/'full' renders names only.
 * @param {boolean} [options.zh]
 * @param {string|null} [options.lang]
 * @returns {Promise<import('../hook.type.mjs').HookListResponse>}
 */
export function list({ cwd, category, detail, zh, lang }?: {
    cwd?: string | undefined;
    category?: string | undefined;
    detail?: "compact" | "full" | "brief" | "names" | undefined;
    zh?: boolean | undefined;
    lang?: string | null | undefined;
}): Promise<import("../hook.type.mjs").HookListResponse>;
