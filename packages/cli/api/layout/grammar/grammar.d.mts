/**
 * `astryx layout grammar` — the agent cheatsheet, with the alias table
 * generated from this branch's registry (never hand-maintained).
 *
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('../layout.type.mjs').LayoutGrammarResponse>}
 */
export function layoutGrammar(options?: {
    cwd?: string;
}): Promise<import("../layout.type.mjs").LayoutGrammarResponse>;
