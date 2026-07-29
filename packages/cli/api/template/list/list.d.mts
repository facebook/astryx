/**
 * Project a discovered template set into the `template.list` envelope.
 * @param {import('../_adapter.mjs').DiscoveredTemplate[]} templates
 * @param {{type?: 'page' | 'block', package?: string}} [options]
 * @returns {import('../template.type.mjs').TemplateListResponse}
 */
export function templateList(templates: import("../_adapter.mjs").DiscoveredTemplate[], options?: {
    type?: "page" | "block";
    package?: string;
}): import("../template.type.mjs").TemplateListResponse;
