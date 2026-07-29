/**
 * Read a resolved component source path into the `component.detail.source`
 * envelope. Throws ERR_NO_SOURCE when the owner ships no source file.
 * @param {string} componentName - bare name, echoed back as `data.component`
 * @param {string|null} sourcePath - the resolved source path (null → not found)
 * @param {{name: string, notFoundInPackage?: string|null}} ctx - `name` is the caller's original input; `notFoundInPackage` scopes the not-found message to a package
 * @returns {import('../../component.type.mjs').ComponentDetailSourceResponse}
 */
export function componentDetailSource(componentName: string, sourcePath: string | null, { name, notFoundInPackage }: {
    name: string;
    notFoundInPackage?: string | null;
}): import("../../component.type.mjs").ComponentDetailSourceResponse;
