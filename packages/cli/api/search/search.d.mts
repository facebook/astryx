/**
 * Light stemmer: strips common English suffixes so "charts"/"charting" and
 * "chart" share a root. Deliberately crude (no Porter) — good enough to bridge
 * plural/gerund gaps without a dependency.
 * @param {string} w
 * @returns {string}
 */
export function stem(w: string): string;
/**
 * Split a query into meaningful content tokens (lowercased, stopwords + very
 * short words removed). Empty for single-word queries (callers fall back to
 * whole-phrase scoring).
 * @param {string} term - Already-lowercased query.
 * @returns {string[]}
 */
export function tokenizeQuery(term: string): string[];
/**
 * @param {string} term - Lowercased full query.
 * @param {string[]} tokens - Content tokens from tokenizeQuery(term).
 * @param {Candidate} candidate
 * @returns {{score: number, reason: string} | null}
 */
export function scoreQuery(term: string, tokens: string[], candidate: Candidate): {
    score: number;
    reason: string;
} | null;
/**
 * Score a single candidate against the search term across name, keywords,
 * and prose signals. Returns the best (highest) score plus a human reason,
 * or null if nothing matched above the floor.
 *
 * @param {string} term - Lowercased search term.
 * @param {object} candidate
 * @param {string} candidate.name - Primary identifier (component/hook name, topic, template name).
 * @param {string[]} [candidate.keywords]
 * @param {string} [candidate.description]
 * @param {string[]} [candidate.prose] - Extra free-text blobs (doc section text, best practices).
 * @returns {{score: number, reason: string} | null}
 */
export function scoreCandidate(term: string, { name, keywords, description, prose }: {
    name: string;
    keywords?: string[] | undefined;
    description?: string | undefined;
    prose?: string[] | undefined;
}): {
    score: number;
    reason: string;
} | null;
/**
 * Unified ranked search across components, hooks, docs, and templates.
 *
 * @param {string} query - Free-text search term.
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {'component'|'hook'|'doc'|'template'} [options.type] - Restrict to one domain.
 * @param {number} [options.limit] - Max results (default 20).
 * @returns {Promise<{type: 'search', data: {query: string, results: Array<object>}}>}
 */
export function search(query: string, options?: {
    cwd?: string | undefined;
    type?: "component" | "hook" | "doc" | "template" | undefined;
    limit?: number | undefined;
}): Promise<{
    type: "search";
    data: {
        query: string;
        results: Array<object>;
    };
}>;
/** Valid domain filters for `--type`. */
export const SEARCH_DOMAINS: string[];
/**
 * A search candidate gathered from one content domain. Extra underscore-
 * prefixed fields carry domain-specific payload used only by {@link toResult}.
 */
export type Candidate = {
    domain: "component" | "hook" | "doc" | "template";
    name: string;
    keywords?: string[] | undefined;
    description?: string | undefined;
    prose?: string[] | undefined;
    _import?: string | undefined;
    _title?: string | undefined;
    _displayName?: string | undefined;
    _kind?: "page" | "block" | undefined;
};
