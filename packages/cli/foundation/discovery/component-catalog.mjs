// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Replacement-aware component discovery for configured integrations.
 *
 * @input Core ownership records plus each integration's component docs, in
 *   configured order.
 * @output One effective component catalog for unqualified discovery and
 *   selection, while retaining every owner for explicit package selection.
 * @position packages/cli/foundation/discovery — the shared resolution seam for
 *   component, search, swizzle, Project, and integration diagnostics.
 */

import * as path from 'node:path';
import {
  CORE_PACKAGE,
  discoverIntegrationComponents,
  discoverOwnedComponents,
  findComponentReadme,
  findComponentSource,
} from './component-discovery.mjs';
import {importUserModule} from '../fs/module-loader.mjs';
import {parseDoc} from '../../authoring/doctypes/parse.mjs';
import {parseComponent} from '../../authoring/doctypes/component/parse.mjs';

/** @param {any} doc @returns {boolean} */
function isComponentDoc(doc) {
  return (
    doc?.type === 'component' ||
    (doc?.type == null &&
      (Array.isArray(doc?.props) ||
        Array.isArray(doc?.components) ||
        typeof doc?.subComponentOf === 'string'))
  );
}

/**
 * @typedef {object} ComponentRecord
 * @property {string} name
 * @property {string} package
 * @property {string|null} group
 * @property {string|null} [category]
 * @property {string|null} docPath
 * @property {string|null} sourcePath
 * @property {string|undefined} issuesUrl
 * @property {string} [replaces]
 * @property {string} [import]
 * @property {import('../integrations/integrations.mjs').LoadedIntegration|null} [integration]
 */

/** @param {unknown} err @returns {string} */
function errorMessage(err) {
  return err && typeof err === 'object' && 'message' in err
    ? String(/** @type {{message: unknown}} */ (err).message)
    : String(err);
}

/** @param {string} value @returns {string} */
function keyOf(value) {
  return value.toLowerCase();
}

/**
 * Load and validate the component docs contributed by one integration.
 *
 * The low-level scanner remains deliberately metadata-light for compatibility.
 * Replacement semantics use this parsed path instead: `.doc.ts` goes through
 * jiti and JavaScript modules load normally. A replacement-bearing declaration
 * crosses the public ComponentDoc parser before discovery can act on it; legacy
 * docs without this new field keep their historical permissive discovery.
 *
 * @param {import('../integrations/integrations.mjs').LoadedIntegration} integration
 * @returns {Promise<{records: ComponentRecord[], errors: Error[]}>}
 */
export async function discoverIntegrationComponentContributions(integration) {
  /** @type {ComponentRecord[]} */
  const records = [];
  /** @type {Error[]} */
  const errors = [];
  const root = integration?.components;
  if (!root) return {records, errors};

  const scanned = discoverIntegrationComponents(integration).sort((a, b) =>
    a.docPath.localeCompare(b.docPath),
  );
  for (const record of scanned) {
    try {
      const mod = await importUserModule(record.docPath);
      const loaded = /** @type {any} */ (mod);
      const defaultDoc = loaded?.default;
      const authored = /** @type {any} */ (
        loaded?.docs !== undefined && defaultDoc?.docs === loaded.docs
          ? loaded.docs
          : (defaultDoc ?? loaded?.docs)
      );
      if (authored == null) {
        throw new Error(
          'exports no component doc. Export `docs` or a default component doc.',
        );
      }
      const hasReplaces = Object.prototype.hasOwnProperty.call(
        authored,
        'replaces',
      );
      const hasImport = Object.prototype.hasOwnProperty.call(authored, 'import');
      const requiresStrictComponentDoc = hasReplaces;
      const requiresStampedKindCheck = hasImport && authored.type != null;
      if (
        hasReplaces &&
        (typeof authored.replaces !== 'string' ||
          authored.replaces.trim() === '')
      ) {
        throw new Error('replaces: expected a non-empty Core component name');
      }
      if (
        hasImport &&
        (typeof authored.import !== 'string' || authored.import.trim() === '')
      ) {
        throw new Error('import: expected a non-empty consumer specifier');
      }
      if (
        (hasReplaces || hasImport) &&
        authored.type == null &&
        !isComponentDoc(authored)
      ) {
        throw new Error(
          'replaces and import are only valid on a ComponentDoc (`type: \'component\'` or a legacy component shape).',
        );
      }
      const doc = /** @type {any} */ (
        !requiresStrictComponentDoc
          ? authored
          : authored.type == null
            ? parseComponent(
                {...authored, type: 'component'},
                path.basename(record.docPath),
              )
            : parseDoc(authored, path.basename(record.docPath))
      );
      if (
        (requiresStrictComponentDoc || requiresStampedKindCheck) &&
        (!isComponentDoc(doc) ||
          (requiresStampedKindCheck && doc.type !== 'component'))
      ) {
        throw new Error(
          'replaces and import are only valid on a ComponentDoc (`type: \'component\'` or a legacy component shape).',
        );
      }
      if (doc.hidden === true) continue;
      const authoredName =
        typeof doc.name === 'string' && doc.name.trim() !== ''
          ? doc.name.trim()
          : record.name;
      records.push({
        ...record,
        name: authoredName,
        group: typeof doc.group === 'string' ? doc.group : record.group,
        category: typeof doc.category === 'string' ? doc.category : null,
        ...(doc.replaces == null ? null : {replaces: doc.replaces.trim()}),
        ...(typeof doc.import === 'string'
          ? {import: doc.import.trim()}
          : null),
        integration,
      });
    } catch (err) {
      errors.push(
        new Error(
          `${path.relative(root, record.docPath)}: ${errorMessage(err)}`,
        ),
      );
    }
  }

  return {records, errors};
}

