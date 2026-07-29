/**
 * xds --json theme build <file>
 */
export type ThemeBuildResponse = {
    type: "theme.build";
    data: {
        name: string;
        tokenCount: number;
        componentCount: number;
        sizeKB: number;
        outputs: {
            css: string;
            js: string;
            dts: string;
            variantsDts?: string;
        };
        warnings: string[];
    };
};
/**
 * A single theme entry as surfaced by `theme list`.
 */
export type ThemeListEntry = {
    slug: string;
    displayName: string;
    description: string;
    maintained: boolean;
};
/**
 * xds --json theme list
 */
export type ThemeListResponse = {
    type: "theme.list";
    data: ThemeListEntry[];
};
/**
 * xds --json theme add <slug>
 */
export type ThemeAddResponse = {
    type: "theme.add";
    data: {
        slug: string;
        displayName: string;
        maintained: boolean;
        outputDir: string;
        entry: string;
        exportName: string;
        files: string[];
    };
};
