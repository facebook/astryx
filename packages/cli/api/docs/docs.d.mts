/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<
 *   import('./docs.type.mjs').DocsListResponse |
 *   import('./docs.type.mjs').DocsDetailResponse |
 *   import('./docs.type.mjs').DocsDetailSectionResponse
 * >}
 */
export function docs(topic?: string, section?: string, options?: {
    lang?: string | undefined;
    zh?: boolean | undefined;
    dense?: boolean | undefined;
}): Promise<import("./docs.type.mjs").DocsListResponse | import("./docs.type.mjs").DocsDetailResponse | import("./docs.type.mjs").DocsDetailSectionResponse>;
import { list } from './list/list.mjs';
import { detail } from './detail/detail.mjs';
import { section as sectionLeaf } from './detail/section/section.mjs';
export { list, detail, sectionLeaf as section };
