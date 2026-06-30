// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Project — the single API for reading resolved project configuration.
 *
 * `Project` is the one entry point a command uses to read everything it needs
 * about a consumer's project: the validated config surface, the configured
 * integrations, and the resolved discovery sets (components, templates,
 * codemods) — plus issue routing (issuesUrl) and the accumulated integration
 * issues. It replaces the old `loadConfig(cwd)` plain-object loader and the
 * per-command fan-out into the various discovery helpers.
 *
 * Design:
 *   - `Project.load(cwd, {cache})` is the async factory (constructors can't be
 *     async). It does what loadConfig did — find the config sibling-of
 *     package.json, import + validate it, load the configured integrations —
 *     and nothing more. Discovery is LAZY.
 *   - Discovery methods (components/templates/codemods) are MEMOIZED per
 *     instance (via the pluggable cache) and orchestrate the EXISTING discovery
 *     functions — Project never reimplements discovery.
 *   - SKIP + WARN policy: as a discovery method runs, per-integration work is
 *     guarded so one broken integration never throws out of discovery. Any
 *     AstryxIntegrationIssue encountered is collected into a private set and
 *     that integration's contributions are skipped.
 *   - `issues()` returns the deduped accumulated set, and (when called
 *     directly) fills in validation for any configured integration not yet
 *     visited by a discovery call, so it is always complete on demand.
 *
 * @position lib — orchestration over config-schema / integrations /
 *   component-discovery / template / codemod discovery; commands consume it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {importUserModule, findPresentFiles} from './module-loader.mjs';
import {validateConfig} from './config-schema.mjs';
import {loadIntegrations} from './integrations.mjs';
import {
  CORE_PACKAGE,
  discoverOwnedComponents,
  discoverIntegrationComponents,
} from './component-discovery.mjs';
import {findCoreDir} from '../utils/paths.mjs';
import {
  discoverTemplates,
  discoverIntegrationTemplatesForOne,
} from '../api/template.mjs';
import {getTransformsBetween} from '../codemods/registry.mjs';
import {
  discoverIntegrationCodemods,
  selectIntegrationCodemods,
} from '../codemods/integration-discovery.mjs';
import {validateLoadedIntegration} from '../api/validate-integration.mjs';
import {
  InMemoryConfigCache,
  cacheKey,
  configContentHash,
} from './config-cache.mjs';

/** Conventional config basenames, in load-precedence order. */
export const CONFIG_BASENAMES = [
  'astryx.config.ts',
  'astryx.config.mjs',
  'astryx.config.js',
];

/** Default issue tracker used when neither config nor integration routes one. */
export const DEFAULT_ISSUES_URL =
  'https://github.com/facebook/astryx/issues/new';

/**
 * Find the directory of the nearest package.json walking up from startDir.
 * @param {string} startDir
 * @returns {string|null}
 */
function findPackageRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 50; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Find astryx.config.{ts,mjs,js} as a sibling of the nearest package.json.
 * Returns the absolute path, or null if none is present. Throws if multiple
 * config files exist at that root.
 * @param {string} [startDir]
 * @returns {string|null}
 */
export function findConfigPath(startDir = process.cwd()) {
  const root = findPackageRoot(startDir) ?? startDir;
  const present = findPresentFiles(root, CONFIG_BASENAMES);
  if (present.length > 1) {
    throw new Error(
      `Multiple Astryx config files found in ${root} (${present
        .map(p => path.basename(p))
        .join(', ')}). Keep exactly one.`,
    );
  }
  return present.length === 1 ? present[0] : null;
}

/**
 * The single API for reading resolved project configuration. Construct via the
 * async {@link Project.load} factory.
 */
