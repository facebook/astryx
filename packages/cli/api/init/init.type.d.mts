export type InitRunData = {
    /**
     * `default` (no flags) or `features` (--features/--all).
     */
    mode: "default" | "features";
    /**
     * Features that were run, in order.
     */
    features: string[];
    /**
     * Agent-doc files written (empty if agents weren't run or install failed).
     */
    docsWritten: string[];
    /**
     * Soft agent-docs failure, if any. `path-safety` also implies a non-zero exit.
     */
    docsError: {
        kind: "path-safety" | "install-failed";
        message?: string;
    } | null;
    /**
     * Whether theme guidance was emitted.
     */
    theme: boolean;
    /**
     * Template outcome (`workflow` is the CLI default; `created`/`skipped` are programmatic).
     */
    template: "workflow" | "created" | "skipped" | null;
    /**
     * Relative output path when `template === 'created'`.
     */
    templatePath: string | null;
    /**
     * Whether the getting-started "Next steps" were emitted (default mode).
     */
    nextSteps: boolean;
};
export type InitRunResponse = {
    type: "init.run";
    data: InitRunData;
};
export type InitRemoveResponse = {
    type: "init.remove";
    data: {
        removed: true;
    };
};
/**
 * Options for `init()`.
 */
export type InitOptions = {
    /**
     * Comma-separated features to install (agents, theme, template).
     */
    features?: string | undefined;
    /**
     * Install all features.
     */
    all?: boolean | undefined;
    /**
     * Remove the managed agent-docs block instead of installing.
     */
    removeAgents?: boolean | undefined;
    /**
     * Agent preset: claude, cursor, codex, hermes, all.
     */
    agent?: string | undefined;
    /**
     * Explicit agent-docs file path(s).
     */
    agentDocsPath?: string | string[] | undefined;
    /**
     * Scaffold a named page template (programmatic only; the CLI never sets it).
     */
    templateName?: string | undefined;
};
