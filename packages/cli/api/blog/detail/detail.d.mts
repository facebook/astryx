/**
 * Read one post identified by slug (case-insensitive) via its .txt alternate.
 * @param {string} slug
 * @returns {Promise<import('../blog.type.mjs').BlogDetailResponse>}
 */
export function detail(slug: string): Promise<import("../blog.type.mjs").BlogDetailResponse>;
