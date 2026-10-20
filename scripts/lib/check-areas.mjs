// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The answer-picking area checks, run by check-cli-structure. An area is any
 * `api/<subject>/nodes/` directory. For each one:
 *
 * - `index.mjs` is the registry: one `export {node as <name>} from './<id>.mjs';`
 *   line per node and nothing else, and it lists every node module there;
 * - each node module defines exactly one node with the shared kit, its id is
 *   its file stem, its `tests` file exists, and so does its `weights` file;
 * - an area's weights files total at most 1 MB;
 * - a node imports no file, network, subprocess, project, discovery, or
 *   adapter module, and a dispatcher imports no other node;
 * - no model file sits in the area;
 * - the subject's entry runs the tree (`runArea`) and defines no private
 *   function of its own.
 *
 * Separately, the CLI's dependencies include no model runtime or inference
 * library.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';

/** An area's weights files may total at most this many bytes. */
export const AREA_WEIGHTS_LIMIT = 1_000_000;

/** File extensions of model files. */
export const MODEL_FILE =
  /\.(onnx|ort|tflite|pt|pth|safetensors|gguf|ggml|h5|pb|mlmodel|mlpackage|wasm)$/i;

/** Dependencies that are model runtimes or inference libraries. */
export const MODEL_RUNTIME = [
  /^onnxruntime(-|$)/,
  /^@tensorflow\//,
  /^@tensorflow-models\//,
  /^@xenova\/transformers$/,
  /^@huggingface\/transformers$/,
  /^@mlc-ai\//,
  /^node-llama-cpp$/,
  /^@mediapipe\//,
  /^brain\.js$/,
  /^ml5$/,
];

/** Import specifiers a node may never use (INV21). */
function bannedNodeImport(spec) {
  if (
    /^(node:)?(fs|fs\/promises|child_process|http|https|http2|net|tls|dns|dgram|worker_threads|cluster)$/.test(
      spec,
    )
  ) {
    return 'environment';
  }
  if (spec.includes('foundation/config/project')) return 'project';
  if (spec.includes('foundation/discovery/')) return 'discovery';
  if (/(^|\/)_adapter\.mjs$/.test(spec)) return 'adapter';
  if (MODEL_RUNTIME.some(re => re.test(spec))) return 'model runtime';
  return null;
}

/** @param {string} src */
function importSpecs(src) {
  /** @type {string[]} */
  const out = [];
  for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) out.push(m[1]);
  for (const m of src.matchAll(
    /(?<!\{)\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  )) {
    out.push(m[1]);
  }
  for (const m of src.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm))
    out.push(m[1]);
  return out;
}

/** @param {string} dir @returns {string[]} files under dir, relative */
function filesUnder(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const f of filesUnder(full)) out.push(path.join(entry.name, f));
    } else out.push(entry.name);
  }
  return out;
}

/**
 * @param {{cliRoot: string, apiDir?: string}} options
 * @returns {Promise<{errors: string[], areas: number, nodes: number}>}
 */
