/**
 * Re-exported types so callers can keep referencing them off the init barrel
 * (e.g. cli/commands/init.mjs uses `import('../../api/init/init.mjs').InitOptions`
 * and `.InitLogger`). The canonical shapes stay central in types/api.d.ts +
 * api/init/init.type.mjs; these aliases just preserve the barrel's original type
 * surface after the split.
 * @typedef {import('./init.type.mjs').InitOptions} InitOptions
 * @typedef {import('./_adapter.mjs').InitLogger} InitLogger
 * @typedef {import('./init.type.mjs').InitRunData} InitRunData
 */
/**
 * Run the non-interactive init flow. Dispatches to the remove leaf when
 * `--remove-agents` is set, otherwise to the install (run) leaf, and returns
 * that leaf's receipt. Progress is emitted through `logger` (silent by
 * default); unknown feature or template names throw AstryxError with a stable
 * code.
 *
 * @param {InitOptions} [options]
 * @param {{cwd?: string, logger?: InitLogger}} [ctx]
 * @returns {Promise<import('./init.type.mjs').InitRunResponse | import('./init.type.mjs').InitRemoveResponse>}
 */
export function init(options?: InitOptions, { cwd, logger }?: {
    cwd?: string;
    logger?: InitLogger;
}): Promise<import("./init.type.mjs").InitRunResponse | import("./init.type.mjs").InitRemoveResponse>;
export { getNextSteps } from "./run/run.mjs";
export { noopInitLogger } from "./_adapter.mjs";
/**
 * Re-exported types so callers can keep referencing them off the init barrel
 * (e.g. cli/commands/init.mjs uses `import('../../api/init/init.mjs').InitOptions`
 * and `.InitLogger`). The canonical shapes stay central in types/api.d.ts +
 * api/init/init.type.mjs; these aliases just preserve the barrel's original type
 * surface after the split.
 */
export type InitOptions = import("./init.type.mjs").InitOptions;
/**
 * Re-exported types so callers can keep referencing them off the init barrel
 * (e.g. cli/commands/init.mjs uses `import('../../api/init/init.mjs').InitOptions`
 * and `.InitLogger`). The canonical shapes stay central in types/api.d.ts +
 * api/init/init.type.mjs; these aliases just preserve the barrel's original type
 * surface after the split.
 */
export type InitLogger = import("./_adapter.mjs").InitLogger;
/**
 * Re-exported types so callers can keep referencing them off the init barrel
 * (e.g. cli/commands/init.mjs uses `import('../../api/init/init.mjs').InitOptions`
 * and `.InitLogger`). The canonical shapes stay central in types/api.d.ts +
 * api/init/init.type.mjs; these aliases just preserve the barrel's original type
 * surface after the split.
 */
export type InitRunData = import("./init.type.mjs").InitRunData;
