// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global URL, document, fetch, process, setTimeout, window */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import {AxeBuilder} from '@axe-core/playwright';
import {chromium} from 'playwright';
import {REACT_INTERACTIVE_ROOT_CLASSES} from './react-interactive-roots.mjs';
import {
  auditTranscript,
  createPrivateRunRoot,
  runCommand,
  runProfileCommand,
} from './process.mjs';

const fsp = fs.promises;

export async function evaluateRun({
  config,
  projectDir,
  prompt,
  screenshotPath,
  baselineSources,
  skipJudge = false,
  verifyStarterTyping = false,
  judgeProfile,
}) {
  const typecheck =
    config === 'react-build'
      ? await runCommand('npm', ['run', 'typecheck'], {
          cwd: projectDir,
          timeoutMs: 5 * 60 * 1000,
        })
      : null;
  const build =
    config === 'react-build'
      ? await runCommand('npm', ['run', 'build'], {
          cwd: projectDir,
          timeoutMs: 5 * 60 * 1000,
        })
      : {code: 0, stdout: '', stderr: '', durationMs: 0, timedOut: false};
  const source = await scanAuthoredSource(projectDir, baselineSources);

  if (build.code !== 0) {
    return failedEvaluation({
      build,
      typecheck,
      source,
      reason: build.stderr || build.stdout || 'Build failed',
    });
  }

  await fsp.mkdir(path.dirname(screenshotPath), {recursive: true});
  const server =
    config === 'react-build'
      ? await startVitePreview(projectDir)
      : await startStaticServer(projectDir);

  let browser;
  try {
    browser = await chromium.launch({headless: true});
    const context = await browser.newContext({
      viewport: {width: 1440, height: 900},
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(server.url, {waitUntil: 'networkidle', timeout: 90_000});
    await page.waitForTimeout(1500);

    let starterTyping = null;
    if (verifyStarterTyping) {
      const input = page.getByLabel('Starter field');
      await input.fill('typing works');
      starterTyping = {
        expected: 'typing works',
        actual: await input.inputValue(),
      };
      starterTyping.passed = starterTyping.actual === starterTyping.expected;
    }

    const renderMetrics = await page.evaluate(measureAdoptionInDocument, {
      reactInteractiveRootClasses: REACT_INTERACTIVE_ROOT_CLASSES,
    });
    const axe = await new AxeBuilder({page}).analyze();
    await page.screenshot({path: screenshotPath, fullPage: true});

    const nonBlank =
      renderMetrics.textLength >= 20 && renderMetrics.visibleElementCount >= 3;
    const render = {
      ...renderMetrics,
      nonBlank,
      consoleErrors,
      pageErrors,
      starterTyping,
      passed:
        nonBlank &&
        consoleErrors.length === 0 &&
        pageErrors.length === 0 &&
        (starterTyping?.passed ?? true),
      url: server.url,
    };
    if (!render.passed) {
      render.interactiveAdoptionShare = 0;
      render.interactiveAdoptedElementCount = 0;
      render.adoptionShare = 0;
      render.adoptedElementCount = 0;
    }
    const judge = !render.passed
      ? zeroJudgment('Render failed, was blank, or emitted runtime errors')
      : skipJudge
        ? {skipped: true}
        : await runBlindJudge({
            prompt,
            screenshotPath,
            profile: judgeProfile,
          });

    return {
      build: commandReceipt(build),
      typecheck: typecheckReceipt(typecheck),
      render,
      source,
      accessibility: {
        violationCount: axe.violations.length,
        violations: axe.violations.map(violation => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.length,
        })),
      },
      judge,
    };
  } catch (error) {
    return failedEvaluation({
      build,
      typecheck,
      source,
      reason:
        error instanceof Error ? (error.stack ?? error.message) : String(error),
    });
  } finally {
    await browser?.close();
    await server.stop();
  }
}