export class Project {
  /** @type {string} */
  #cwd;
  /** @type {string|null} */
  #configPath;
  /** @type {import('../types/config').AstryxConfig} */
  #config;
  /** @type {string[]} */
  #integrations;
  /** @type {Array<object>} */
  #loadedIntegrations;
  /** @type {import('./config-cache.mjs').ConfigCache} */
  #cache;
  /** @type {string} */
  #hash;
  /** @type {import('../types/integration').AstryxIntegrationIssue[]} */
  #issues = [];
  /**
   * Package names of integrations whose issues have already been collected
   * (via a discovery method or a direct issues() validation), so issues() can
   * fill in only the ones not yet visited and never double-collect.
   * @type {Set<string>}
   */
  #visitedIssues = new Set();

  /**
   * @param {object} init
   * @param {string} init.cwd
   * @param {string|null} init.configPath
   * @param {object} init.config validated AstryxConfig surface
   * @param {string[]} init.integrations
   * @param {Array<object>} init.loadedIntegrations
   * @param {import('./config-cache.mjs').ConfigCache} init.cache
   * @param {string} init.hash config content hash
   */
  constructor({
    cwd,
    configPath,
    config,
    integrations,
    loadedIntegrations,
    cache,
    hash,
  }) {
    this.#cwd = cwd;
    this.#configPath = configPath;
    this.#config = config;
    this.#integrations = integrations;
    this.#loadedIntegrations = loadedIntegrations;
    this.#cache = cache;
    this.#hash = hash;
  }

  /**
   * Async factory. Finds + validates the config (the same work loadConfig did)
   * and loads the configured integrations. Discovery is NOT run here — it is
   * lazy and memoized on the returned instance.
   *
   * @param {string} [cwd]
   * @param {{cache?: import('./config-cache.mjs').ConfigCache}} [options]
   * @returns {Promise<Project>}
   */
  static async load(cwd = process.cwd(), {cache} = {}) {
    const resolvedCache = cache ?? new InMemoryConfigCache();
    const configPath = findConfigPath(cwd);
    const hash = configContentHash(configPath);

    let config = {integrations: []};
    let integrations = [];
    let loadedIntegrations = [];

    if (configPath) {
      const mod = await importUserModule(configPath);
      const rawConfig = mod.default ?? {};
      config = validateConfig(rawConfig);
      const configDir = path.dirname(configPath);
      integrations = config.integrations ?? [];
      loadedIntegrations = await loadIntegrations(integrations, {
        cwd: configDir,
      });
    }

    return new Project({
      cwd,
      configPath,
      config,
      integrations,
      loadedIntegrations,
      cache: resolvedCache,
      hash,
    });
  }

  /**
   * The validated config surface (same data loadConfig returned, minus the
   * resolved `loadedIntegrations` which is exposed separately).
   * @returns {{integrations?: string[], issuesUrl?: string, hooks?: object, experimental?: object}}
   */
  get config() {
    return this.#config;
  }

  /** Configured integration package names. @returns {string[]} */
  get integrations() {
    return this.#integrations;
  }

  /** Resolved loaded integrations (lib/integrations.mjs shape). @returns {Array<object>} */
  get loadedIntegrations() {
    return this.#loadedIntegrations;
  }

  /** @returns {string} */
  get cwd() {
    return this.#cwd;
  }

  /**
   * Absolute path to the resolved config file, or null when the project has
   * no config (defaults-only).
   * @returns {string|null}
   */
  get configPath() {
    return this.#configPath;
  }

  /**
   * Memoize an async producer behind the pluggable cache, keyed by the config
   * content hash + cwd + discovery kind. A sentinel wrapper distinguishes a
   * cached `undefined`/falsy value from a cache miss.
   * @template T
   * @param {string} kind
   * @param {() => Promise<T>} produce
   * @returns {Promise<T>}
   */
  async #memo(kind, produce) {
    const key = cacheKey(this.#hash, this.#cwd, kind);
    const hit = this.#cache.get(key);
    if (hit !== undefined) return hit.value;
    const value = await produce();
    this.#cache.set(key, {value});
    return value;
  }

