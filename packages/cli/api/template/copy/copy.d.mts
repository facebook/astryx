/**
 * Scaffold an already-resolved template to `targetPath` (relative to `cwd`) and
 * return the `template.copy` receipt.
 * @param {import('../_adapter.mjs').DiscoveredTemplate} match
 * @param {{targetPath: string, cwd: string}} ctx
 * @returns {import('../template.type.mjs').TemplateCopyResponse}
 */
export function templateCopy(match: import("../_adapter.mjs").DiscoveredTemplate, { targetPath, cwd }: {
    targetPath: string;
    cwd: string;
}): import("../template.type.mjs").TemplateCopyResponse;