function failedEvaluation({build, typecheck, source, reason}) {
  return {
    build: commandReceipt(build),
    typecheck: typecheckReceipt(typecheck),
    render: {
      passed: false,
      nonBlank: false,
      textLength: 0,
      visibleElementCount: 0,
      interactiveEligibleElementCount: 0,
      interactiveAdoptedElementCount: 0,
      interactiveAdoptionShare: 0,
      eligibleElementCount: 0,
      adoptedElementCount: 0,
      adoptionShare: 0,
      consoleErrors: [],
      pageErrors: [],
      error: reason,
    },
    source,
    accessibility: {violations: [], violationCount: null},
    judge: zeroJudgment(reason),
  };
}

function zeroJudgment(reason) {
  return {
    configBlind: true,
    promptFulfillment: 0,
    visualQuality: 0,
    success: false,
    notes: reason,
    failureReasons: [reason],
    automaticFailure: true,
  };
}

export function measureAdoptionInDocument(options = false) {
  const assumeVisible =
    typeof options === 'boolean' ? options : (options.assumeVisible ?? false);
  const reactInteractiveRootClasses =
    typeof options === 'boolean'
      ? REACT_INTERACTIVE_ROOT_CLASSES
      : (options.reactInteractiveRootClasses ?? []);
  const doc = document;
  const view = doc.defaultView ?? window;
  // These layout-only families come from the stable classes emitted by the
  // React Layout/Stack/etc. sources and Vanilla Layout.css/Stack.css. All
  // other Astryx classes, including BEM or hyphenated component parts, are
  // component classes that may confer coarse adoption.
  const reactLayoutRoots = [
    'astryx-stack',
    'astryx-layout',
    'astryx-grid',
    'astryx-center',
    'astryx-section',
    'astryx-app-shell',
    'astryx-form-layout',
    'astryx-stepper-frame',
    'astryx-collapsible-content',
  ];
  const vanillaLayoutRoots = [
    'ax-stack',
    'ax-layout',
    'ax-grid',
    'ax-center',
    'ax-section',
    'ax-app-shell',
    'ax-form-layout',
    'ax-stepper-frame',
    'ax-collapsible__content',
  ];
  // React control roots are derived from the real packages/core DOM and
  // verified by DeliveryModesInteractiveRoots.test.tsx. Vanilla roots remain
  // explicit because the static delivery package does not have React fixtures.
  const interactiveWrapperRoots = new Set([
    ...reactInteractiveRootClasses,
    'ax-input',
    'ax-text-input',
    'ax-search-input',
    'ax-textarea',
    'ax-text-area',
    'ax-number-input',
    'ax-date-input',
    'ax-date-range-input',
    'ax-time-input',
    'ax-file-input',
    'ax-select',
    'ax-multi-selector',
    'ax-checkbox',
    'ax-radio',
    'ax-radio-list',
    'ax-switch',
    'ax-slider',
    'ax-combobox',
  ]);
  const interactiveSelector = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    'dialog',
    '[role="button"]',
    '[role="link"]',
    '[role="textbox"]',
    '[role="combobox"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="searchbox"]',
    '[role="option"]',
    '[role="treeitem"]',
    '[role="menu"]',
    '[role="menuitem"]',
    '[role="menuitemcheckbox"]',
    '[role="menuitemradio"]',
    '[role="tab"]',
    '[role="dialog"]',
    '[role="alertdialog"]',
  ].join(',');
  const semanticSelector = [
    interactiveSelector,
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'table',
    'nav',
    '[role="table"]',
    '[role="navigation"]',
  ].join(',');
  const containerSelector = [
    '.astryx-card',
    '.ax-card',
    '.astryx-banner-frame',
    '.ax-banner',
    '.astryx-dialog',
    '.ax-dialog',
    '.astryx-table',
    '.ax-table',
    '.astryx-top-nav',
    '.ax-top-nav',
    '.astryx-side-nav',
    '.ax-side-nav',
  ].join(',');
  const targets = new Set([
    ...doc.querySelectorAll(semanticSelector),
    ...doc.querySelectorAll(containerSelector),
  ]);
  const interactiveTargets = new Set(doc.querySelectorAll(interactiveSelector));

  const classNames = element =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
  const isDesignSystemClass = name =>
    name.startsWith('astryx-') || name.startsWith('ax-');
  const belongsToFamily = (name, root) =>
    name === root ||
    name.startsWith(`${root}-`) ||
    name.startsWith(`${root}--`) ||
    name.startsWith(`${root}__`);
  const isLayoutClass = name => {
    const roots = name.startsWith('astryx-')
      ? reactLayoutRoots
      : name.startsWith('ax-')
        ? vanillaLayoutRoots
        : [];
    return roots.some(root => belongsToFamily(name, root));
  };
  const designSystemClasses = element =>
    classNames(element).filter(isDesignSystemClass);
  const isVisible = element => {
    if (assumeVisible) {
      return !element.hasAttribute('hidden');
    }
    const tabPanel = element.closest('[role="tabpanel"]');
    const controllingTabId = tabPanel?.getAttribute('aria-labelledby');
    const controllingTab = controllingTabId
      ? doc.getElementById(controllingTabId)
      : null;
    const inactiveTabPanel =
      tabPanel &&
      (tabPanel.getAttribute('data-state') === 'inactive' ||
        tabPanel.getAttribute('data-state') === 'closed' ||
        tabPanel.getAttribute('data-active') === 'false' ||
        controllingTab?.getAttribute('aria-selected') === 'false');
    if (
      element.hasAttribute('hidden') ||
      element.closest('[aria-hidden="true"]') ||
      element.closest('dialog:not([open])') ||
      (element.closest('details:not([open])') && !element.closest('summary')) ||
      element.closest('[popover]:not(:popover-open)') ||
      inactiveTabPanel
    ) {
      return false;
    }
    const style = view.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  };
  const isCoarselyAdopted = element => {
    let candidate = element;
    while (candidate && candidate !== doc.body) {
      const classes = designSystemClasses(candidate);
      if (classes.length > 0) {
        return classes.some(name => !isLayoutClass(name));
      }
      candidate = candidate.parentElement;
    }
    return false;
  };
  const nearestComponentRoot = element => {
    let candidate = element;
    while (candidate && candidate !== doc.body) {
      const classes = designSystemClasses(candidate).filter(
        name => !isLayoutClass(name),
      );
      if (classes.length > 0) {
        return {element: candidate, classes};
      }
      candidate = candidate.parentElement;
    }
    return null;
  };
  const interactiveTarget = element => {
    const root = nearestComponentRoot(element);
    return {
      tag: element.tagName.toLowerCase(),
      classes: classNames(element),
      text: (element.textContent ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 80),
      componentRootClasses: root?.classes ?? [],
      adopted:
        root != null &&
        (root.element === element ||
          root.classes.some(name => interactiveWrapperRoots.has(name))),
    };
  };

  const visibleElements = [...doc.querySelectorAll('body *')].filter(isVisible);
  const eligible = [...targets].filter(isVisible);
  const adoptionTargets = eligible.map(element => ({
    tag: element.tagName.toLowerCase(),
    classes: classNames(element),
    text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
    adopted: isCoarselyAdopted(element),
  }));
  const adoptedElementCount = adoptionTargets.filter(
    target => target.adopted,
  ).length;
  const interactiveEligible = [...interactiveTargets].filter(isVisible);
  const interactiveAdoptionTargets = interactiveEligible.map(interactiveTarget);
  const interactiveAdoptedElementCount = interactiveAdoptionTargets.filter(
    target => target.adopted,
  ).length;
  return {
    textLength: (doc.body?.innerText ?? doc.body?.textContent ?? '').trim()
      .length,
    visibleElementCount: visibleElements.length,
    interactiveEligibleElementCount: interactiveEligible.length,
    interactiveAdoptedElementCount,
    interactiveAdoptionShare:
      interactiveEligible.length === 0
        ? 0
        : interactiveAdoptedElementCount / interactiveEligible.length,
    interactiveAdoptionTargets,
    // Preserve the original ancestor-credit metric for longitudinal continuity.
    eligibleElementCount: eligible.length,
    adoptedElementCount,
    adoptionShare:
      eligible.length === 0 ? 0 : adoptedElementCount / eligible.length,
    adoptionTargets,
  };
}

