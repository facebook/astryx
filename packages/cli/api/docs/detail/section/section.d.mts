/**
 * @param {string} topic
 * @param {string} sectionName
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<import('../../docs.type.mjs').DocsDetailSectionResponse>}
 */
export function section(topic: string, sectionName: string, options?: {
    lang?: string | undefined;
    zh?: boolean | undefined;
    dense?: boolean | undefined;
}): Promise<import("../../docs.type.mjs").DocsDetailSectionResponse>;