  /**
   * Record a single integration issue, deduped by (package, code, message).
   * @param {string} pkg
   * @param {import('../types/integration').AstryxIntegrationIssue} issue
   */
  #pushIssue(pkg, issue) {
    const code = issue?.code ?? 'unknown';
    const message = issue?.message ?? '';
    const exists = this.#issues.some(
      e => e.package === pkg && e.code === code && e.message === message,
    );
    if (exists) return;
    this.#issues.push({
      package: pkg,
      code,
      severity: issue?.severity ?? 'error',
      message,
    });
  }

  /** Package label for a loaded integration. */
  #pkgLabel(integration) {
    return integration?.name ?? integration?.__spec ?? '(integration)';
  }

  /**
   * Validate one loaded integration and collect any issues. Marks the
   * integration visited so issues() won't redo the work. Best-effort: a
   * validator throwing is itself recorded as an issue, never propagated.
   * @param {object} integration
   */
  async #collectIssues(integration) {
    const pkg = this.#pkgLabel(integration);
    if (this.#visitedIssues.has(pkg)) return;
    this.#visitedIssues.add(pkg);
    try {
      const found = await validateLoadedIntegration(integration);
      for (const issue of found ?? []) this.#pushIssue(pkg, issue);
    } catch (err) {
      this.#pushIssue(pkg, {
        code: 'integration_error',
        severity: 'error',
        message: err?.message ?? String(err),
      });
    }
  }

  /**
   * Core + integration component ownership records. Wraps
   * discoverOwnedComponents for core and discoverIntegrationComponents (via
   * discoverOwnedComponents) for integrations, but applies the skip+warn
   * policy per integration: a broken integration's components are skipped and
   * its issues collected, never thrown. Memoized per instance.
   *
   * @returns {Promise<Array<{name: string, package: string, group: string|null, docPath: string|null, sourcePath: string|null, issuesUrl: string|undefined}>>}
   */
  async components() {
    return this.#memo('components', async () => {
      const coreDir = findCoreDir(this.#cwd);
      /** @type {Array<object>} */
      const records = [];

      // Core records (no integrations) — never integration-broken.
      if (coreDir) {
        try {
          records.push(...discoverOwnedComponents(coreDir, []));
        } catch {
          // Core discovery failure is not an integration issue; surface
          // nothing here (core problems show up via doctor/other paths).
        }
      }

      // Each integration in isolation so one broken integration is skipped.
      for (const integration of this.#loadedIntegrations) {
        await this.#collectIssues(integration);
        const pkg = this.#pkgLabel(integration);
        const hadError = this.#issues.some(
          i => i.package === pkg && i.severity === 'error',
        );
        if (hadError) continue;
        try {
          // discoverOwnedComponents owns the core+integration record shape;
          // here we add only this integration's records (core is handled
          // above) so a single broken integration can be skipped in isolation.
          for (const rec of discoverIntegrationComponents(integration)) {
            records.push(rec);
          }
        } catch (err) {
          this.#pushIssue(pkg, {
            code: 'invalid_component',
            severity: 'error',
            message: err?.message ?? String(err),
          });
        }
      }

      return records;
    });
  }

  /**
   * Core + integration templates, type-tagged. Wraps discoverTemplates (core +
   * external blocks) and discoverIntegrationTemplatesForOne per integration so
   * a broken integration's templates are skipped and its issues collected.
   * Memoized per instance.
   *
   * @returns {Promise<Array<object>>}
   */
  async templates() {
    return this.#memo('templates', async () => {
      /** @type {Array<object>} */
      const templates = [];

      // Core + external-package templates (discoverTemplates internally also
      // loads integration templates via loadConfig today; we intentionally
      // re-collect integration templates below through the per-integration
      // path so the skip+warn policy and issue collection apply, then dedupe).
      try {
        const core = await discoverTemplates(this.#cwd);
        for (const t of core) {
          // Skip integration-owned templates here; they are re-added (and
          // issue-collected) per integration below to honor skip+warn.
          if (t.package && t.package !== CORE_PACKAGE) continue;
          templates.push(t);
        }
      } catch {
        // Core/template discovery failure contributes no templates.
      }

      for (const integration of this.#loadedIntegrations) {
        await this.#collectIssues(integration);
        const pkg = this.#pkgLabel(integration);
        const hadError = this.#issues.some(
          i => i.package === pkg && i.severity === 'error',
        );
        if (hadError) continue;
        try {
          const {templates: ts, errors} =
            await discoverIntegrationTemplatesForOne(integration);
          for (const e of errors) {
            this.#pushIssue(pkg, {
              code: 'invalid_template',
              severity: 'error',
              message: e.message,
            });
          }
          // Only contribute templates when the integration had no per-template
          // errors (skip the whole integration's templates on any error).
          if (errors.length === 0) templates.push(...ts);
        } catch (err) {
          this.#pushIssue(pkg, {
            code: 'invalid_template',
            severity: 'error',
            message: err?.message ?? String(err),
          });
        }
      }

      return templates.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  /**
   * Core registry transforms + integration codemods for an upgrade range.
   * Wraps getTransformsBetween (core) and discoverIntegrationCodemods /
   * selectIntegrationCodemods (integrations). A broken integration's codemods
   * are skipped (issue collected) rather than failing the whole resolution.
   * Memoized per (from, to) key.
   *
   * @param {string} fromVersion exclusive lower bound
   * @param {string} toVersion inclusive upper bound
   * @returns {Promise<{core: Array<{version: string, transforms: Array<object>}>, integration: Array<{version: string, codemods: Array<object>}>}>}
   */
  async codemods(fromVersion, toVersion) {
    return this.#memo(`codemods:${fromVersion}..${toVersion}`, async () => {
      const core = await getTransformsBetween(fromVersion, toVersion);

      // Discover integration codemods per integration so a single broken
      // integration is skipped (issue collected) without losing the others.
      const good = [];
      for (const integration of this.#loadedIntegrations) {
        await this.#collectIssues(integration);
        const pkg = this.#pkgLabel(integration);
        const hadError = this.#issues.some(
          i => i.package === pkg && i.severity === 'error',
        );
        if (hadError) continue;
        if (!integration?.codemods) continue;
        try {
          // Validate this integration's codemods discover cleanly in
          // isolation; if so it is safe to include.
          await discoverIntegrationCodemods([integration]);
          good.push(integration);
        } catch (err) {
          this.#pushIssue(pkg, {
            code: 'invalid_codemod',
            severity: 'error',
            message: err?.message ?? String(err),
          });
        }
      }

      const byVersion = await discoverIntegrationCodemods(good);
      const integration = selectIntegrationCodemods(
        byVersion,
        fromVersion,
        toVersion,
      );

      return {core, integration};
    });
  }

  /**
   * Route an issues URL for a component/source reference.
   *
   * - `package === CORE_PACKAGE` or omitted => this.config.issuesUrl or the
   *   default core issues URL.
   * - an integration package => that loaded integration's manifest issuesUrl
   *   (which may be undefined when the integration ships none).
   *
   * @param {{package?: string}} [ref]
   * @returns {string|undefined}
   */
  issuesUrl(ref = {}) {
    const pkg = ref?.package;
    if (!pkg || pkg === CORE_PACKAGE) {
      return this.#config.issuesUrl ?? DEFAULT_ISSUES_URL;
    }
    const integration = this.#loadedIntegrations.find(i => i.name === pkg);
    return integration?.issuesUrl;
  }

  /**
   * The accumulated integration issues (deduped by package, code, message).
   * When called directly, also validates any configured integration not yet
   * visited by a discovery call, so the returned set is complete on demand.
   *
   * @returns {Promise<import('../types/integration').AstryxIntegrationIssue[]>}
   */
  async issues() {
    for (const integration of this.#loadedIntegrations) {
      await this.#collectIssues(integration);
    }
    // Return a stable copy so callers can't mutate internal state.
    return this.#issues.map(i => ({...i}));
  }
}
