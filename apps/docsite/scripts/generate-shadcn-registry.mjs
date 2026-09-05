// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generate a shadcn-compatible registry from the docsite's existing
 * component, block, and page catalogs.
 * @input The generated docsite package, component, block, and page records.
 * @output Static standard-registry JSON under the configured output directory.
 * @position Build-time serializer between Astryx's catalog and shadcn clients.
 *
 * The registry keeps Astryx packages as real dependencies. Component and hook
 * items create public re-exports; blocks and pages copy app-level composition
 * source that already imports published package paths.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import babel from '@babel/core';
import stylexPlugin from '@stylexjs/babel-plugin';
import ts from 'typescript';
import {registryItemSchema, registrySchema} from 'shadcn/schema';
import {
  blockRegistryIdentity,
  componentRegistryIdentity,
  pageRegistryIdentity,
} from '../src/lib/shadcnRegistry.mjs';

const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';
const REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const HOMEPAGE = 'https://astryx.atmeta.com';
const ASTRYX_CSS = {
  '@import "@astryxdesign/core/reset.css"': {},
  '@import "@astryxdesign/core/astryx.css"': {},
};

class UnpublishedAstryxDependencyError extends Error {
  constructor(packageName) {
    super(`No published package version found for ${packageName}`);
    this.name = 'UnpublishedAstryxDependencyError';
    this.packageName = packageName;
  }
}

function packageNameFromSpecifier(specifier) {
  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/');
  }
  return specifier.split('/')[0];
}

function readImportSpecifiers(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );
  const specifiers = new Set();

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.add(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.add(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...specifiers].sort();
}

function dependencySpec(packageName, packageDependencies) {
  const spec = packageDependencies.get(packageName);
  if (spec) {
    return spec;
  }
  if (packageName.startsWith('@astryxdesign/')) {
    throw new UnpublishedAstryxDependencyError(packageName);
  }
  return packageName;
}

function precompileStylexSource(source, fileName) {
  if (!source.includes('stylex.create')) {
    return {source, extension: 'tsx', precompiledStylex: false};
  }

  const result = babel.transformSync(source, {
    filename: fileName,
    babelrc: false,
    configFile: false,
    presets: [['@babel/preset-typescript', {allExtensions: true, isTSX: true}]],
    plugins: [
      [
        stylexPlugin,
        {
          dev: false,
          runtimeInjection: true,
          classNamePrefix: 'p',
          treeshakeCompensation: true,
          unstable_moduleResolution: {type: 'commonJS'},
        },
      ],
    ],
    parserOpts: {plugins: ['typescript', 'jsx']},
  });
  if (!result?.code) {
    throw new Error(`StyleX precompile produced no code for ${fileName}`);
  }
  if (result.code.includes('stylex.create')) {
    throw new Error(`Uncompiled stylex.create remains in ${fileName}`);
  }
  return {
    source: `${result.code}\n`,
    extension: 'jsx',
    precompiledStylex: true,
  };
}

function dependenciesForSource(source, fileName, packageDependencies) {
  const packages = new Set();
  for (const specifier of readImportSpecifiers(source, fileName)) {
    if (specifier.startsWith('.')) {
      throw new Error(
        `${fileName} has a relative import (${specifier}); registry compositions ` +
          'must use published package paths',
      );
    }
    if (
      specifier.startsWith('node:') ||
      specifier === 'react' ||
      specifier.startsWith('react/') ||
      specifier === 'react-dom' ||
      specifier.startsWith('react-dom/')
    ) {
      continue;
    }
    packages.add(packageNameFromSpecifier(specifier));
  }
  return [...packages]
    .map(packageName => dependencySpec(packageName, packageDependencies))
    .sort();
}

function withCoreDependency(dependencies, packageDependencies) {
  return [
    ...new Set([
      ...dependencies,
      dependencySpec('@astryxdesign/core', packageDependencies),
      dependencySpec('@stylexjs/stylex', packageDependencies),
    ]),
  ].sort();
}

