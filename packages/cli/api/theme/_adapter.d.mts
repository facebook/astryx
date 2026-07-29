/**
 * A single bundled theme entry from `templates/themes/manifest.json`.
 * @typedef {object} BundledTheme
 * @property {string} slug
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} maintained
 * @property {string} entry
 * @property {string} exportName
 * @property {string[]} files
 */
/**
 * Parsed `themes` array from the bundle manifest (empty if not generated).
 * @returns {BundledTheme[]}
 */
export function listThemes(): BundledTheme[];
/**
 * Resolve a bundled theme by slug (case-insensitive). `undefined` when the slug
 * is empty or unknown.
 * @param {string} [slug]
 * @returns {BundledTheme | undefined}
 */
export function findTheme(slug?: string): BundledTheme | undefined;
/** Directory holding the generated theme bundle. */
export const THEMES_DIR: string;
/** The bundle manifest that lists every theme (+ its files). */
export const MANIFEST_PATH: string;
/**
 * A single bundled theme entry from `templates/themes/manifest.json`.
 */
export type BundledTheme = {
    slug: string;
    displayName: string;
    description: string;
    maintained: boolean;
    entry: string;
    exportName: string;
    files: string[];
};
