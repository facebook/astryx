/**
 * Import specifier for install/scaffold instructions. Drops a leading `src/`
 * from the cwd-relative dir (most consumers import from a file under src/) but
 * keeps the rest of the path (e.g. `themes/gothic`). Callers note the path is
 * relative to the consumer's file.
 * Exported (not just used by `themeBuild`'s install instructions) because the
 * thin CLI's `theme add` action reuses it for its own scaffold instructions.
 * @param {string} relDir
 * @param {string} base
 * @returns {string}
 */
export function importSpecifier(relDir: string, base: string): string;
/**
 * Compile a defineTheme file to CSS + JS + .d.ts (and an optional
 * `.variants.d.ts`). Performs the writes and returns a `theme.build` receipt,
 * or `null` when the theme produced no CSS (nothing to build). Throws
 * AstryxError (stable code) on failure. Progress is emitted through `logger`
 * (silent by default).
 *
 * @param {string} file - Theme file path, resolved against `cwd`.
 * @param {{out?: string}} [options] - `out` overrides the output CSS path.
 * @param {{cwd?: string, logger?: ThemeBuildLogger}} [ctx]
 * @returns {Promise<import('../theme.type.mjs').ThemeBuildResponse | null>}
 */
export function themeBuild(file: string, options?: {
    out?: string;
}, { cwd, logger }?: {
    cwd?: string;
    logger?: ThemeBuildLogger;
}): Promise<import("../theme.type.mjs").ThemeBuildResponse | null>;
export type ThemeBuildLogger = {
    /**
     * - stdout (install/receipt lines)
     */
    log: (m?: string) => void;
    /**
     * - stderr (component-override warnings)
     */
    warn: (m?: string) => void;
    /**
     * - stderr (private-var errors)
     */
    error: (m?: string) => void;
};
