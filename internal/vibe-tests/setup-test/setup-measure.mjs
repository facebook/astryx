#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Build, serve, and measure one copied canonical fixture in two color schemes. */

import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {analyzeSetupIntegrity} from './setup-integrity.mjs';
import {openInteractionState} from './setup-interactions.mjs';
import {validatePromptContracts} from './setup-matrix.mjs';
import {
  assertPublicArtifactSafe,
  publicProvenance,
  sanitizePublicArtifact,
} from '../src/public-artifact.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) continue;
    const key = argument.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }
  return parsed;
}

export const normalizeSubpixel = value => Math.round(value * 64) / 64;

export function parseLayerOrder(css) {
  const order = [];
  for (const match of css.matchAll(/@layer\s+([^;{]+)\s*[;{]/g)) {
    for (const name of match[1].split(',').map(part => part.trim())) {
      if (/^[a-zA-Z0-9_-]+$/.test(name) && !order.includes(name)) {
        order.push(name);
      }
    }
  }
  return order;
}

function build(appDir) {
  const started = Date.now();
  const result = spawnSync('pnpm', ['build'], {cwd: appDir, encoding: 'utf8'});
  return {
    ok: result.status === 0,
    status: result.status ?? -1,
    ms: Date.now() - started,
    stdout: (result.stdout ?? '').slice(-4000),
    stderr: (result.stderr ?? '').slice(-4000),
  };
}

export function classifyCssAssets(files) {
  if (files.length === 0) return ['missing-css-asset'];
  if (files.length > 1) return [`multiple-css-assets:${files.join(',')}`];
  return [];
}

export function measurementPrivateValues({
  appDir,
  outFile,
  environment = process.env,
  cwd = process.cwd(),
  repoRoot = REPO_ROOT,
}) {
  return [
    appDir,
    repoRoot,
    cwd,
    path.dirname(outFile),
    environment.HOME,
    environment.USER,
    environment.HOSTNAME,
  ].filter(value => typeof value === 'string');
}

export function publicMeasurement(
  measurement,
  {fixtureId, privateValues = []},
) {
  const sanitized = sanitizePublicArtifact(
    {...measurement, app: fixtureId},
    {privateValues},
  );
  assertPublicArtifactSafe(sanitized, {
    label: 'measurement',
    privateValues,
  });
  return sanitized;
}

function emittedLayerOrder(distDir) {
  const assets = path.join(distDir, 'assets');
  if (!fs.existsSync(assets)) {
    return {order: [], errors: ['missing-css-assets-directory']};
  }
  const cssFiles = fs
    .readdirSync(assets)
    .filter(name => name.endsWith('.css'))
    .sort();
  const errors = classifyCssAssets(cssFiles);
  if (errors.length > 0) return {order: [], errors};
  const order = [];
  for (const file of cssFiles) {
    const css = fs.readFileSync(path.join(assets, file), 'utf8');
    for (const layer of parseLayerOrder(css)) {
      if (!order.includes(layer)) order.push(layer);
    }
  }
  return {order, errors: []};
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function serve(distDir) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const relative = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.join(distDir, relative);
    if (
      !file.startsWith(distDir) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
      response.statusCode = 404;
      response.end();
      return;
    }
    response.setHeader(
      'content-type',
      MIME[path.extname(file)] ?? 'application/octet-stream',
    );
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve =>
    server.listen(0, () => resolve({server, port: server.address().port})),
  );
}

/* c8 ignore start -- executed in the page rather than in Node. */
function readPage(spec) {
  const normalizedRect = rect => {
    const normalize = value => Math.round(value * 64) / 64;
    return {
      x: normalize(rect.x),
      y: normalize(rect.y),
      top: normalize(rect.top),
      right: normalize(rect.right),
      bottom: normalize(rect.bottom),
      left: normalize(rect.left),
      width: normalize(rect.width),
      height: normalize(rect.height),
    };
  };
  const markerSelector = marker =>
    `[data-vibe-${marker.source === 'result' ? 'result' : 'probe'}="${marker.marker ?? marker.name}"]`;
  const styleRecord = (computed, properties) =>
    Object.fromEntries(
      properties.map(property => [property, computed[property]]),
    );
  const luminance = rgb => {
    const [red, green, blue] = rgb.map(value => {
      const channel = value / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const parseColor = color => {
    const match = color.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    return {rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1};
  };
  const effectiveBackground = element => {
    let current = element;
    while (current) {
      const color = parseColor(getComputedStyle(current).backgroundColor);
      if (color && color.alpha > 0.5) return color.rgb;
      current = current.parentElement;
    }
    return [255, 255, 255];
  };
  const contrast = (foreground, background) => {
    const light = luminance(foreground) + 0.05;
    const dark = luminance(background) + 0.05;
    return (
      Math.round((Math.max(light, dark) / Math.min(light, dark)) * 100) / 100
    );
  };
  const protectedText = element => {
    const parts = [];
    const visit = node => {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          parts.push(child.textContent ?? '');
          continue;
        }
        if (!(child instanceof Element)) continue;
        if (
          child.matches(
            '[data-vibe-probe],[data-vibe-result],[data-vibe-replacement]',
          )
        ) {
          continue;
        }
        visit(child);
      }
    };
    visit(element);
    return parts.join(' ').trim().replace(/\s+/g, ' ');
  };
  const focusableSelector =
    'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]):not([disabled])';
  const isVisible = (computed, rect) =>
    computed.display !== 'none' &&
    computed.visibility !== 'hidden' &&
    Number(computed.opacity) > 0 &&
    rect.width > 0 &&
    rect.height > 0;

  const readLayerSurface = surface => {
    const element = document.querySelector(markerSelector(surface));
    if (!(element instanceof HTMLElement)) {
      return {
        kind: surface.kind,
        missing: true,
        ...(surface.styleReference
          ? {styleReference: surface.styleReference}
          : {}),
      };
    }
    let topLayerElement = element;
    try {
      let candidate = element;
      while (candidate) {
        if (candidate.matches(':modal') || candidate.matches(':popover-open')) {
          topLayerElement = candidate;
          break;
        }
        candidate = candidate.parentElement;
      }
    } catch {}
    let inTopLayer = false;
    try {
      inTopLayer =
        topLayerElement.matches(':modal') ||
        topLayerElement.matches(':popover-open');
    } catch {}
    const readsDialogBackdrop =
      surface.kind === 'backdrop' &&
      topLayerElement instanceof HTMLDialogElement &&
      inTopLayer;
    const computed = readsDialogBackdrop
      ? getComputedStyle(topLayerElement, '::backdrop')
      : getComputedStyle(element);
    const rect = readsDialogBackdrop
      ? {
          x: 0,
          y: 0,
          top: 0,
          right: innerWidth,
          bottom: innerHeight,
          left: 0,
          width: innerWidth,
          height: innerHeight,
        }
      : element.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const centerHit =
      center.x >= 0 &&
      center.x <= innerWidth &&
      center.y >= 0 &&
      center.y <= innerHeight
        ? document.elementFromPoint(center.x, center.y)
        : null;
    let clippingAncestor = null;
    let ancestor =
      readsDialogBackdrop || (inTopLayer && topLayerElement === element)
        ? null
        : element.parentElement;
    while (ancestor && ancestor !== document.documentElement) {
      const ancestorStyle = getComputedStyle(ancestor);
      if (
        /hidden|clip/.test(
          `${ancestorStyle.overflowX} ${ancestorStyle.overflowY}`,
        )
      ) {
        const ancestorRect = ancestor.getBoundingClientRect();
        if (
          rect.left < ancestorRect.left ||
          rect.right > ancestorRect.right ||
          rect.top < ancestorRect.top ||
          rect.bottom > ancestorRect.bottom
        ) {
          clippingAncestor =
            ancestor.getAttribute('data-vibe-probe') ||
            ancestor.getAttribute('data-vibe-result') ||
            ancestor.tagName.toLowerCase();
          break;
        }
      }
      ancestor = ancestor.parentElement;
    }
    return {
      kind: surface.kind,
      ...(surface.styleReference
        ? {styleReference: surface.styleReference}
        : {}),
      visible: isVisible(computed, rect),
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      position: computed.position,
      zIndex: computed.zIndex,
      style: styleRecord(computed, spec.surfaceProperties),
      bounds: normalizedRect(rect),
      intersectsViewport:
        rect.right > 0 &&
        rect.bottom > 0 &&
        rect.left < innerWidth &&
        rect.top < innerHeight,
      clippingAncestor,
      centerHitSelf:
        centerHit === element ||
        (centerHit instanceof Node && element.contains(centerHit)),
      centerHitProbe:
        centerHit instanceof Element
          ? (centerHit
              .closest('[data-vibe-probe],[data-vibe-result]')
              ?.getAttribute('data-vibe-probe') ??
            centerHit
              .closest('[data-vibe-result]')
              ?.getAttribute('data-vibe-result') ??
            null)
          : null,
      topLayer: {
        tagName: topLayerElement.tagName.toLowerCase(),
        role: topLayerElement.getAttribute('role'),
        open: topLayerElement.hasAttribute('open'),
        popover: topLayerElement.getAttribute('popover'),
        ariaModal: topLayerElement.getAttribute('aria-modal'),
        inTopLayer,
        portalChild: topLayerElement.parentElement === document.body,
      },
    };
  };

  const probes = {};
  for (const probe of spec.probes) {
    const element = document.querySelector(probe.selector);
    if (!(element instanceof HTMLElement)) {
      probes[probe.name] = {missing: true};
      continue;
    }
    const computed = getComputedStyle(element);
    const foreground = parseColor(computed.color);
    probes[probe.name] = {
      style: styleRecord(computed, spec.properties),
      geometry: normalizedRect(element.getBoundingClientRect()),
      text: protectedText(element),
      descendantText: (element.textContent ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 200),
      contrast: foreground
        ? contrast(foreground.rgb, effectiveBackground(element))
        : null,
    };
  }

  const taskResults = {};
  for (const result of spec.results ?? []) {
    const elements = document.querySelectorAll(
      `[data-vibe-result="${result.name}"]`,
    );
    const element = elements[0];
    if (!(element instanceof HTMLElement)) {
      taskResults[result.name] = {
        count: elements.length,
        visible: false,
        focusable: false,
        text: '',
        style: {},
        geometry: null,
      };
      continue;
    }
    const computed = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    taskResults[result.name] = {
      count: elements.length,
      visible: isVisible(computed, rect),
      focusable:
        (element.matches(focusableSelector) ||
          element.querySelector(focusableSelector) != null) &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-disabled') !== 'true',
      text: (element.textContent ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 200),
      style: styleRecord(computed, spec.properties),
      geometry: normalizedRect(rect),
    };
  }

  const root = getComputedStyle(document.documentElement);
  const variables = {};
  for (const variable of spec.rootVariables) {
    variables[variable] = root.getPropertyValue(variable).trim();
  }
  const interaction = spec.interaction
    ? {
        id: spec.interaction.id,
        direction: spec.interaction.direction ?? 'host-baseline',
        opened: true,
        keyboardReached: {},
        error: null,
        surfaces: Object.fromEntries(
          spec.interaction.surfaces.map(surface => [
            surface.name,
            readLayerSurface(surface),
          ]),
        ),
      }
    : undefined;
  return {
    probes,
    variables,
    colorScheme: root.colorScheme,
    taskResults,
    ...(interaction ? {interaction} : {}),
  };
}
/* c8 ignore stop */

async function readScheme({
  browser,
  port,
  colorScheme,
  probeSpec,
  interaction,
}) {
  const page = await browser.newPage({
    viewport: {width: 1280, height: 720},
    colorScheme,
  });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on(
    'console',
    message => message.type() === 'error' && consoleErrors.push(message.text()),
  );
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('requestfailed', request => failedRequests.push(request.url()));
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  let state = {opened: false, keyboardReached: {}};
  let interactionError = null;
  if (interaction) {
    try {
      state = await openInteractionState(page, interaction);
    } catch (error) {
      interactionError = String(error);
    }
  }
  const reading = await page.evaluate(readPage, {...probeSpec, interaction});
  if (reading.interaction) {
    reading.interaction.opened = state.opened && interactionError === null;
    reading.interaction.keyboardReached = state.keyboardReached;
    reading.interaction.error = interactionError;
  }
  await page.close();
  return {reading, consoleErrors, pageErrors, failedRequests};
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (typeof args.app !== 'string' || typeof args.fixture !== 'string') {
    throw new Error(
      'usage: setup-measure.mjs --app <dir> --fixture <id> --out <file>',
    );
  }
  const appDir = path.resolve(args.app);
  const fixtureId = args.fixture;
  const outFile = path.resolve(
    typeof args.out === 'string'
      ? args.out
      : path.join(HERE, 'results', 'measurement.json'),
  );
  const screenshotDir =
    typeof args['screenshot-dir'] === 'string'
      ? path.resolve(args['screenshot-dir'])
      : null;
  const label =
    typeof args.label === 'string'
      ? args.label
      : path.basename(outFile, '.json');

  const probeFile = JSON.parse(
    fs.readFileSync(path.join(HERE, 'probes.json'), 'utf8'),
  );
  const fixtureProbes = probeFile.fixtures[fixtureId];
  if (!fixtureProbes) throw new Error(`unknown fixture probes: ${fixtureId}`);

  const provenance =
    typeof args.provenance === 'string'
      ? JSON.parse(fs.readFileSync(args.provenance, 'utf8'))
      : null;
  if (
    provenance &&
    (provenance.schemaVersion !== 1 || provenance.fixture?.id !== fixtureId)
  ) {
    throw new Error('provenance sidecar does not match the measured fixture');
  }
  const prompts = JSON.parse(
    fs.readFileSync(path.join(HERE, 'prompts.json'), 'utf8'),
  ).prompts;
  const matrixConfig = JSON.parse(
    fs.readFileSync(path.join(HERE, 'matrix.json'), 'utf8'),
  );
  validatePromptContracts(prompts, probeFile, matrixConfig);
  const taskDefinition = provenance?.task?.id
    ? prompts.find(prompt => prompt.id === provenance.task.id)
    : null;
  if (provenance?.task?.id && !taskDefinition) {
    throw new Error(`unknown task contract: ${provenance.task.id}`);
  }
  if (taskDefinition && !taskDefinition.fixtures.includes(fixtureId)) {
    throw new Error(
      `task ${taskDefinition.id} does not support fixture ${fixtureId}`,
    );
  }

  const surfaceProperties = probeFile.properties.filter(
    property =>
      !property.startsWith('margin') &&
      ![
        'position',
        'top',
        'right',
        'bottom',
        'left',
        'transform',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
      ].includes(property),
  );
  const probeSpec = {
    properties: probeFile.properties,
    surfaceProperties,
    probes: fixtureProbes.probes,
    rootVariables: fixtureProbes.rootVariables,
    interaction: fixtureProbes.interaction ?? null,
    results: taskDefinition?.contract.results ?? [],
  };

  let integrity;
  if (taskDefinition) {
    const analyzed = analyzeSetupIntegrity(
      appDir,
      provenance?.execution?.agentDiffSha256,
    );
    integrity = {
      diffSha256: analyzed.diffSha256,
      attestedDiffSha256: analyzed.attestation.expectedSha256,
      diffMatchesAttestation: analyzed.attestation.matches,
      usesAstryx: analyzed.astryxUsage.found,
      changedFiles: analyzed.changedFiles.map(file => file.path),
      escapeHatches: analyzed.escapeHatches.map(finding => finding.kind),
    };
  }

  const measurement = {
    label,
    fixture: fixtureId,
    app: appDir,
    measuredAt: new Date().toISOString(),
    build: build(appDir),
    layerOrder: [],
    measurementErrors: [],
    ...(taskDefinition
      ? {
          task: {
            id: taskDefinition.id,
            kind: taskDefinition.kind,
            contract: taskDefinition.contract,
          },
          executionStatus: provenance?.execution?.status ?? 'missing',
          integrity,
        }
      : {}),
    schemes: {},
  };

  if (measurement.build.ok) {
    const distDir = path.join(appDir, 'dist');
    const layers = emittedLayerOrder(distDir);
    measurement.layerOrder = layers.order;
    measurement.measurementErrors = layers.errors;
    const {chromium} = await import('playwright');
    const {server, port} = await serve(distDir);
    const browser = await chromium.launch();

    for (const colorScheme of ['light', 'dark']) {
      const mainReading = await readScheme({
        browser,
        port,
        colorScheme,
        probeSpec,
        interaction: probeSpec.interaction,
      });
      const taskInteractions = {};
      for (const interaction of taskDefinition?.contract.interactions ?? []) {
        const taskReading = await readScheme({
          browser,
          port,
          colorScheme,
          probeSpec: {...probeSpec, probes: [], rootVariables: [], results: []},
          interaction,
        });
        taskInteractions[interaction.id] = taskReading.reading.interaction;
        mainReading.consoleErrors.push(...taskReading.consoleErrors);
        mainReading.pageErrors.push(...taskReading.pageErrors);
        mainReading.failedRequests.push(...taskReading.failedRequests);
      }
      if (screenshotDir) {
        fs.mkdirSync(screenshotDir, {recursive: true});
        const page = await browser.newPage({
          viewport: {width: 1280, height: 720},
          colorScheme,
        });
        await page.goto(`http://127.0.0.1:${port}/`);
        await page.screenshot({
          path: path.join(screenshotDir, `${label}-${colorScheme}.png`),
          fullPage: true,
        });
        await page.close();
      }
      measurement.schemes[colorScheme] = {
        ...mainReading.reading,
        taskInteractions,
        consoleErrors: mainReading.consoleErrors,
        pageErrors: mainReading.pageErrors,
        failedRequests: mainReading.failedRequests,
      };
    }

    await browser.close();
    server.close();
  }

  const privateValues = measurementPrivateValues({appDir, outFile});
  const exportedMeasurement = publicMeasurement(measurement, {
    fixtureId,
    privateValues,
  });
  fs.mkdirSync(path.dirname(outFile), {recursive: true});
  fs.writeFileSync(
    outFile,
    `${JSON.stringify(exportedMeasurement, null, 2)}\n`,
  );

  if (provenance) {
    const sidecarOut = outFile.replace(/\.json$/, '.provenance.json');
    const exportedProvenance = publicProvenance(provenance, {privateValues});
    fs.writeFileSync(
      sidecarOut,
      `${JSON.stringify(exportedProvenance, null, 2)}\n`,
    );
  }

  console.log(
    `${label}: build ${measurement.build.ok ? 'ok' : `FAILED (${measurement.build.status})`}` +
      (measurement.build.ok
        ? `, ${measurement.schemes.light.consoleErrors.length} console errors` +
          `, ${Object.values(measurement.schemes.light.probes).filter(probe => probe.missing).length} probes missing`
        : ''),
  );
}

const isMain =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) await main();