function componentItem(packageName, component, packageDependencies) {
  if (!component.importPath) {
    throw new Error(
      `${packageName}/${component.name} has no public import path`,
    );
  }
  const isHook = component.name.startsWith('use') || component.params != null;
  const type = isHook ? 'registry:hook' : 'registry:component';
  const targetRoot = isHook ? 'hooks/astryx' : 'components/astryx';
  const identity = componentRegistryIdentity(
    packageName,
    component.name,
    isHook,
    component.registry,
  );
  const itemName = identity.name;
  const content = `export * from '${component.importPath}';\n`;

  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: itemName,
    type,
    title: component.displayName || component.name,
    description:
      component.description ||
      `Public ${isHook ? 'hook' : 'component'} entry for ${component.name}.`,
    author: 'Astryx',
    dependencies: withCoreDependency(
      [dependencySpec(packageName, packageDependencies)],
      packageDependencies,
    ),
    css: ASTRYX_CSS,
    files: [
      {
        path: `registry/${itemName}/${component.name}.ts`,
        type,
        target: `${targetRoot}/${component.name}.ts`,
        content,
      },
    ],
    astryx: {
      kind: isHook ? 'hook' : 'component',
      path: identity.path,
      aliases: identity.aliases,
      packageName,
      importPath: component.importPath,
      hidden: component.hidden === true,
    },
  };
}

function blockItem(block, packageDependencies, cliRoot) {
  const identity = blockRegistryIdentity(
    block.name,
    block.exampleFor,
    block.isShowcase,
    block.registry,
  );
  const itemName = identity.name;
  const kind = identity.kind;
  const fileName = path.join(
    cliRoot,
    'assets',
    'templates',
    'blocks',
    block.category,
    `${block.dirName}.tsx`,
  );
  const compiled = precompileStylexSource(block.source, fileName);
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: itemName,
    type: 'registry:block',
    title: block.displayName || block.name,
    description: block.description || `Astryx ${kind}: ${block.name}.`,
    author: 'Astryx',
    dependencies: withCoreDependency(
      dependenciesForSource(compiled.source, fileName, packageDependencies),
      packageDependencies,
    ),
    css: ASTRYX_CSS,
    files: [
      {
        path: `registry/${itemName}/${block.dirName}.${compiled.extension}`,
        type: 'registry:block',
        target: `components/astryx/${kind === 'block' ? 'blocks' : `${kind}s`}/${block.dirName}.${compiled.extension}`,
        content: compiled.source,
      },
    ],
    astryx: {
      kind,
      path: identity.path,
      aliases: identity.aliases,
      exampleFor: block.exampleFor || null,
      category: block.category,
      componentsUsed: block.componentsUsed,
      precompiledStylex: compiled.precompiledStylex,
    },
  };
}

function pageItem(template, packageDependencies, cliRoot) {
  const identity = pageRegistryIdentity(template.slug, template.registry);
  const itemName = identity.name;
  const fileName = path.join(
    cliRoot,
    'assets',
    'templates',
    'pages',
    template.slug,
    'page.tsx',
  );
  const compiled = precompileStylexSource(template.source, fileName);
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: itemName,
    type: 'registry:page',
    title: template.name,
    description: template.description || `Astryx page: ${template.name}.`,
    author: 'Astryx',
    dependencies: withCoreDependency(
      dependenciesForSource(compiled.source, fileName, packageDependencies),
      packageDependencies,
    ),
    css: ASTRYX_CSS,
    files: [
      {
        path: `registry/${itemName}/page.${compiled.extension}`,
        // shadcn 4.19.0 silently skips files typed registry:page. The item
        // remains registry:page while its source file uses the working type.
        type: 'registry:block',
        target: `app/astryx/${template.slug}/page.${compiled.extension}`,
        content: compiled.source,
      },
    ],
    astryx: {
      kind: 'page',
      path: identity.path,
      aliases: identity.aliases,
      category: template.category,
      isReady: template.isReady,
      isHiddenFromOverview: template.isHiddenFromOverview,
      precompiledStylex: compiled.precompiledStylex,
    },
  };
}

function assertUniqueItemNames(items) {
  const names = new Set();
  for (const item of items) {
    if (names.has(item.name)) {
      throw new Error(`Duplicate shadcn registry item name: ${item.name}`);
    }
    names.add(item.name);
  }
}

function assertUniqueItemPaths(items) {
  const paths = new Map();
  for (const item of items) {
    for (const itemPath of [item.astryx.path, ...item.astryx.aliases]) {
      const existing = paths.get(itemPath);
      if (existing) {
        throw new Error(
          `Duplicate shadcn registry path ${itemPath}: ${existing} and ${item.name}`,
        );
      }
      paths.set(itemPath, item.name);
    }
  }
}

