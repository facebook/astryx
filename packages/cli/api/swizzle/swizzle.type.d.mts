/**
 * xds --json swizzle [--list]
 */
export type SwizzleListResponse = {
    type: "swizzle.list";
    data: string[];
};
/**
 * Maintainer feedback note emitted after a successful swizzle.
 */
export type SwizzleFeedback = {
    /**
     * Where to report the gap that led to swizzling.
     */
    issuesUrl: string;
    /**
     * Ready-to-run `gh issue create` command, when `gh` is available.
     */
    ghCommand?: string | undefined;
};
/**
 * xds --json swizzle <component>
 */
export type SwizzleCopyResponse = {
    type: "swizzle.copy";
    data: {
        component: string;
        package: string;
        outputDir: string;
        filesCopied: number;
        files: string[];
        usesStyleX: boolean;
        feedback?: SwizzleFeedback | undefined;
    };
};
/**
 * Options for `swizzle()`.
 */
export type SwizzleOptions = {
    cwd?: string | undefined;
    /**
     * Output directory (must resolve inside cwd). Defaults to ./components/astryx.
     */
    output?: string | undefined;
    /**
     * Scope to a specific owning package when a name is ambiguous.
     */
    package?: string | undefined;
    /**
     * Force the list response even with a component argument.
     */
    list?: boolean | undefined;
    /**
     * Overwrite existing files instead of erroring.
     */
    overwrite?: boolean | undefined;
};
