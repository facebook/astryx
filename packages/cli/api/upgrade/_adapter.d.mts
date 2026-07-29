/**
 * @typedef {object} CoreTransformEntry
 * @property {string} name
 * @property {import('../../types/codemod').CodemodTransform} transform
 * @property {{title: string, description?: string, pr?: string, codemodType?: string}} meta
 * @property {boolean} [optional]
 */
/** @typedef {{version: string, transforms: CoreTransformEntry[]}} CoreVersionManifest */
/**
 * @typedef {object} UpgradeOptions
 * @property {boolean} [list]
 * @property {string} [from]
 * @property {boolean} [apply]
 * @property {boolean} [force]
 * @property {string} [codemod]
 * @property {string[]} [skipCodemod]
 * @property {string[]} [integration]
 * @property {string} [path]
 * @property {boolean} [installDeps]
 */
/**
 * Detect the installed target version from node_modules.
 * @param {string} cwd
 * @returns {{version: string, packageName: string}|null}
 */
export function detectInstalledTargetVersion(cwd: string): {
    version: string;
    packageName: string;
} | null;
/**
 * @param {(string | null | undefined | false)[] | undefined} files
 * @returns {string[]}
 */
export function uniqueFiles(files: (string | null | undefined | false)[] | undefined): string[];
/**
 * Run the app config's post-codemod hooks (config.hooks.postCodemod).
 * Dry-run PREVIEWS (buildCommand still called, so a throw fails); apply executes.
 * @param {import('../../types/config').PostCodemodHook[]} hooks
 * @param {{packageDir: string, files: string[], apply: boolean}} context
 * @param {import('../../lib/term-log.mjs').CliLogger} logger
 */
export function runPostCodemodHooks(hooks: import("../../types/config").PostCodemodHook[], context: {
    packageDir: string;
    files: string[];
    apply: boolean;
}, logger: import("../../lib/term-log.mjs").CliLogger): Promise<void>;
/**
 * Refresh (or, in dry-run, report) the managed agent-docs block after a version
 * bump. The block documents the INSTALLED library, so it must be re-synced on
 * EVERY upgrade path, including the no-codemods short-circuits (#4168).
 *
 * @param {{cwd: string, installedVersion: string, apply: boolean, logger?: import('../../lib/term-log.mjs').CliLogger}} ctx
 * @returns {import('./upgrade.type.mjs').AgentDocsSummary}
 */
export function refreshAgentDocs({ cwd, installedVersion, apply, logger }: {
    cwd: string;
    installedVersion: string;
    apply: boolean;
    logger?: import("../../lib/term-log.mjs").CliLogger;
}): import("./upgrade.type.mjs").AgentDocsSummary;
/**
 * Every registered codemod (oldest→newest) for `upgrade --list`. Registry walk
 * + flatten; nothing is run.
 * @returns {Promise<Array<{name: string, title: string, version: string, pr?: string, optional: boolean}>>}
 */
export function collectAllCodemods(): Promise<Array<{
    name: string;
    title: string;
    version: string;
    pr?: string;
    optional: boolean;
}>>;
/**
 * Core version manifests for the (from, to] range.
 * @param {string} from
 * @param {string} to
 * @returns {Promise<CoreVersionManifest[]>}
 */
export function getCoreVersionManifests(from: string, to: string): Promise<CoreVersionManifest[]>;
/**
 * Ensure jscodeshift is available before running codemods.
 * @param {{installDeps?: boolean, logger?: import('../../lib/term-log.mjs').CliLogger}} [options]
 * @returns {Promise<boolean>}
 */
export function ensureCodemodDeps({ installDeps, logger }?: {
    installDeps?: boolean;
    logger?: import("../../lib/term-log.mjs").CliLogger;
}): Promise<boolean>;
/**
 * Run the CORE registry codemods. Runs BEFORE the config is loaded so a core
 * CONFIG codemod can repair a config the strict loader would otherwise reject.
 * @param {CoreVersionManifest[]} versionManifests
 * @param {{apply: boolean, path: string, codemod?: string, skipCodemods: Set<string>, logger?: import('../../lib/term-log.mjs').CliLogger}} options
 */