function validateItem(item) {
  const result = registryItemSchema.safeParse(item);
  if (!result.success) {
    throw new Error(
      `${item.name} does not match the shadcn registry item schema:\n${result.error}`,
    );
  }
}

export function buildShadcnRegistry({
  packages,
  allComponents,
  blocks,
  templates,
  cliRoot = process.cwd(),
  dependencyTag = null,
  externalDependencySpecs = {},
}) {
  const packageDependencies = new Map([
    ...packages.map(pkg => [
      pkg.name,
      dependencyTag
        ? `${pkg.name}@${dependencyTag}`
        : `${pkg.name}@^${pkg.version}`,
    ]),
    ...Object.entries(externalDependencySpecs),
  ]);
  const componentEntries = Object.entries(allComponents);
  const skippedComponents = componentEntries
    .filter(([packageName]) => !packageDependencies.has(packageName))
    .reduce((count, [, components]) => count + components.length, 0);
  const componentItems = componentEntries
    .filter(([packageName]) => packageDependencies.has(packageName))
    .flatMap(([packageName, components]) =>
      components.map(component =>
        componentItem(packageName, component, packageDependencies),
      ),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const blockItems = [];
  let skippedUnpublishedBlocks = 0;
  for (const block of blocks) {
    try {
      blockItems.push(blockItem(block, packageDependencies, cliRoot));
    } catch (error) {
      if (error instanceof UnpublishedAstryxDependencyError) {
        skippedUnpublishedBlocks++;
        continue;
      }
      throw error;
    }
  }
  blockItems.sort((a, b) => a.name.localeCompare(b.name));

  const pageItems = [];
  let skippedUnpublishedPages = 0;
  for (const template of templates) {
    try {
      pageItems.push(pageItem(template, packageDependencies, cliRoot));
    } catch (error) {
      if (error instanceof UnpublishedAstryxDependencyError) {
        skippedUnpublishedPages++;
        continue;
      }
      throw error;
    }
  }
  pageItems.sort((a, b) => a.name.localeCompare(b.name));
  const items = [...componentItems, ...blockItems, ...pageItems];

  assertUniqueItemNames(items);
  assertUniqueItemPaths(items);
  for (const item of items) validateItem(item);

  const registry = {
    $schema: REGISTRY_SCHEMA,
    name: 'astryx',
    homepage: HOMEPAGE,
    items: items.map(item => ({
      ...item,
      files: item.files.map(({content: _content, ...file}) => file),
    })),
  };
  const registryResult = registrySchema.safeParse(registry);
  if (!registryResult.success) {
    throw new Error(
      `Generated registry does not match the shadcn registry schema:\n${registryResult.error}`,
    );
  }

  return {
    registry,
    items,
    counts: {
      components: componentItems.filter(
        item => item.astryx.kind === 'component',
      ).length,
      hooks: componentItems.filter(item => item.astryx.kind === 'hook').length,
      showcases: blockItems.filter(item => item.astryx.kind === 'showcase')
        .length,
      examples: blockItems.filter(item => item.astryx.kind === 'example')
        .length,
      blocks: blockItems.filter(item => item.astryx.kind === 'block').length,
      skippedUnpublishedComponents: skippedComponents,
      skippedUnpublishedBlocks,
      pages: pageItems.length,
      skippedUnpublishedPages,
      total: items.length,
    },
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function generateShadcnRegistry({
  outDir,
  packages,
  allComponents,
  blocks,
  templates,
  cliRoot,
  dependencyTag,
  externalDependencySpecs,
}) {
  const result = buildShadcnRegistry({
    packages,
    allComponents,
    blocks,
    templates,
    cliRoot,
    dependencyTag,
    externalDependencySpecs,
  });
  fs.rmSync(outDir, {recursive: true, force: true});
  fs.mkdirSync(outDir, {recursive: true});
  writeJson(path.join(outDir, 'registry.json'), result.registry);
  for (const item of result.items) {
    for (const itemPath of [item.astryx.path, ...item.astryx.aliases]) {
      writeJson(path.join(outDir, `${itemPath}.json`), item);
    }
  }
  return {
    ...result.counts,
    itemNames: new Set(result.items.map(item => item.name)),
    itemPaths: new Set(result.items.map(item => item.astryx.path)),
    routes: result.items.flatMap(item => [
      item.astryx.path,
      ...item.astryx.aliases,
    ]),
    contracts: result.items
      .map(item => ({
        name: item.name,
        path: item.astryx.path,
        aliases: item.astryx.aliases,
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  };
}