export async function captureAuthoredSources(projectDir) {
  const files = [];
  await walk(projectDir, files);
  const entries = await Promise.all(
    files
      .filter(file => /\.(?:html|css|js|jsx|mjs|ts|tsx)$/.test(file))
      .map(async file => [
        path.relative(projectDir, file),
        await fsp.readFile(file, 'utf8'),
      ]),
  );
  return Object.fromEntries(entries);
}

export async function scanAuthoredSource(projectDir, baselineSources = {}) {
  const current = await captureAuthoredSources(projectDir);
  const authored = Object.entries(current).filter(
    ([relativePath, source]) => baselineSources[relativePath] !== source,
  );
  let inlineStyleAttributes = 0;
  let customPropertyOnlyStyles = 0;
  let themeDefinitionCount = 0;
  let fallbackLiteralCount = 0;
  let rawHexValues = 0;
  let rawPixelValues = 0;
  for (const [relativePath, source] of authored) {
    const uncommented = stripSourceComments(source, path.extname(relativePath));
    const styleCounts = countInlineStyles(uncommented);
    const themeAnalysis = separateThemeDefinitions(uncommented);
    const fallbackAnalysis = separateCssVariableFallbacks(
      themeAnalysis.scannableSource,
    );
    const scannableSource = fallbackAnalysis.scannableSource;
    inlineStyleAttributes += styleCounts.hardCoded;
    customPropertyOnlyStyles += styleCounts.customPropertyOnly;
    themeDefinitionCount += themeAnalysis.count;
    fallbackLiteralCount += fallbackAnalysis.fallbackLiteralCount;
    rawHexValues += (scannableSource.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
    rawPixelValues += (scannableSource.match(/\b\d+(?:\.\d+)?px\b/gi) ?? [])
      .length;
  }
  return {
    authoredFileCount: authored.length,
    inlineStyleAttributes,
    customPropertyOnlyStyles,
    themeDefinitionCount,
    fallbackLiteralCount,
    rawHexValues,
    rawPixelValues,
    hardCodedStyleCount: inlineStyleAttributes + rawHexValues + rawPixelValues,
  };
}

function separateCssVariableFallbacks(source) {
  const fallbackRanges = [];
  const pattern = /\bvar\s*\(/g;
  for (const match of source.matchAll(pattern)) {
    const open = source.indexOf('(', match.index);
    let depth = 1;
    let quote = null;
    let comma = -1;
    let end = -1;
    for (let index = open + 1; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (character === '\\') {
          index += 1;
        } else if (character === quote) {
          quote = null;
        }
        continue;
      }
      if (character === "'" || character === '"' || character === '`') {
        quote = character;
      } else if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        depth -= 1;
        if (depth === 0) {
          end = index;
          break;
        }
      } else if (character === ',' && depth === 1 && comma < 0) {
        comma = index;
      }
    }
    if (comma >= 0 && end >= 0) {
      fallbackRanges.push([comma + 1, end]);
    }
  }

  const mergedRanges = [];
  for (const range of fallbackRanges.sort(
    (left, right) => left[0] - right[0],
  )) {
    const previous = mergedRanges.at(-1);
    if (previous && range[0] <= previous[1]) {
      previous[1] = Math.max(previous[1], range[1]);
    } else {
      mergedRanges.push([...range]);
    }
  }

  let fallbackLiteralCount = 0;
  let scannableSource = '';
  let cursor = 0;
  for (const [start, end] of mergedRanges) {
    const fallback = source.slice(start, end);
    fallbackLiteralCount +=
      (fallback.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length +
      (fallback.match(/\b\d+(?:\.\d+)?px\b/gi) ?? []).length;
    scannableSource += source.slice(cursor, start);
    scannableSource += fallback.replace(/[^\n]/g, ' ');
    cursor = end;
  }
  scannableSource += source.slice(cursor);
  return {fallbackLiteralCount, scannableSource};
}

export function countInlineStyles(source) {
  let hardCoded = 0;
  let customPropertyOnly = 0;
  const pattern = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\{([\s\S]*?)\}\})/g;
  for (const match of source.matchAll(pattern)) {
    const body = match[1] ?? match[2] ?? match[3] ?? '';
    if (isCustomPropertyOnlyStyle(body)) {
      customPropertyOnly += 1;
    } else {
      hardCoded += 1;
    }
  }
  return {hardCoded, customPropertyOnly};
}

