/**
 * `--from` is at/after the installed target (and no `--force`): nothing to run.
 * @param {{from: string, to: string, agentDocs: import('../upgrade.type.mjs').AgentDocsSummary}} data
 * @param {import('../../../lib/term-log.mjs').CliLogger} [logger]
 * @returns {import('../upgrade.type.mjs').UpgradeStatusResponse}
 */
export function statusUpToDate({ from, to, agentDocs }: {
    from: string;
    to: string;
    agentDocs: import("../upgrade.type.mjs").AgentDocsSummary;
}, logger?: import("../../../lib/term-log.mjs").CliLogger): import("../upgrade.type.mjs").UpgradeStatusResponse;
/**
 * No core or integration codemods apply to the requested version range.
 * @param {{from: string, to: string, agentDocs: import('../upgrade.type.mjs').AgentDocsSummary}} data
 * @param {import('../../../lib/term-log.mjs').CliLogger} [logger]
 * @returns {import('../upgrade.type.mjs').UpgradeStatusResponse}
 */
export function statusNoCodemods({ from, to, agentDocs }: {
    from: string;
    to: string;
    agentDocs: import("../upgrade.type.mjs").AgentDocsSummary;
}, logger?: import("../../../lib/term-log.mjs").CliLogger): import("../upgrade.type.mjs").UpgradeStatusResponse;
/**
 * DRY-RUN only: the consumer's astryx.config fails strict validation, but a
 * pending core CONFIG codemod previewed a change that would repair it. Preview
 * the fix + report the exact `--apply` command; integrations are skipped here.
 * @param {{from: string, to: string, configError: string, configCodemods: string[], agentDocs: import('../upgrade.type.mjs').AgentDocsSummary}} data
 * @param {import('../../../lib/term-log.mjs').CliLogger} [logger]
 * @returns {import('../upgrade.type.mjs').UpgradeStatusResponse}
 */
export function statusConfigFixable({ from, to, configError, configCodemods, agentDocs }: {
    from: string;
    to: string;
    configError: string;
    configCodemods: string[];
    agentDocs: import("../upgrade.type.mjs").AgentDocsSummary;
}, logger?: import("../../../lib/term-log.mjs").CliLogger): import("../upgrade.type.mjs").UpgradeStatusResponse;