export async function checkAreas({
  cliRoot,
  apiDir = path.join(cliRoot, 'api'),
}) {
  /** @type {string[]} */
  const errors = [];
  let areas = 0;
  let nodes = 0;

  const pkg = JSON.parse(
    fs.readFileSync(path.join(cliRoot, 'package.json'), 'utf8'),
  );
  for (const field of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      if (MODEL_RUNTIME.some(re => re.test(name))) {
        errors.push(
          `areas: ${field} lists ${name}, a model runtime; areas answer with plain algorithms and static weights`,
        );
      }
    }
  }

  if (!fs.existsSync(apiDir)) return {errors, areas, nodes};
  for (const subject of fs.readdirSync(apiDir).sort()) {
    const subjectDir = path.join(apiDir, subject);
    const nodesDir = path.join(subjectDir, 'nodes');
    if (!fs.statSync(subjectDir).isDirectory() || !fs.existsSync(nodesDir))
      continue;
    areas++;
    const where = `api/${subject}/nodes`;
    const files = filesUnder(nodesDir);

    for (const file of files) {
      if (MODEL_FILE.test(file)) {
        errors.push(
          `areas: ${where}/${file} is a model file; areas ship static weights only`,
        );
      }
    }

    // The registry: one export line per node, and every node module listed.
    const indexPath = path.join(nodesDir, 'index.mjs');
    if (!fs.existsSync(indexPath)) {
      errors.push(`areas: ${where} has no index.mjs registry`);
      continue;
    }
    /** @type {Map<string, string>} */
    const listed = new Map();
    const lines = fs.readFileSync(indexPath, 'utf8').split('\n');
    for (const raw of lines) {
      const line = raw.trim();
      if (line === '' || line.startsWith('//')) continue;
      const m = line.match(
        /^export\s*\{\s*node\s+as\s+([A-Za-z_$][\w$]*)\s*\}\s*from\s*'\.\/([a-z][a-z0-9-]*)\.mjs';$/,
      );
      if (!m) {
        errors.push(
          `areas: ${where}/index.mjs: "${line}" is not a registry line (export {node as <name>} from './<id>.mjs';)`,
        );
        continue;
      }
      if (listed.has(m[2])) {
        errors.push(`areas: ${where}/index.mjs lists ${m[2]} twice`);
      }
      listed.set(m[2], m[1]);
    }
    const nodeModules = files.filter(
      f =>
        !f.includes(path.sep) &&
        f.endsWith('.mjs') &&
        f !== 'index.mjs' &&
        !f.endsWith('.test.mjs') &&
        !f.startsWith('_'),
    );
    for (const file of nodeModules) {
      const id = file.slice(0, -'.mjs'.length);
      if (!listed.has(id)) {
        errors.push(`areas: ${where}/${file} is not listed in index.mjs`);
      }
    }

    /** @type {Map<string, any>} */
    const loaded = new Map();
    let weightsBytes = 0;
    for (const id of listed.keys()) {
      nodes++;
      const file = path.join(nodesDir, `${id}.mjs`);
      if (!fs.existsSync(file)) {
        errors.push(
          `areas: ${where}/index.mjs lists ${id}.mjs, which does not exist`,
        );
        continue;
      }
      const src = fs.readFileSync(file, 'utf8');
      const defines = src.match(/\bdefine(Searcher|Dispatcher)\s*\(/g) ?? [];
      if (
        defines.length !== 1 ||
        !/export\s+const\s+node\s*=\s*define(Searcher|Dispatcher)\s*\(/.test(
          src,
        )
      ) {
        errors.push(
          `areas: ${where}/${id}.mjs must export exactly one node: export const node = defineSearcher(...) or defineDispatcher(...)`,
        );
      }
      if (
        !importSpecs(src).some(s => /foundation\/areas\/areas\.mjs$/.test(s))
      ) {
        errors.push(
          `areas: ${where}/${id}.mjs does not use the shared kit (foundation/areas/areas.mjs)`,
        );
      }
      for (const spec of importSpecs(src)) {
        const banned = bannedNodeImport(spec);
        if (banned) {
          errors.push(
            `areas: ${where}/${id}.mjs imports ${spec} (${banned}); nodes read only their context`,
          );
        }
      }
      let node;
      try {
        node = (await import(pathToFileURL(file).href)).node;
      } catch (error) {
        errors.push(
          `areas: ${where}/${id}.mjs does not load: ${error instanceof Error ? error.message : String(error)}`,
        );
        continue;
      }
      if (!node || (node.kind !== 'searcher' && node.kind !== 'dispatcher')) {
        errors.push(`areas: ${where}/${id}.mjs exports no node`);
        continue;
      }
      loaded.set(id, node);
      if (node.id !== id) {
        errors.push(
          `areas: ${where}/${id}.mjs defines node "${node.id}"; the id is the file stem`,
        );
      }
      if (node.area !== subject) {
        errors.push(
          `areas: ${where}/${id}.mjs says area "${node.area}"; it lives in "${subject}"`,
        );
      }
      if (!fs.existsSync(path.join(nodesDir, node.tests ?? ''))) {
        errors.push(
          `areas: ${where}/${id}.mjs names tests ${node.tests}, which does not exist`,
        );
      }
      if (node.weights !== null) {
        const weightsPath = path.join(nodesDir, node.weights ?? '');
        if (!fs.existsSync(weightsPath)) {
          errors.push(
            `areas: ${where}/${id}.mjs names weights ${node.weights}, which does not exist`,
          );
        } else {
          weightsBytes += fs.statSync(weightsPath).size;
        }
      }
    }
    if (weightsBytes > AREA_WEIGHTS_LIMIT) {
      errors.push(
        `areas: ${where} ships ${weightsBytes} bytes of weights; the limit is ${AREA_WEIGHTS_LIMIT}`,
      );
    }

    // A dispatcher imports no other node: it routes and never ranks.
    for (const [id, node] of loaded) {
      if (node.kind !== 'dispatcher') continue;
      const src = fs.readFileSync(path.join(nodesDir, `${id}.mjs`), 'utf8');
      for (const spec of importSpecs(src)) {
        const m = spec.match(/^\.\/([a-z][a-z0-9-]*)\.mjs$/);
        if (m && listed.has(m[1])) {
          errors.push(
            `areas: dispatcher ${where}/${id}.mjs imports node ${m[1]}; a dispatcher routes and never scores`,
          );
        }
      }
    }

    // The entry gathers through its adapter and runs the tree.
    const entry = path.join(subjectDir, `${subject}.mjs`);
    if (fs.existsSync(entry)) {
      const src = fs.readFileSync(entry, 'utf8');
      if (!/\brunArea\s*\(/.test(src)) {
        errors.push(
          `areas: api/${subject}/${subject}.mjs must run its area with runArea`,
        );
      }
      for (const m of src.matchAll(
        /^(?!export\b)(?:async\s+)?function\s+([\w$]+)/gm,
      )) {
        errors.push(
          `areas: api/${subject}/${subject}.mjs defines ${m[1]}; an area entry only gathers and runs the tree`,
        );
      }
      for (const m of src.matchAll(
        /^const\s+([\w$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>/gm,
      )) {
        errors.push(
          `areas: api/${subject}/${subject}.mjs defines ${m[1]}; an area entry only gathers and runs the tree`,
        );
      }
    }
  }
  return {errors, areas, nodes};
}
