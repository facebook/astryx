// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Repository icon conformance gate.
 * @input Canonical owner declarations and the generated Storybook entry point
 * @output Nonzero exit for undeclared role/state, bypass or missing review coverage
 * @position check:repo companion to check:knowledge; no build or generated data file
 */
/* global console, process */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  discoverIconRoles,
  generateIconInventoryModule,
  hasGeneratedIconInventoryCoverage,
  inventoryStory,
} from './lib/icon-role-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = discoverIconRoles(root);
const story = fs.readFileSync(path.join(root, inventoryStory), 'utf8');
if (!hasGeneratedIconInventoryCoverage(story))
  result.errors.push(`${inventoryStory}: missing generated inventory coverage`);
try {
  generateIconInventoryModule(result);
  console.log(
    `Icon conformance: ${result.slots.length} declared slots covered (${result.slots.filter(slot => slot.states.length).length} participating roles). Static checks only; browser and build parity run in their test lanes.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
