/**
 * Project a resolved doc + owner into the `component.detail` envelope.
 * @param {import('../_adapter.mjs').LoadedComponentDoc} docs
 * @param {{package: string, sourcePath: string|null}} owner
 * @param {string} componentName - name used for the import specifier
 * @param {string} coreDir
 * @returns {import('../component.type.mjs').ComponentDetailResponse}
 */
export function componentDetail(docs: import("../_adapter.mjs").LoadedComponentDoc, owner: {
    package: string;
    sourcePath: string | null;
}, componentName: string, coreDir: string): import("../component.type.mjs").ComponentDetailResponse;
