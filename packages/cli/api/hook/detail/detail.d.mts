/**
 * @param {string} name
 * @param {{cwd?: string, zh?: boolean, lang?: string|null}} [options]
 * @returns {Promise<import('../hook.type.mjs').HookDetailResponse>}
 */
export function detail(name: string, { cwd, zh, lang }?: {
    cwd?: string;
    zh?: boolean;
    lang?: string | null;
}): Promise<import("../hook.type.mjs").HookDetailResponse>;