export function runCoreCodemods(versionManifests: CoreVersionManifest[], { apply, path: srcPath, codemod, skipCodemods, logger }: {
    apply: boolean;
    path: string;
    codemod?: string;
    skipCodemods: Set<string>;
    logger?: import("../../lib/term-log.mjs").CliLogger;
}): Promise<{
    totalFilesChanged: number;
    totalTransformsApplied: number;
    totalValidationBlocked: number;
    writtenFiles: string[];
    errors: Array<{
        file: string;
        codemod: string;
        error: string;
    }>;
    skippedOptional: Array<{
        name: string;
        meta: {
            title: string;
            description?: string;
            fileExtensions?: string[];
            codemodType?: string;
        };
        version: string;
    }>;
} | {
    ok: false;
    reason: string;
    resolvedPath: string;
}>;
/**
 * Load the consumer project's config + integrations. Throws on invalid config;
 * the run leaf decides between the config_fixable preview and a hard abort.
 * @param {string} cwd
 * @param {string[]} [extraIntegrationSpecs] explicit `--integration` specs
 * @returns {Promise<{postCodemodHooks: import('../../types/config').PostCodemodHook[], integrations: import('../../lib/integrations.mjs').LoadedIntegration[]}>}
 */
export function loadProjectContext(cwd: string, extraIntegrationSpecs?: string[]): Promise<{
    postCodemodHooks: import("../../types/config").PostCodemodHook[];
    integrations: import("../../lib/integrations.mjs").LoadedIntegration[];
}>;
/**
 * Non-blocking nudge for integration validation issues. Never throws (a broken
 * nudge must not fail the upgrade) and is suppressed for --json/programmatic
 * callers (the silent logger).
 * @param {Array<import('../../lib/integrations.mjs').LoadedIntegration>} integrations
 * @param {import('../../lib/term-log.mjs').CliLogger} [logger]
 * @returns {Promise<void>}
 */
export function warnIntegrationIssues(integrations: Array<import("../../lib/integrations.mjs").LoadedIntegration>, logger?: import("../../lib/term-log.mjs").CliLogger): Promise<void>;
/**
 * Discover + select the integration codemods that apply in the (from, to]
 * range. An integration whose codemods fail to load is SKIPPED (a definition
 * error is surfaced by the nudge, not a hard failure of the upgrade).
 * @param {Array<import('../../lib/integrations.mjs').LoadedIntegration>} integrations
 * @param {string} from
 * @param {string} to
 * @returns {Promise<Array<{version: string, codemods: import('../../types/codemod').CodemodEntry[]}>>}
 */
export function selectIntegrationCodemodsFor(integrations: Array<import("../../lib/integrations.mjs").LoadedIntegration>, from: string, to: string): Promise<Array<{
    version: string;
    codemods: import("../../types/codemod").CodemodEntry[];
}>>;
/**
 * Run the file-based INTEGRATION codemods (config codemods first, then code).
 * @param {Array<{version: string, codemods: import('../../types/codemod').CodemodEntry[]}>} versionGroups
 * @param {{apply: boolean, path: string, codemod?: string, skipCodemods: Set<string>, logger?: import('../../lib/term-log.mjs').CliLogger}} options
 */
export function runIntegrationCodemodsStep(versionGroups: Array<{
    version: string;
    codemods: import("../../types/codemod").CodemodEntry[];
}>, { apply, path: srcPath, codemod, skipCodemods, logger }: {
    apply: boolean;
    path: string;
    codemod?: string;
    skipCodemods: Set<string>;
    logger?: import("../../lib/term-log.mjs").CliLogger;
}): Promise<{
    totalFilesChanged: number;
    totalTransformsApplied: number;
    writtenFiles: string[];
    errors: Array<{
        file: string;
        codemod: string;
        error: string;
    }>;
    skippedOptional: Array<import("../../types/codemod").CodemodEntry>;
}>;
export type CoreTransformEntry = {
    name: string;
    transform: import("../../types/codemod").CodemodTransform;
    meta: {
        title: string;
        description?: string;
        pr?: string;
        codemodType?: string;
    };
    optional?: boolean | undefined;
};
export type CoreVersionManifest = {
    version: string;
    transforms: CoreTransformEntry[];
};
export type UpgradeOptions = {
    list?: boolean | undefined;
    from?: string | undefined;
    apply?: boolean | undefined;
    force?: boolean | undefined;
    codemod?: string | undefined;
    skipCodemod?: string[] | undefined;
    integration?: string[] | undefined;
    path?: string | undefined;
    installDeps?: boolean | undefined;
};
