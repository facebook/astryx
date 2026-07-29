/**
 * @param {string} name
 * @param {{cwd?: string, zh?: boolean, lang?: string|null}} [options]
 * @returns {Promise<import('../../hook.type.mjs').HookDetailParamsResponse>}
 */
export function params(name: string, { cwd, zh, lang }?: {
    cwd?: string;
    zh?: boolean;
    lang?: string | null;
}): Promise<import("../../hook.type.mjs").HookDetailParamsResponse>;
