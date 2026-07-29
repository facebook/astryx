export type HookDoc = import("../../../core/src/docs-types").HookDoc;
export type HookParamDoc = import("../../../core/src/docs-types").HookParamDoc;
/**
 * xds --json hook [--list] [--category X] [--detail names|compact|full]
 *
 * The list view emits ONE `hook.list` type across all three detail levels; the
 * depth is carried in `data.detail` and `data.components` holds the grouped map
 * whose entry shape depends on that level:
 *   - 'names'   -> string[]         (hook names only)
 *   - 'compact' -> HookBriefEntry[] (name + 1-line description + import)
 *   - 'full'    -> HookDoc[]         (full authored doc per entry)
 */
export type HookListResponse = {
    type: "hook.list";
    data: HookListData;
};
/**
 * Detail-tagged payload for `hook.list` (discriminated on `detail`).
 */
export type HookListData = {
    detail: "names";
    components: Record<string, string[]>;
} | {
    detail: "compact";
    components: Record<string, HookBriefEntry[]>;
} | {
    detail: "full";
    components: Record<string, HookDoc[]>;
};
/**
 * A single entry in a `hook.list` group at `detail: 'compact'`.
 */
export type HookBriefEntry = {
    name: string;
    description: string;
    import: string;
};
/**
 * xds --json hook <name>
 */
export type HookDetailResponse = {
    type: "hook.detail";
    data: HookDoc;
};
/**
 * xds --json hook <name> --params
 */
export type HookDetailParamsResponse = {
    type: "hook.detail.params";
    data: HookParamDoc[];
};
/**
 * Options for `hook()`.
 */
export type HookOptions = {
    cwd?: string | undefined;
    list?: boolean | undefined;
    category?: string | undefined;
    params?: boolean | undefined;
    detail?: "compact" | "full" | "brief" | undefined;
    lang?: string | undefined;
    zh?: boolean | undefined;
};
