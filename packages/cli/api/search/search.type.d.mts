/**
 * The domain a search result belongs to.
 */
export type SearchDomain = "component" | "hook" | "doc" | "template";
/**
 * A single ranked search result, tagged with its domain.
 */
export type SearchResultEntry = {
    /**
     * - Which content domain this result came from.
     */
    domain: SearchDomain;
    /**
     * - Primary identifier (component/hook name, doc topic, template dir).
     */
    name: string;
    /**
     * - Relevance score (higher is better).
     */
    score: number;
    /**
     * - Human-readable reason the candidate matched (e.g. `keyword "button"`).
     */
    reason: string;
    /**
     * - One-line description, when available.
     */
    description: string;
    /**
     * - Follow-up command to act on this result (e.g. `astryx component Button`).
     */
    command: string;
    /**
     * - Import path — present for component and hook results.
     */
    import?: string | undefined;
    /**
     * - Doc title — present for doc results.
     */
    title?: string | undefined;
    /**
     * - Friendly display name — present for template results.
     */
    displayName?: string | undefined;
    /**
     * - Template kind (`page` | `block`) — present for template results.
     */
    kind?: "page" | "block" | undefined;
};
/**
 * xds --json search <query>
 */
export type SearchResponse = {
    type: "search";
    data: {
        query: string;
        results: SearchResultEntry[];
    };
};
/**
 * Options for `search()`.
 */
export type SearchOptions = {
    cwd?: string | undefined;
    type?: SearchDomain | undefined;
    limit?: number | undefined;
};
