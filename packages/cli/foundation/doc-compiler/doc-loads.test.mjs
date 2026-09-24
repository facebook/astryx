// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Only the doc compiler loads authored docs. Every module that executes
 *   another module at runtime is listed here with what it loads, so a new doc
 *   read that skips the compiler fails this test instead of quietly handing a
 *   reader a raw export.
 */

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import jscodeshift from 'jscodeshift';
import {CLI_ROOT} from '../fs/paths.mjs';

/** Modules that execute other modules, and what each one loads. */
const MODULE_LOADERS = {
  'foundation/doc-compiler/import.mjs': 'the doc importer: executes doc files',
  'foundation/doc-compiler/read.mjs':
    'the doc reader: hands every loaded doc to the compiler',
  'foundation/discovery/docs-discovery.mjs':
    "discovery: reads a contributed topic's name and relationships, through import.mjs",
  'foundation/fs/module-loader.mjs':
    'the generic user-module loader (config, manifests, codemods)',
  'foundation/config/project.mjs': 'astryx.config, through its config parser',
  'foundation/integrations/integrations.mjs': 'integration manifests',
  'api/doctor/doctor.mjs': "the project's astryx.config, for the config check",
  'api/gap-report/gap-report-worker.mjs': "an integration's gap-report handler",
  'api/theme/build/build.mjs': 'theme source modules',
  'clients/cli/bin/astryx.mjs': 'the CLI entry point',
  'clients/cli/index.mjs': 'command modules',
  'scripts/generate-cli-readme.mjs':
    'self-docs, at build time only (never shipped as a reader)',
};

/** The only modules that may import the doc importers. */
const IMPORTER_USERS = new Set([
  'foundation/doc-compiler/read.mjs',
  'foundation/doc-compiler/bundle.mjs',
  'foundation/discovery/docs-discovery.mjs',
  'foundation/discovery/template-adapter.mjs',
]);

/** Parsers that check authored docs; no generic loader may be handed one. */
const DOC_PARSERS = new Set([
  'parseDoc',
  'parseComponent',
  'parseHook',
  'parseReference',
  'parseTemplate',
  'parseSchema',
  'parseCommand',
  'parseEnum',
  'parseNamespace',
  'parseTheme',
  'parseLegacyDoc',
]);

const LOADER_CALLS = new Set([
  'importUserModule',
  'loadModuleWithParser',
  'importDocModule',
  'importTemplateModule',
  'importTopicModule',
]);

const j = jscodeshift.withParser('babel');

/**
 * How `source` executes other modules at runtime.
 * @param {string} source
 * @param {string} rel path under packages/cli
 * @returns {{loads: string[], problems: string[]}}
 */
function moduleLoads(source, rel) {
  /** @type {string[]} */
  const loads = [];
  /** @type {string[]} */
  const problems = [];
  /** @param {any} node */
  const literal = node =>
    node?.type === 'StringLiteral' ||
    (node?.type === 'Literal' && typeof node.value === 'string');
  const root = j(source);
  root.find(j.ImportExpression).forEach(p => {
    if (!literal(p.node.source)) loads.push('import(<computed>)');
  });
  root.find(j.CallExpression, {callee: {type: 'Import'}}).forEach(p => {
    if (!literal(p.node.arguments[0])) loads.push('import(<computed>)');
  });
  root.find(j.CallExpression).forEach(p => {
    const callee = /** @type {any} */ (p.node.callee);
    if (callee.type === 'Identifier' && LOADER_CALLS.has(callee.name)) {
      loads.push(callee.name);
      const parser = /** @type {any} */ (p.node.arguments[1]);
      if (
        callee.name === 'loadModuleWithParser' &&
        parser?.type === 'Identifier' &&
        DOC_PARSERS.has(parser.name)
      ) {
        problems.push(
          `${rel}: loadModuleWithParser(..., ${parser.name}) loads a doc outside the compiler`,
        );
      }
    }
    if (
      callee.type === 'MemberExpression' &&
      callee.property?.name === 'import'
    ) {
      loads.push('jiti.import');
    }
  });
  root.find(j.ImportDeclaration).forEach(p => {
    const from = p.node.source.value;
    if (typeof from !== 'string' || !from.startsWith('.')) return;
    const target = path.posix.normalize(
      path.posix.join(path.posix.dirname(rel), from),
    );
    if (
      target === 'foundation/doc-compiler/import.mjs' &&
      !IMPORTER_USERS.has(rel)
    ) {
      problems.push(`${rel}: imports the doc importers directly`);
    }
  });
  return {loads, problems};
}

/** @param {string} dir @returns {string[]} */
function sources(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return ['node_modules', '__fixtures__', '__tests__'].includes(entry.name)
        ? []
        : sources(full);
    }
    return entry.name.endsWith('.mjs') && !entry.name.endsWith('.test.mjs')
      ? [full]
      : [];
  });
}

describe('only the doc compiler loads authored docs', () => {
  const scanned = ['api', 'clients', 'foundation', 'authoring', 'scripts']
    .flatMap(dir => sources(path.join(CLI_ROOT, dir)))
    .map(full => {
      const rel = path.relative(CLI_ROOT, full).split(path.sep).join('/');
      return {rel, ...moduleLoads(fs.readFileSync(full, 'utf8'), rel)};
    });

  it('lists every module that executes another module, and nothing else', () => {
    const loaders = scanned
      .filter(file => file.loads.length > 0)
      .map(file => file.rel);
    expect(loaders.sort()).toEqual(Object.keys(MODULE_LOADERS).sort());
  });

  it('keeps the doc importers and doc parsers inside the compiler', () => {
    expect(scanned.flatMap(file => file.problems)).toEqual([]);
  });

  it('catches every way around the rule', () => {
    const leaf = 'api/component/component.mjs';
    expect(moduleLoads('const m = await import(file);', leaf).loads).toEqual([
      'import(<computed>)',
    ]);
    expect(moduleLoads("import('node:fs');", leaf).loads).toEqual([]);
    expect(moduleLoads('await importUserModule(docPath);', leaf).loads).toEqual(
      ['importUserModule'],
    );
    expect(moduleLoads('await jiti.import(docPath);', leaf).loads).toEqual([
      'jiti.import',
    ]);
    expect(
      moduleLoads('await loadModuleWithParser(file, parseTemplate);', leaf)
        .problems,
    ).toHaveLength(1);
    expect(
      moduleLoads(
        "import {importDocModule} from '../../foundation/doc-compiler/import.mjs';",
        leaf,
      ).problems,
    ).toHaveLength(1);
  });
});
