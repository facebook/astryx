// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global URL, document, fetch, process, setTimeout, window */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import {AxeBuilder} from '@axe-core/playwright';
import {chromium} from 'playwright';
import {MAX_DECLARED_STATES, STATE_MANIFEST_FILE} from './constants.mjs';
import {
  auditTranscript,
  createPrivateRunRoot,
  runCommand,
  runProfileCommand,
} from './process.mjs';

const fsp = fs.promises;
const VIEWPORT = {width: 1440, height: 900};
const STATE_NAME_PATTERN = /^[a-z0-9][a-z0-9 _-]{0,31}$/i;

export async function readDeclaredStates(projectDir) {
  const manifestPath = path.join(projectDir, STATE_MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  let manifest;
  try {
    manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf8'));
  } catch (error) {
    throw new Error(
      `${STATE_MANIFEST_FILE} must contain valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      {cause: error},
    );
  }
  if (
    !manifest ||
    typeof manifest !== 'object' ||
    Array.isArray(manifest) ||
    !Array.isArray(manifest.states)
  ) {
    throw new Error(
      `${STATE_MANIFEST_FILE} must be an object with a states array.`,
    );
  }
  const extraKeys = Object.keys(manifest).filter(key => key !== 'states');
  if (extraKeys.length > 0) {
    throw new Error(
      `${STATE_MANIFEST_FILE} has unsupported keys: ${extraKeys.join(', ')}.`,
    );
  }
  if (manifest.states.length > MAX_DECLARED_STATES) {
    throw new Error(
      `${STATE_MANIFEST_FILE} may declare at most ${MAX_DECLARED_STATES} states.`,
    );
  }

  const names = new Set();
  return manifest.states.map((state, index) => {
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      throw new Error(`State ${index + 1} must be an object.`);
    }
    const stateExtraKeys = Object.keys(state).filter(
      key => key !== 'name' && key !== 'url',
    );
    if (stateExtraKeys.length > 0) {
      throw new Error(
        `State ${index + 1} has unsupported keys: ${stateExtraKeys.join(', ')}.`,
      );
    }
    if (
      typeof state.name !== 'string' ||
      !STATE_NAME_PATTERN.test(state.name)
    ) {
      throw new Error(
        `State ${index + 1} name must be 1-32 letters, numbers, spaces, underscores, or hyphens.`,
      );
    }
    const normalizedName = state.name.toLowerCase();
    if (normalizedName === 'default' || names.has(normalizedName)) {
      throw new Error(`State names must be unique and may not be "default".`);
    }
    names.add(normalizedName);
    if (
      typeof state.url !== 'string' ||
      !(state.url.startsWith('?') || state.url.startsWith('#'))
    ) {
      throw new Error(
        `State ${state.name} url must start with ? or # and stay on the main page.`,
      );
    }
    return {name: state.name, url: state.url};
  });
}

export function resolveDeclaredStateUrl(baseUrl, suffix) {
  const base = new URL(baseUrl);
  const resolved = new URL(suffix, base);
  if (resolved.origin !== base.origin || resolved.pathname !== base.pathname) {
    throw new Error('Declared states must stay on the main page.');
  }
  return resolved.href;
}