/**
 * Effective components for one consumer project.
 *
 * Core owns the initial identities. An integration record with `replaces`
 * occupies the target Core component's unqualified slot; its own name and the
 * replaced name both resolve to it. Every owner remains available through
 * package-qualified lookup. If separate configured integrations replace one
 * target, the later integration wins deterministically and a warning names both.
 */
export class ComponentCatalog {
  /** @type {ComponentRecord[]} */
  #core;
  /** @type {ComponentRecord[]} */
  #integrations = [];
  /** @type {Map<string, ComponentRecord>} */
  #coreByName;
  /** @type {Map<string, ComponentRecord>} */
  #documentedCoreByName = new Map();
  /** @type {string|null} */
  #coreDir;
  /** @type {Map<string, ComponentRecord>} */
  #activeReplacements = new Map();

  /**
   * @param {ComponentRecord[]} core
   * @param {string|null} [coreDir]
   */
  constructor(core, coreDir = null) {
    this.#core = core;
    this.#coreDir = coreDir;
    this.#coreByName = new Map(
      core.map(record => [keyOf(record.name), record]),
    );
  }

  /**
   * @param {string} coreDir
   * @returns {ComponentCatalog}
   */
  static fromCore(coreDir) {
    return new ComponentCatalog(
      /** @type {ComponentRecord[]} */ (discoverOwnedComponents(coreDir, [])),
      coreDir,
    );
  }

  /**
   * Materialize a Core-documented identity that is not in the top-level catalog.
   * It participates in exact ownership and replacement validation, but not in
   * catalog listing/search unless an integration contributes the same name.
   * @param {string} name
   */
  async #ensureDocumentedCore(name) {
    const key = keyOf(name);
    if (
      !this.#coreDir ||
      this.#coreByName.has(key) ||
      this.#documentedCoreByName.has(key)
    ) {
      return;
    }
    const docPath = findComponentReadme(this.#coreDir, name);
    if (!docPath) return;
    try {
      const mod = /** @type {any} */ (await importUserModule(docPath));
      const defaultDoc = mod?.default;
      const authored =
        mod?.docs !== undefined && defaultDoc?.docs === mod.docs
          ? mod.docs
          : (defaultDoc ?? mod?.docs);
      const doc = parseDoc(authored, path.basename(docPath));
      if (!isComponentDoc(doc)) return;
    } catch {
      return;
    }
    this.#documentedCoreByName.set(
      key,
      /** @type {ComponentRecord} */ ({
        name,
        package: CORE_PACKAGE,
        group: null,
        category: null,
        docPath,
        sourcePath: findComponentSource(this.#coreDir, name),
        issuesUrl: undefined,
      }),
    );
  }

  /**
   * Add one integration's records as a transaction. A missing target, a
   * replacement named after a different Core identity, or two components in
   * the same package replacing one Core identity withdraws the package's whole
   * component contribution. Separate configured integrations may replace one
   * target; the later one wins with a warning.
   *
   * @param {ComponentRecord[]} records
   * @returns {Promise<import('../integrations/issue').AstryxIntegrationIssue[]>}
   */
  async addIntegration(records) {
    /** @type {import('../integrations/issue').AstryxIntegrationIssue[]} */
    const issues = [];
    /** @type {Map<string, ComponentRecord[]>} */
    const byName = new Map();
    for (const record of records) {
      await this.#ensureDocumentedCore(record.name);
      if (record.replaces != null) {
        await this.#ensureDocumentedCore(record.replaces);
      }
      const key = keyOf(record.name);
      const group = byName.get(key) ?? [];
      group.push(record);
      byName.set(key, group);
    }
    for (const group of byName.values()) {
      if (group.length < 2) continue;
      issues.push({
        code: 'ambiguous_component_name',
        severity: 'error',
        message: `${group.map(record => path.relative(record.integration?.components ?? '', record.docPath ?? record.name)).join(' and ')} all declare component name "${group[0].name}". Component names must be unique inside one package.`,
      });
    }

    /** @type {Map<string, ComponentRecord[]>} */
    const byTarget = new Map();
    /** @type {ComponentRecord[]} */
    const normalized = [];

    for (const record of records) {
      if (record.replaces == null) {
        normalized.push(record);
        continue;
      }
      const target =
        this.#coreByName.get(keyOf(record.replaces)) ??
        this.#documentedCoreByName.get(keyOf(record.replaces));
      if (!target) {
        issues.push({
          code: 'missing_component_replacement',
          severity: 'error',
          message: `Component "${record.name}" declares \`replaces: '${record.replaces}'\`, but Core provides no component with that name.`,
        });
        continue;
      }
      const ownCore =
        this.#coreByName.get(keyOf(record.name)) ??
        this.#documentedCoreByName.get(keyOf(record.name));
      if (ownCore && keyOf(ownCore.name) !== keyOf(target.name)) {
        issues.push({
          code: 'ambiguous_component_replacement',
          severity: 'error',
          message: `Component "${record.name}" declares \`replaces: '${target.name}'\`, but its own name is already the Core component "${ownCore.name}". Rename the integration component or replace "${ownCore.name}" instead.`,
        });
        continue;
      }
      const next = {...record, replaces: target.name};
      normalized.push(next);
      const key = keyOf(target.name);
      const group = byTarget.get(key) ?? [];
      group.push(next);
      byTarget.set(key, group);
    }

    for (const group of byTarget.values()) {
      if (group.length < 2) continue;
      issues.push({
        code: 'ambiguous_component_replacement',
        severity: 'error',
        message: `${group.map(record => `"${record.name}"`).join(' and ')} all declare \`replaces: '${group[0].replaces}'\`. Declare exactly one replacement for each Core component in a package.`,
      });
    }

    if (issues.some(issue => issue.severity === 'error')) return issues;

    for (const record of normalized) {
      if (record.replaces == null) {
        const replacement = this.#activeReplacements.get(keyOf(record.name));
        if (replacement) {
          issues.push({
            code: 'ambiguous_component_name',
            severity: 'warning',
            message: `Component "${record.name}" from ${record.package} is shadowed by the active replacement ${replacement.package} (${replacement.name}). Unqualified selection uses the replacement; the native owner remains available by package.`,
          });
        }
      }
      this.#integrations.push(record);
      if (record.replaces == null) continue;
      const key = keyOf(record.replaces);
      if (!this.#activeReplacements.has(key)) {
        for (const nativeOwner of this.#integrations) {
          if (
            nativeOwner !== record &&
            nativeOwner.replaces == null &&
            keyOf(nativeOwner.name) === key
          ) {
            issues.push({
              code: 'ambiguous_component_name',
              severity: 'warning',
              message: `Component "${nativeOwner.name}" from ${nativeOwner.package} is shadowed by the active replacement ${record.package} (${record.name}). Unqualified selection uses the replacement; the native owner remains available by package.`,
            });
          }
        }
      }
      const previous = this.#activeReplacements.get(key);
      if (previous) {
        const previousIsExplicit = previous.integration?.__autolinked !== true;
        const currentIsAutolinked = record.integration?.__autolinked === true;
        const previousWins = previousIsExplicit && currentIsAutolinked;
        const winner = previousWins ? previous : record;
        const reason = previousWins
          ? `${previous.package} is explicitly configured, so it keeps precedence.`
          : `${record.package} is configured later, so it wins.`;
        issues.push({
          code: 'ambiguous_component_replacement',
          severity: 'warning',
          message: `Core component "${record.replaces}" is replaced by both ${previous.package} (${previous.name}) and ${record.package} (${record.name}). ${reason}`,
        });
        this.#activeReplacements.set(key, winner);
        continue;
      }
      this.#activeReplacements.set(key, record);
    }

    return issues;
  }

  /**
   * Resolve the unqualified active component. A declared replacement wins its
   * Core target. Otherwise a name resolves only when one package owns it.
   *
   * @param {unknown} name
   * @returns {ComponentRecord|undefined}
   */
  resolve(name) {
    if (typeof name !== 'string') return undefined;
    const key = keyOf(name);
    const replacement = this.#activeReplacements.get(key);
    if (replacement) return replacement;
    const replacementByOwnName = [...this.#activeReplacements.values()].filter(
      record => keyOf(record.name) === key,
    );
    if (replacementByOwnName.length === 1) return replacementByOwnName[0];
    const exact = [
      ...this.allEntries(),
      ...this.#documentedCoreByName.values(),
    ].filter(record => keyOf(record.name) === key);
    return exact.length === 1 ? exact[0] : undefined;
  }

  /**
   * Every owner addressable by this name, including replacement aliases.
   * @param {unknown} name
   * @returns {ComponentRecord[]}
   */
  owners(name) {
    if (typeof name !== 'string') return [];
    const key = keyOf(name);
    const matches = [
      ...this.allEntries(),
      ...this.#documentedCoreByName.values(),
    ].filter(
      record =>
        keyOf(record.name) === key ||
        (record.replaces != null && keyOf(record.replaces) === key),
    );
    const seen = new Set();
    return matches.filter(record => {
      const identity = `${record.package}\0${record.name}\0${record.docPath ?? ''}`;
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  /**
   * Resolve one name inside one explicit owner package. A replacement answers
   * to both its own name and the Core name it replaced.
   * @param {unknown} name
   * @param {string} packageName
   * @returns {ComponentRecord|undefined}
   */
  resolvePackage(name, packageName) {
    const packageOwners = this.owners(name).filter(
      record => record.package === packageName,
    );
    return (
      packageOwners.find(record => keyOf(record.name) === keyOf(String(name))) ??
      packageOwners[0]
    );
  }

  /**
   * Effective unqualified discovery order. A replacement occupies its Core
   * target's slot; non-replacing integration components follow Core.
   * @returns {ComponentRecord[]}
   */
  entries() {
    const entries = this.#core.map(
      record => this.#activeReplacements.get(keyOf(record.name)) ?? record,
    );
    const catalogCoreNames = new Set(
      this.#core.map(record => keyOf(record.name)),
    );
    entries.push(
      ...[...this.#activeReplacements.values()].filter(
        record => !catalogCoreNames.has(keyOf(record.replaces ?? '')),
      ),
    );
    const replacementNames = new Set(
      [...this.#activeReplacements.values()].map(record => keyOf(record.name)),
    );
    const active = new Set(this.#activeReplacements.values());
    entries.push(
      ...this.#integrations
        .filter(record =>
          record.replaces == null
            ? !replacementNames.has(keyOf(record.name))
            : !active.has(record),
        )
        .map(record => {
          if (record.replaces == null) return record;
          const ownNameRecord = {...record};
          delete ownNameRecord.replaces;
          return ownNameRecord;
        }),
    );
    return entries;
  }

  /** @returns {ComponentRecord[]} every Core and integration owner */
  allEntries() {
    return [...this.#core, ...this.#integrations];
  }

  /** @param {unknown} name @returns {boolean} */
  hasCatalogCore(name) {
    return typeof name === 'string' && this.#coreByName.has(keyOf(name));
  }

  /** @param {string} name @returns {ComponentRecord|undefined} */
  core(name) {
    return (
      this.#coreByName.get(keyOf(name)) ??
      this.#documentedCoreByName.get(keyOf(name))
    );
  }
}

export {CORE_PACKAGE};
