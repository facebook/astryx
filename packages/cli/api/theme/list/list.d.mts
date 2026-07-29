/**
 * List the themes bundled with this CLI build (the ones `theme add` can
 * scaffold). Pure projection of the manifest; no I/O beyond the adapter read.
 * @returns {import('../theme.type.mjs').ThemeListResponse}
 */
export function themeList(): import("../theme.type.mjs").ThemeListResponse;