export async function evaluateRun({
  config,
  projectDir,
  prompt,
  screenshotPath,
  baselineSources,
  skipJudge = false,
  verifyStarterTyping = false,
  judgeProfile,
  browserType = chromium,
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

  await fsp.mkdir(path.dirname(screenshotPath), {recursive: true});
  let source = emptySourceMetrics();
  let server;
  let declaredStates;
  try {
    source = await scanAuthoredSource(projectDir, baselineSources);
    if (build.code !== 0) {
      return failedEvaluation({
        build,
        typecheck,
        source,
        reason: build.stderr || build.stdout || 'Build failed',
      });
    }
    declaredStates = await readDeclaredStates(projectDir);
    server =
      config === 'react-build'
        ? await startVitePreview(projectDir)
        : await startStaticServer(projectDir);
  } catch (error) {
    return failedEvaluation({
      build,
      typecheck,
      source,
      reason:
        error instanceof Error ? (error.stack ?? error.message) : String(error),
    });
  }

  let browser;
  try {
    browser = await browserType.launch({headless: true});
  } catch (error) {
    await server.stop();
    throw error;
  }

  try {
    const context = await browser.newContext({viewport: VIEWPORT});
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

    const renderMetrics = await page.evaluate(measureAdoptionInDocument);
    const axe = await new AxeBuilder({page}).analyze();
    await page.screenshot({path: screenshotPath, fullPage: true});

    const nonBlank =
      renderMetrics.textLength >= 20 && renderMetrics.visibleElementCount >= 3;
    const defaultPassed =
      nonBlank &&
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      (starterTyping?.passed ?? true);
    const stateCaptures = [
      {
        name: 'default',
        target: '',
        screenshotPath,
        nonBlank,
        consoleErrors,
        pageErrors,
        passed: defaultPassed,
      },
    ];
    for (const [index, state] of declaredStates.entries()) {
      stateCaptures.push(
        await captureDeclaredState({
          browser,
          baseUrl: server.url,
          state,
          screenshotPath: path.join(
            path.dirname(screenshotPath),
            `${path.basename(screenshotPath, path.extname(screenshotPath))}-state-${index + 1}.png`,
          ),
        }),
      );
    }

    const render = {
      ...renderMetrics,
      nonBlank,
      consoleErrors,
      pageErrors,
      starterTyping,
      passed: stateCaptures.every(capture => capture.passed),
      url: server.url,
      states: stateCaptures.map(stateCaptureReceipt),
    };
    if (!render.passed) {
      render.adoptionShare = 0;
      render.adoptedElementCount = 0;
    }
    const judge = !render.passed
      ? zeroJudgment(
          'Render failed, a declared state left the original document, was blank, or emitted runtime errors',
        )
      : skipJudge
        ? {skipped: true, stateEvidence: []}
        : await runBlindJudge({
            prompt,
            screenshots: stateCaptures.filter(
              capture =>
                capture.passed && fs.existsSync(capture.screenshotPath),
            ),
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
      stateCaptures,
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
    await browser.close();
    await server.stop();
  }
}

export function assessDeclaredStateNavigation({
  baseUrl,
  finalUrl,
  documentRequests,
  topLevelNavigations,
}) {
  const base = new URL(baseUrl);
  const final = new URL(finalUrl);
  const violations = [];
  if (final.origin !== base.origin || final.pathname !== base.pathname) {
    violations.push('final URL left the original document path');
  }
  if (topLevelNavigations.length > 1) {
    violations.push('top-level navigation occurred after the initial load');
  }
  if (documentRequests.length > 1) {
    violations.push('an additional HTML document was requested');
  }
  return {
    passed: violations.length === 0,
    error: violations.length > 0 ? violations.join('; ') : null,
    documentRequestCount: documentRequests.length,
    topLevelNavigationCount: topLevelNavigations.length,
  };
}

async function captureDeclaredState({browser, baseUrl, state, screenshotPath}) {
  const context = await browser.newContext({viewport: VIEWPORT});
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const documentRequests = [];
  const topLevelNavigations = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => {
    if (request.resourceType() === 'document') {
      documentRequests.push(request.url());
    }
  });
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      topLevelNavigations.push(frame.url());
    }
  });

  try {
    const url = resolveDeclaredStateUrl(baseUrl, state.url);
    await page.goto(url, {waitUntil: 'networkidle', timeout: 90_000});
    await page.waitForTimeout(1500);
    const metrics = await page.evaluate(measureAdoptionInDocument);
    await page.screenshot({path: screenshotPath, fullPage: true});
    const nonBlank =
      metrics.textLength >= 20 && metrics.visibleElementCount >= 3;
    const navigation = assessDeclaredStateNavigation({
      baseUrl,
      finalUrl: page.url(),
      documentRequests,
      topLevelNavigations,
    });
    return {
      name: state.name,
      target: state.url,
      screenshotPath,
      nonBlank,
      consoleErrors,
      pageErrors,
      documentRequestCount: navigation.documentRequestCount,
      topLevelNavigationCount: navigation.topLevelNavigationCount,
      passed:
        nonBlank &&
        consoleErrors.length === 0 &&
        pageErrors.length === 0 &&
        navigation.passed,
      error: navigation.error,
    };
  } catch (error) {
    return {
      name: state.name,
      target: state.url,
      screenshotPath,
      nonBlank: false,
      consoleErrors,
      pageErrors,
      documentRequestCount: documentRequests.length,
      topLevelNavigationCount: topLevelNavigations.length,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await context.close();
  }
}

