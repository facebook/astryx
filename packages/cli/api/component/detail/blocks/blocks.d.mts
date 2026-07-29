/**
 * Project a component's related blocks into the `component.detail.blocks`
 * envelope, splitting them into the hero showcase, component-specific examples,
 * and broader related blocks.
 * @param {string} componentName
 * @returns {Promise<import('../../component.type.mjs').ComponentDetailBlocksResponse>}
 */
export function componentDetailBlocks(componentName: string): Promise<import("../../component.type.mjs").ComponentDetailBlocksResponse>;
