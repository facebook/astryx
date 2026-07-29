/**
 * xds --json discover
 */
export type DiscoverListResponse = {
    type: "discover.list";
    data: DiscoverListEntry[];
    /**
     * Present when the list is empty so
     * callers can distinguish "no packages configured" from "configured but
     * nothing discovered".
     */
    meta?: {
        configured: boolean;
    } | undefined;
};
export type DiscoverListEntry = {
    name: string;
    category: string;
    components: string[];
    version?: string | undefined;
    description?: string | undefined;
    displayName?: string | undefined;
};
/**
 * xds --json discover
 */
export type DiscoverDetailResponse = {
    type: "discover.detail";
    data: DiscoverListEntry;
};
/**
 * xds --json discover
 */
export type DiscoverDetailDocResponse = {
    type: "discover.detail.doc";
    data: import("../../../core/src/docs-types").ComponentDoc;
};
/**
 * xds --json discover <searchterm> (multiple matches)
 */
export type DiscoverSearchResponse = {
    type: "discover.search";
    data: {
        query: string;
        matches: DiscoverSearchEntry[];
    };
};
export type DiscoverSearchEntry = {
    package: string;
    component: string;
};
/**
 * Options for `discover()`.
 */
export type DiscoverOptions = {
    components?: boolean | undefined;
    lang?: string | undefined;
    zh?: boolean | undefined;
};