function stateCaptureReceipt(capture) {
  return {
    name: capture.name,
    target: capture.target,
    nonBlank: capture.nonBlank,
    consoleErrors: capture.consoleErrors,
    pageErrors: capture.pageErrors,
    documentRequestCount: capture.documentRequestCount ?? 1,
    topLevelNavigationCount: capture.topLevelNavigationCount ?? 1,
    passed: capture.passed,
    screenshotCaptured: fs.existsSync(capture.screenshotPath),
    error: capture.error ?? null,
  };
}

function emptySourceMetrics() {
  return {
    authoredFileCount: 0,
    inlineStyleAttributes: 0,
    customPropertyOnlyStyles: 0,
    themeDefinitionCount: 0,
    rawHexValues: 0,
    rawPixelValues: 0,
    hardCodedStyleCount: 0,
  };
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
    stateEvidence: [],
    automaticFailure: true,
  };
}

export function measureAdoptionInDocument(assumeVisible = false) {
  const doc = document;
  const view = doc.defaultView ?? window;
  // These layout-only families come from the stable classes emitted by the
  // React Layout/Stack/etc. sources and Vanilla Layout.css/Stack.css. All
  // other Astryx classes, including BEM or hyphenated component parts, are
  // component classes that may confer adoption.
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
  const semanticSelector = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'table',
    'dialog',
    'nav',
    '[role="button"]',
    '[role="link"]',
    '[role="textbox"]',
    '[role="combobox"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="table"]',
    '[role="dialog"]',
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
  const isAdopted = element => {
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

  const visibleElements = [...doc.querySelectorAll('body *')].filter(isVisible);
  const eligible = [...targets].filter(isVisible);
  const adoptionTargets = eligible.map(element => ({
    tag: element.tagName.toLowerCase(),
    classes: classNames(element),
    text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
    adopted: isAdopted(element),
  }));
  const adoptedElementCount = adoptionTargets.filter(
    target => target.adopted,
  ).length;
  return {
    textLength: (doc.body?.innerText ?? doc.body?.textContent ?? '').trim()
      .length,
    visibleElementCount: visibleElements.length,
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
  let rawHexValues = 0;
  let rawPixelValues = 0;
  for (const [relativePath, source] of authored) {
    const uncommented = stripSourceComments(source, path.extname(relativePath));
    const styleCounts = countInlineStyles(uncommented);
    const themeAnalysis = separateThemeDefinitions(uncommented);
    const scannableSource = themeAnalysis.scannableSource;
    inlineStyleAttributes += styleCounts.hardCoded;
    customPropertyOnlyStyles += styleCounts.customPropertyOnly;
    themeDefinitionCount += themeAnalysis.count;
    rawHexValues += (scannableSource.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
    rawPixelValues += (scannableSource.match(/\b\d+(?:\.\d+)?px\b/gi) ?? [])
      .length;
  }
  return {
    authoredFileCount: authored.length,
    inlineStyleAttributes,
    customPropertyOnlyStyles,
    themeDefinitionCount,
    rawHexValues,
    rawPixelValues,
    hardCodedStyleCount: inlineStyleAttributes + rawHexValues + rawPixelValues,
  };
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

export async function runBlindJudge({prompt, screenshots, profile}) {
  const schema = {
    type: 'object',
    properties: {
      promptFulfillment: {type: 'number', minimum: 0, maximum: 100},
      visualQuality: {type: 'number', minimum: 0, maximum: 100},
      success: {type: 'boolean'},
      notes: {type: 'string'},
      failureReasons: {type: 'array', items: {type: 'string'}},
      stateEvidence: {
        type: 'array',
        minItems: screenshots.length,
        maxItems: screenshots.length,
        items: {
          type: 'object',
          properties: {
            state: {type: 'string', enum: screenshots.map(value => value.name)},
            visibleEvidence: {type: 'string'},
            concerns: {type: 'array', items: {type: 'string'}},
          },
          required: ['state', 'visibleEvidence', 'concerns'],
          additionalProperties: false,
        },
      },
    },
    required: [
      'promptFulfillment',
      'visualQuality',
      'success',
      'notes',
      'failureReasons',
      'stateEvidence',
    ],
    additionalProperties: false,
  };
  const anonymousScreenshots = screenshots.map((screenshot, index) => ({
    ...screenshot,
    fileName: `state-${String(index).padStart(2, '0')}.png`,
  }));
  const judgePrompt = buildBlindJudgePrompt(prompt, anonymousScreenshots);
  const attempts = [];
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    attempts.push(
      await runBlindJudgeAttempt({
        judgePrompt,
        schema,
        screenshots: anonymousScreenshots,
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

export function buildBlindJudgePrompt(prompt, screenshots) {
  const screenshotList = screenshots
    .map(screenshot => `- ${screenshot.name}: ${screenshot.fileName}`)
    .join('\n');
  return `You are a blind UI evaluator. Inspect every supplied screenshot in the working directory. You are not told which component system or delivery configuration produced them.

Screenshots, all captured from fresh loads at the same viewport:
${screenshotList}

Original task:
${prompt.prompt}

Score only visible evidence across the complete screenshot set:
- promptFulfillment (0-100): how completely and correctly the screenshots fulfill the requested UI and states.
- visualQuality (0-100): hierarchy, spacing, alignment, legibility, affordances, polish, and apparent accessibility.
- success: true only when the requested interface is recognizably complete and has no critical visible failure.
- stateEvidence: one entry per screenshot, in the supplied order, naming visible evidence and concerns for that state.

State labels are navigation labels, not evidence. Do not infer features from a label that are not visible in its screenshot. Do not infer implementation details, identify the system, inspect other files, or reward a particular visual style. Return the requested JSON only.`;
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
    stateEvidence: [],
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
    Array.isArray(attempt.failureReasons) &&
    Array.isArray(attempt.stateEvidence)
  );
}

async function runBlindJudgeAttempt({
  judgePrompt,
  schema,
  screenshots,
  profile,
}) {
  if (!profile?.judge) {
    throw new Error('A judge command is required for blind evaluation.');
  }
  const privateRun = await createPrivateRunRoot('judge-');
  await Promise.all(
    screenshots.map(screenshot =>
      fsp.copyFile(
        screenshot.screenshotPath,
        path.join(privateRun.projectDir, screenshot.fileName),
      ),
    ),
  );

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
      assertValidJudgment(
        parsed,
        screenshots.map(screenshot => screenshot.name),
      );
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

function assertValidJudgment(value, expectedStateNames) {
  const stateEvidenceValid =
    Array.isArray(value.stateEvidence) &&
    value.stateEvidence.length === expectedStateNames.length &&
    value.stateEvidence.every(
      (evidence, index) =>
        evidence &&
        typeof evidence === 'object' &&
        evidence.state === expectedStateNames[index] &&
        typeof evidence.visibleEvidence === 'string' &&
        Array.isArray(evidence.concerns) &&
        evidence.concerns.every(concern => typeof concern === 'string'),
    );
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
    !value.failureReasons.every(reason => typeof reason === 'string') ||
    !stateEvidenceValid
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