export function stripSourceComments(source, extension = '') {
  if (extension === '.html') {
    source = source.replace(
      /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
      (_match, open, body, close) =>
        `${open}${stripSourceComments(body, '.js')}${close}`,
    );
  }
  const removeLineComments = /\.(?:js|jsx|mjs|ts|tsx)$/.test(extension);
  let output = '';
  let index = 0;
  let quote = null;
  while (index < source.length) {
    if (quote) {
      const character = source[index];
      output += character;
      if (character === '\\') {
        output += source[index + 1] ?? '';
        index += 2;
        continue;
      }
      if (character === quote) {
        quote = null;
      }
      index += 1;
      continue;
    }
    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4);
      output += ' ';
      index = end < 0 ? source.length : end + 3;
      continue;
    }
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      output += ' ';
      index = end < 0 ? source.length : end + 2;
      continue;
    }
    if (removeLineComments && source.startsWith('//', index)) {
      const end = source.indexOf('\n', index + 2);
      output += end < 0 ? '' : '\n';
      index = end < 0 ? source.length : end + 1;
      continue;
    }
    const character = source[index];
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
    }
    output += character;
    index += 1;
  }
  return output;
}

function separateThemeDefinitions(source) {
  let count = 0;
  let scannableSource = source;
  const customPropertyPattern = /--[a-z0-9_-]+\s*:\s*[^;}{]+;?/gi;
  scannableSource = scannableSource.replace(customPropertyPattern, match => {
    count += 1;
    return ' '.repeat(match.length);
  });
  const strippedCalls = stripBalancedCalls(scannableSource, [
    'defineTheme',
    'createTheme',
  ]);
  count += strippedCalls.count;
  return {count, scannableSource: strippedCalls.source};
}

