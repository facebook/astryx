#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Check or refresh one verified-N/A evidence declaration.
 * @input Built Storybook index and verified-not-applicable.json; optional
 *   `--write --component <Core/Lab name>` after manually re-reviewing evidence.
 * @output Drift report, or one scoped declaration update.
 * @position Author workflow for the RTL applicability registry.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {compareVerifiedNaEvidence} from './rtl-audit-coverage.mjs';
import {
  buildCurrentVerifiedNaEvidence,
  discoverAuditedSourceComponents,
  validateVerifiedNaRegistry,
} from './verified-na-evidence.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, '../../..');
const REGISTRY_PATH = path.join(HERE, 'verified-not-applicable.json');
const INDEX_PATH = path.join(PROJECT_ROOT, 'apps/storybook/dist/index.json');
const args = process.argv.slice(2);
const write = args.includes('--write');
const componentIndex = args.indexOf('--component');
const component = componentIndex === -1 ? null : args[componentIndex + 1];

if (write && (component == null || component.startsWith('--'))) {
  console.error(
    'Refusing a bulk refresh: --write requires --component <Core/Lab name>.',
  );
  process.exit(2);
}

let declarations;
let storyEntries;
try {
  declarations = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  storyEntries = Object.values(
    JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')).entries ?? {},
  );
} catch (error) {
  console.error(
    `Cannot read the registry or built Storybook index: ${String(error)}`,
  );
  process.exit(2);
}

if (!Array.isArray(declarations)) {
  console.error('verified-not-applicable.json must contain a JSON array.');
  process.exit(2);
}

const shapeErrors = validateVerifiedNaRegistry(declarations, {
  requireEvidence: !write,
});
if (shapeErrors.length > 0) {
  console.error(shapeErrors.join('\n'));
  process.exit(1);
}

const sourceComponents = discoverAuditedSourceComponents(PROJECT_ROOT);
const {evidenceByComponent, errors} = buildCurrentVerifiedNaEvidence({
  declarations,
  projectRoot: PROJECT_ROOT,
  sourceComponents,
  storyEntries,
});
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

if (write) {
  const target = declarations.find(
    declaration =>
      declaration.component.toLowerCase() === component.toLowerCase(),
  );
  if (target == null) {
    console.error(`No verified-N/A declaration for ${component}.`);
    process.exit(2);
  }
  target.evidence = evidenceByComponent.get(target.component.toLowerCase());
  const finalErrors = validateVerifiedNaRegistry(declarations);
  if (finalErrors.length > 0) {
    console.error(finalErrors.join('\n'));
    process.exit(1);
  }
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(declarations, null, 2)}\n`);
  console.log(
    `Refreshed ${target.component} after its evidence was re-reviewed.`,
  );
  process.exit(0);
}

let drift = 0;
for (const declaration of declarations) {
  const current = evidenceByComponent.get(declaration.component.toLowerCase());
  const diff = compareVerifiedNaEvidence(declaration.evidence, current);
  if (diff.added.length + diff.removed.length + diff.changed.length === 0) {
    continue;
  }
  drift += 1;
  console.error(`${declaration.component}: evidence changed`);
  for (const file of diff.added) console.error(`  + ${file}`);
  for (const file of diff.removed) console.error(`  - ${file}`);
  for (const file of diff.changed) console.error(`  ~ ${file}`);
}

if (drift > 0) {
  console.error(
    `${drift} declaration(s) need source/story review before their evidence can be refreshed.`,
  );
  process.exit(1);
}
console.log(
  `${declarations.length} verified-N/A evidence declarations are current.`,
);
