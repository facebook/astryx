/**
 * xds --json docs
 */
export type DocsListResponse = {
    type: "docs.list";
    data: DocsListEntry[];
};
export type DocsListEntry = {
    topic: string;
    description: string;
};
/**
 * xds --json docs <topic>
 */
export type DocsDetailResponse = {
    type: "docs.detail";
    data: import("../../../core/src/docs-types").ReferenceDoc;
};
/**
 * xds --json docs <topic> <section>
 */
export type DocsDetailSectionResponse = {
    type: "docs.detail.section";
    data: import("../../../core/src/docs-types").ReferenceSection;
};
/**
 * Options for `docs()`.
 */
export type DocsOptions = {
    lang?: string | undefined;
    zh?: boolean | undefined;
    dense?: boolean | undefined;
};