function stripBalancedCalls(source, names) {
  const pattern = new RegExp(`\\b(?:${names.join('|')})\\s*\\(`, 'g');
  let count = 0;
  let output = '';
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index < cursor) {
      continue;
    }
    const open = source.indexOf('(', match.index);
    let depth = 0;
    let quote = null;
    let end = open;
    for (; end < source.length; end += 1) {
      const character = source[end];
      if (quote) {
        if (character === '\\') {
          end += 1;
        } else if (character === quote) {
          quote = null;
        }
        continue;
      }
      if (character === "'" || character === '"' || character === '`') {
        quote = character;
      } else if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }
    output += source.slice(cursor, match.index);
    output += ' '.repeat(Math.max(0, end - match.index));
    cursor = end;
    count += 1;
  }
  output += source.slice(cursor);
  return {source: output, count};
}

function isCustomPropertyOnlyStyle(body) {
  const properties = [];
  for (const declaration of body.split(/[;,]\s*/)) {
    const property = declaration.match(/^\s*['"]?([^:'"]+)['"]?\s*:/)?.[1];
    if (property) {
      properties.push(property.trim());
    }
  }
  return (
    properties.length > 0 && properties.every(name => name.startsWith('--'))
  );
}

async function walk(directory, files) {
  for (const entry of await fsp.readdir(directory, {withFileTypes: true})) {
    if (['node_modules', 'dist', '.git', '.cache'].includes(entry.name)) {
      continue;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(entryPath, files);
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
}

async function startStaticServer(root) {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://localhost');
      const relative = decodeURIComponent(requestUrl.pathname).replace(
        /^\/+/,
        '',
      );
      const candidate = path.resolve(root, relative || 'index.html');
      if (!candidate.startsWith(path.resolve(root) + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const stat = await fsp.stat(candidate);
      const filePath = stat.isDirectory()
        ? path.join(candidate, 'index.html')
        : candidate;
      response.writeHead(200, {'Content-Type': mimeType(filePath)});
      fs.createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return {
    url: `http://127.0.0.1:${port}/`,
    stop: () => new Promise(resolve => server.close(resolve)),
  };
}

async function startVitePreview(projectDir) {
  const port = await reservePort();
  const logPath = path.join(projectDir, '.vite-preview.log');
  const log = fs.createWriteStream(logPath);
  const child = spawn(
    'npm',
    [
      'run',
      'preview',
      '--',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort',
    ],
    {cwd: projectDir, detached: process.platform !== 'win32'},
  );
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  const url = `http://127.0.0.1:${port}/`;
  await waitForUrl(url, child, logPath);
  return {
    url,
    stop: async () => {
      try {
        if (process.platform !== 'win32' && child.pid) {
          process.kill(-child.pid, 'SIGTERM');
        } else {
          child.kill('SIGTERM');
        }
      } catch {
        // Best-effort server cleanup.
      }
      log.end();
    },
  };
}

async function reservePort() {
  const server = http.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function waitForUrl(url, child, logPath) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode != null) {
      const logs = fs.existsSync(logPath)
        ? await fsp.readFile(logPath, 'utf8')
        : '';
      throw new Error(`Vite preview exited early:\n${logs}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // The preview may not be listening yet.
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function runBlindJudge({prompt, screenshotPath, profile}) {
  const schema = {
    type: 'object',
    properties: {
      promptFulfillment: {type: 'number', minimum: 0, maximum: 100},
      visualQuality: {type: 'number', minimum: 0, maximum: 100},
      success: {type: 'boolean'},
      notes: {type: 'string'},
      failureReasons: {type: 'array', items: {type: 'string'}},
    },
    required: [
      'promptFulfillment',
      'visualQuality',
      'success',
      'notes',
      'failureReasons',
    ],
    additionalProperties: false,
  };
  const judgePrompt = `You are a blind UI evaluator. Inspect screenshot.png in the working directory. You are not told which component system or delivery configuration produced it.

Original task:
${prompt.prompt}

Score only visible evidence:
- promptFulfillment (0-100): how completely and correctly the screenshot fulfills the requested UI and states.
- visualQuality (0-100): hierarchy, spacing, alignment, legibility, affordances, polish, and apparent accessibility.
- success: true only when the requested interface is recognizably complete and has no critical visible failure.

Do not infer implementation details, identify the system, inspect other files, or reward a particular visual style. Return the requested JSON only.`;
  const attempts = [];
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    attempts.push(
      await runBlindJudgeAttempt({
        judgePrompt,
        schema,
        screenshotPath,
        profile,
      }),
    );
    const resolved = resolveJudgeAttempts(attempts, attempt === 2);
    if (resolved) {
      return resolved;
    }
  }
  throw new Error('Judge retry resolution did not terminate');
}

export function resolveJudgeAttempts(attempts, exhausted = false) {
  const last = attempts.at(-1);
  if (!last) {
    throw new Error('Judge resolution requires at least one attempt');
  }
  if (judgeAttemptSucceeded(last)) {
    return {
      ...last,
      rejudged: attempts.length > 1,
      attempts: attempts.map(judgeAttemptReceipt),
    };
  }
  if (!exhausted) {
    return null;
  }
  return {
    configBlind: true,
    fileAccessRoot: null,
    promptFulfillment: null,
    visualQuality: null,
    success: null,
    notes: null,
    failureReasons: [],
    error: 'Judge unavailable after two failed attempts',
    judgeUnavailable: true,
    contextAudit: last.contextAudit ?? null,
    rejudged: true,
    attempts: attempts.map(judgeAttemptReceipt),
  };
}

function judgeAttemptSucceeded(attempt) {
  return (
    !attempt.error &&
    attempt.contextAudit?.passed !== false &&
    Number.isFinite(attempt.promptFulfillment) &&
    Number.isFinite(attempt.visualQuality) &&
    typeof attempt.success === 'boolean' &&
    typeof attempt.notes === 'string' &&
    Array.isArray(attempt.failureReasons)
  );
}

async function runBlindJudgeAttempt({
  judgePrompt,
  schema,
  screenshotPath,
  profile,
}) {
  if (!profile?.judge) {
    throw new Error('A judge command is required for blind evaluation.');
  }
  const privateRun = await createPrivateRunRoot('judge-');
  const anonymousScreenshot = path.join(
    privateRun.projectDir,
    'screenshot.png',
  );
  await fsp.copyFile(screenshotPath, anonymousScreenshot);

  try {
    const result = await runProfileCommand(
      profile,
      profile.judge,
      privateRun,
      {prompt: judgePrompt, schema: JSON.stringify(schema)},
      {
        timeoutMs: 5 * 60 * 1000,
        transcriptPath: privateRun.transcriptPath,
      },
    );
    const contextAudit = auditTranscript(
      result.stdout,
      result.stderr,
      profile.judge.audit,
      profile.judge.transcript,
    );
    if (result.code !== 0 || result.timedOut) {
      return {
        configBlind: true,
        contextAudit,
        failureKind: result.timedOut ? 'timeout' : 'process',
        error:
          result.stderr ||
          result.stdout ||
          `Judge exited ${result.code ?? 'without a code'}`,
      };
    }
    if (!contextAudit.passed) {
      return {
        configBlind: true,
        contextAudit,
        failureKind: 'context-audit',
        error: 'Judge context audit failed',
      };
    }
    let parsed;
    try {
      parsed = parseStructuredOutput(result.stdout, profile.judge.resultPath);
      assertValidJudgment(parsed);
    } catch (error) {
      return {
        configBlind: true,
        contextAudit,
        failureKind: 'invalid-output',
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return {
      configBlind: true,
      fileAccessRoot: profile.sandbox.projectDir,
      contextAudit,
      ...parsed,
      durationMs: result.durationMs,
    };
  } catch (error) {
    return {
      configBlind: true,
      failureKind: 'process',
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await fsp.rm(privateRun.root, {recursive: true, force: true});
  }
}

function judgeAttemptReceipt(judgment, index) {
  return {
    attempt: index + 1,
    contextAudit: judgment.contextAudit ?? null,
    promptFulfillment: judgment.promptFulfillment ?? null,
    visualQuality: judgment.visualQuality ?? null,
    success: judgment.success ?? null,
    durationMs: judgment.durationMs ?? null,
    failureKind: judgment.failureKind ?? null,
    error: judgment.error ?? null,
  };
}

function parseStructuredOutput(text, resultPath) {
  let outer;
  try {
    outer = JSON.parse(text);
  } catch {
    const records = text
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    outer = records.at(-1);
  }
  const candidate = resultPath ? readResultPath(outer, resultPath) : outer;
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    return candidate;
  }
  throw new Error('Judge returned no structured result object');
}

function readResultPath(value, dottedPath) {
  return dottedPath
    .split('.')
    .reduce(
      (current, part) =>
        current && typeof current === 'object' ? current[part] : undefined,
      value,
    );
}

function assertValidJudgment(value) {
  if (
    !Number.isFinite(value.promptFulfillment) ||
    value.promptFulfillment < 0 ||
    value.promptFulfillment > 100 ||
    !Number.isFinite(value.visualQuality) ||
    value.visualQuality < 0 ||
    value.visualQuality > 100 ||
    typeof value.success !== 'boolean' ||
    typeof value.notes !== 'string' ||
    !Array.isArray(value.failureReasons) ||
    !value.failureReasons.every(reason => typeof reason === 'string')
  ) {
    throw new Error('Judge result did not match the required score schema');
  }
}

function commandReceipt(command) {
  return {
    passed: command.code === 0,
    code: command.code,
    timedOut: command.timedOut,
    durationMs: command.durationMs,
    stdout: command.stdout,
    stderr: command.stderr,
  };
}

function typecheckReceipt(command) {
  if (!command) {
    return null;
  }
  const output = `${command.stdout}\n${command.stderr}`;
  return {
    ...commandReceipt(command),
    errorCount: (output.match(/\berror TS\d+:/g) ?? []).length,
  };
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.mjs': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    }[extension] ?? 'application/octet-stream'
  );
}
