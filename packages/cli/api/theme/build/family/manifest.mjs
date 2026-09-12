// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file manifest.mjs
 * @input Complete family artifacts, graph, plans, versions, and stable provenance
 * @output Content-identified generation with manifest-owned relative paths
 * @position AST-034 FR9/FR12 deterministic ownership boundary
 */

import {createHash} from 'node:crypto';

/** @param {string | Buffer} value */
function digest(value) {
  return `sha256-${createHash('sha256').update(value).digest('hex')}`;
}

/** @param {unknown} value @returns {string} */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    return `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** @param {any} section */
function summarizeSection(section) {
  return {id: section.id, tracks: section.tracks, empty: section.empty};
}

/** @param {any} section */
function sectionId(section) {
  return section.id;
}

/**
 * @param {object} input
 * @param {string} input.artifactKey
 * @param {any} input.graph
 * @param {any[]} input.plans
 * @param {string} input.css
 * @param {string} input.js
 * @param {string} input.dts
 * @param {{cli: string, core: string}} input.tools
 * @param {string} input.command
 * @param {string[]} input.warnings
 * @param {string[]} input.notices
 */
export function createFamilyGeneration(input) {
  const {artifactKey, graph, plans, css, js, dts, tools, command} = input;
  const receipt = {
    schemaVersion: 1,
    artifactKey,
    members: plans.map(plan => ({
      name: plan.identity.name,
      parent: plan.identity.parentName,
      sourceId: plan.identity.sourceId,
      planDigest: plan.planDigest,
      sections: plan.sections.map(summarizeSection),
    })),
    warnings: [...new Set(input.warnings)].sort(),
    notices: [...new Set(input.notices)].sort(),
  };
  const receiptContent = `${JSON.stringify(receipt, null, 2)}\n`;
  const artifactFiles = new Map([
    [`${artifactKey}.css`, css],
    [`${artifactKey}.js`, js],
    [`${artifactKey}.d.ts`, dts],
    ['receipts/build.json', receiptContent],
  ]);
  const memberReceiptPaths = new Map();
  plans.forEach((plan, index) => {
    const receiptPath = `receipts/members/${String(index).padStart(3, '0')}-${plan.identity.name}.json`;
    memberReceiptPaths.set(plan.identity.name, receiptPath);
    artifactFiles.set(
      receiptPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          artifactKey,
          name: plan.identity.name,
          parent: plan.identity.parentName,
          sourceId: plan.identity.sourceId,
          planDigest: plan.planDigest,
          sections: plan.sections.map(summarizeSection),
        },
        null,
        2,
      )}\n`,
    );
  });
  const owned = [...artifactFiles]
    .map(([file, content]) => ({path: file, digest: digest(content)}))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const generationId = `gen-${digest(
    canonicalJson({
      sourceGraphDigest: graph.sourceGraphDigest,
      owned,
      tools,
    }),
  ).slice('sha256-'.length, 'sha256-'.length + 20)}`;
  const manifestPath = `${artifactKey}.manifest.json`;
  const manifest = {
    schemaVersion: 1,
    artifactKey,
    generationId,
    family: {
      rootName: graph.rootName,
      sourceGraphDigest: graph.sourceGraphDigest,
    },
    members: plans.map(plan => ({
      name: plan.identity.name,
      sourceId: plan.identity.sourceId,
      parent: plan.identity.parentName,
      sectionIds: plan.sections.map(sectionId),
      planDigest: plan.planDigest,
      receipt: memberReceiptPaths.get(plan.identity.name),
    })),
    artifacts: {
      css: `${artifactKey}.css`,
      js: `${artifactKey}.js`,
      dts: `${artifactKey}.d.ts`,
      manifest: manifestPath,
    },
    owned,
    tools,
    provenance: {
      command,
      sources: plans.map(plan => plan.identity.sourceId),
    },
  };
  artifactFiles.set(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return {generationId, files: artifactFiles, manifestPath, manifest, receipt};
}
