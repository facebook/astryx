/** @param {import('../../lib/xle/xle-ast').RawIssue} issue */
export function formatIssue(issue: import("../../lib/xle/xle-ast").RawIssue): string;
/**
 * Parse + validate, throwing structured XDSErrors on failure.
 * Returns {doc, registry, blocks, warnings}.
 *
 * @param {string} expression
 * @param {{form?: 'compact'|'outline'|'auto', loose?: boolean, cwd?: string}} [options]
 */
export function analyze(expression: string, { form, loose, cwd }?: {
    form?: "compact" | "outline" | "auto";
    loose?: boolean;
    cwd?: string;
}): Promise<{
    doc: import("../../lib/xle/xle-ast").XLEDoc;
    registry: import("../../lib/xle/xle-ast").Registry;
    blocks: LayoutBlock[];
    errors: import("../../lib/xle/xle-ast").RawIssue[];
    warnings: import("../../lib/xle/xle-ast").RawIssue[];
}>;
export type LayoutBlock = {
    dirName: string;
    name: string;
    kind: "template" | "component";
    type?: string | undefined;
    description?: string | undefined;
    category?: string | undefined;
    importPath?: string | undefined;
    filePath?: string | undefined;
    isDefault?: boolean | undefined;
};
