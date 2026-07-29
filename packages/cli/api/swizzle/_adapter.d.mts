/**
 * Locate @astryxdesign/core for `cwd` and list its swizzlable components.
 * @param {string} cwd
 * @returns {{coreDir: string, components: string[]}}
 */
export function resolveCore(cwd: string): {
    coreDir: string;
    components: string[];
};
