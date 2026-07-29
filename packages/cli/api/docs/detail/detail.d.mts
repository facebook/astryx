/**
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<import('../docs.type.mjs').DocsDetailResponse>}
 */
export function detail(topic: string, options?: {
    lang?: string | undefined;
    zh?: boolean | undefined;
    dense?: boolean | undefined;
}): Promise<import("../docs.type.mjs").DocsDetailResponse>;
