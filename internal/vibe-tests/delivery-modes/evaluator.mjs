// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global URL, document, fetch, process, setTimeout, window */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import {AxeBuilder} from '@axe-core/playwright';
import {chromium} from 'playwright';
import {
  auditAgentContext,
  createPrivateRunRoot,
  runCommand,
  runIsolatedCommand,
} from './process.mjs';

const fsp = fs.promises;

export async function evaluateRun({
  config,
  projectDir,
  prompt,
  screenshotPath,
  baselineSources,
  skipJudge = false,
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

    const renderMetrics = await page.evaluate(measureAdoptionInDocument);
    const axe = await new AxeBuilder({page}).analyze();
    await page.screenshot({path: screenshotPath, fullPage: true});

    const nonBlank =
      renderMetrics.textLength >= 20 && renderMetrics.visibleElementCount >= 3;
    const render = {
      ...renderMetrics,
      nonBlank,
      consoleErrors,
      pageErrors,
      passed: nonBlank && consoleErrors.length === 0 && pageErrors.length === 0,
      url: server.url,
    };
    if (!render.passed) {
      render.adoptionShare = 0;
      render.adoptedElementCount = 0;
    }
    const judge = !render.passed
      ? zeroJudgment('Render failed, was blank, or emitted runtime errors')
      : skipJudge
        ? {skipped: true}
        : await runBlindJudge({prompt, screenshotPath});

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

export function measureAdoptionInDocument(assumeVisible = false) {
  const doc = document;
  const view = doc.defaultView ?? window;
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

  const hasDesignSystemClass = element =>
    (element.getAttribute('class') ?? '')
      .split(/\s+/)
      .some(name => name.startsWith('astryx-') || name.startsWith('ax-'));
  const hasOnlyContainerClass = element => {
    const classes = (element.getAttribute('class') ?? '').split(/\s+/);
    return classes.some(name =>
      /^(?:astryx|ax)-(?:stack|vstack|hstack|grid|layout|center|section|card|dialog|banner|app-shell|top-nav|side-nav|toolbar|form-layout)(?:--|__|$)/.test(
        name,
      ),
    );
  };
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
    if (hasDesignSystemClass(element)) {
      return (
        element.matches(containerSelector) || !hasOnlyContainerClass(element)
      );
    }
    let ancestor = element.parentElement;
    while (ancestor && ancestor !== doc.body) {
      if (hasDesignSystemClass(ancestor)) {
        return !hasOnlyContainerClass(ancestor);
      }
      ancestor = ancestor.parentElement;
    }
    return false;
  };

  const visibleElements = [...doc.querySelectorAll('body *')].filter(isVisible);
  const eligible = [...targets].filter(isVisible);
  const adopted = eligible.filter(isAdopted);
  return {
    textLength: (doc.body?.innerText ?? doc.body?.textContent ?? '').trim()
      .length,
    visibleElementCount: visibleElements.length,
    eligibleElementCount: eligible.length,
    adoptedElementCount: adopted.length,
    adoptionShare: eligible.length === 0 ? 0 : adopted.length / eligible.length,
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
  let rawHexValues = 0;
  let rawPixelValues = 0;
  for (const [, source] of authored) {
    const styleCounts = countInlineStyles(source);
    const scannableSource = stripCustomPropertyOnlyInlineStyles(source);
    inlineStyleAttributes += styleCounts.hardCoded;
    customPropertyOnlyStyles += styleCounts.customPropertyOnly;
    rawHexValues += (scannableSource.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
    rawPixelValues += (scannableSource.match(/\b\d+(?:\.\d+)?px\b/gi) ?? [])
      .length;
  }
  return {
    authoredFileCount: authored.length,
    inlineStyleAttributes,
    customPropertyOnlyStyles,
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

function stripCustomPropertyOnlyInlineStyles(source) {
  const pattern = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\{([\s\S]*?)\}\})/g;
  return source.replace(pattern, (match, double, single, object) => {
    const body = double ?? single ?? object ?? '';
    return isCustomPropertyOnlyStyle(body) ? '' : match;
  });
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

async function runBlindJudge({prompt, screenshotPath}) {
  const privateRun = await createPrivateRunRoot('judge-');
  const anonymousScreenshot = path.join(
    privateRun.projectDir,
    'screenshot.png',
  );
  await fsp.copyFile(screenshotPath, anonymousScreenshot);
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
  const judgePrompt = `You are a blind UI evaluator. Use the Read tool to inspect screenshot.png. You are not told which component system or delivery configuration produced it.

Original task:
${prompt.prompt}

Score only visible evidence:
- promptFulfillment (0-100): how completely and correctly the screenshot fulfills the requested UI and states.
- visualQuality (0-100): hierarchy, spacing, alignment, legibility, affordances, polish, and apparent accessibility.
- success: true only when the requested interface is recognizably complete and has no critical visible failure.

Do not infer implementation details, identify the system, inspect other files, or reward a particular visual style. Return the requested JSON only.`;

  try {
    const result = await runIsolatedCommand(
      privateRun.root,
      '/usr/local/bin/claude',
      [
        '--safe-mode',
        '--strict-mcp-config',
        '--mcp-config',
        `${privateRun.sandboxProjectDir}/../empty-mcp.json`,
        '--no-session-persistence',
        '--permission-mode',
        'bypassPermissions',
        '--dangerously-skip-permissions',
        '--disable-slash-commands',
        '--tools',
        'Read',
        '-p',
        '--output-format',
        'stream-json',
        '--verbose',
        '--json-schema',
        JSON.stringify(schema),
      ],
      {
        input: judgePrompt,
        timeoutMs: 5 * 60 * 1000,
        transcriptPath: privateRun.transcriptPath,
      },
    );
    if (result.code !== 0) {
      return {
        configBlind: true,
        error: result.stderr || result.stdout || `Judge exited ${result.code}`,
      };
    }
    const parsed = parseClaudeStructuredOutput(result.stdout);
    const contextAudit = auditAgentContext(
      'claude',
      result.stdout,
      result.stderr,
    );
    return {
      configBlind: true,
      fileAccessRoot: '/mnt/run/project',
      contextAudit,
      ...parsed,
      durationMs: result.durationMs,
    };
  } catch (error) {
    return {
      configBlind: true,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await fsp.rm(privateRun.root, {recursive: true, force: true});
  }
}

function parseClaudeStructuredOutput(text) {
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
    outer =
      records.findLast(record => record.type === 'result') ?? records.at(-1);
  }
  const candidate = outer?.structured_output ?? outer?.result ?? outer;
  if (candidate && typeof candidate === 'object') {
    return candidate;
  }
  const match = String(candidate).match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Judge returned no JSON object');
  }
  return JSON.parse(match[0]);
}

function commandReceipt(command) {
  return {
    passed: command.code === 0,
    code: command.code,
    timedOut: command.timedOut,
    durationMs: command.durationMs,
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
