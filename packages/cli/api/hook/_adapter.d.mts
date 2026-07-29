/**
 * Locate the @astryxdesign/core package directory, or throw the same
 * ERR_CORE_NOT_FOUND envelope the flat command threw. Shared by every hook leaf.
 * @param {string} cwd
 * @returns {string} Absolute path to the core package directory.
 */
export function resolveCoreDir(cwd: string): string;
/**
 * Resolve a single hook's authored doc by name, or throw ERR_UNKNOWN_HOOK with
 * fuzzy (levenshtein) suggestions. Shared by the detail and detail.params
 * leaves, which both start from a resolved hook doc.
 * @param {string} coreDir
 * @param {string} name
 * @param {{zh?: boolean, lang?: string|null}} [opts]
 * @returns {Promise<import('./hook.type.mjs').HookDoc>}
 */
export function resolveHookDoc(coreDir: string, name: string, { zh, lang }?: {
    zh?: boolean;
    lang?: string | null;
}): Promise<import("./hook.type.mjs").HookDoc>;
