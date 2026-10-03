// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global URL, document, fetch, process, setTimeout, window */

import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import {AxeBuilder} from '@axe-core/playwright';
import {chromium} from 'playwright';
import {runCommand} from './process.mjs';

const fsp = fs.promises;

export async function evaluateRun({
  config,
  projectDir,
  prompt,
  screenshotPath,
  judgeRoot,
  skipJudge = false,
}) {
  const build =
    config === 'react-build'
      ? await runCommand('npm', ['run', 'build'], {
          cwd: projectDir,
          timeoutMs: 5 * 60 * 1000,
        })
      : {code: 0, stdout: '', stderr: '', durationMs: 0, timedOut: false};

  if (build.code !== 0) {
    return {
      build: commandReceipt(build),
      render: {
        passed: false,
        nonBlank: false,
        consoleErrors: [],
        pageErrors: [],
        error: build.stderr || build.stdout || 'Build failed',
      },
      source: await scanAuthoredSource(projectDir),
      accessibility: {violations: [], violationCount: null},
      judge: {skipped: true, error: 'Build failed'},
    };
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

    const renderMetrics = await page.evaluate(() => {
      const body = document.body;
      const textLength = (body?.innerText ?? '').trim().length;
      const visibleElements = [...document.querySelectorAll('body *')].filter(
        element => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return (
            rect.width > 1 &&
            rect.height > 1 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          );
        },
      );
      const eligible = [
        ...document.querySelectorAll(
          'button,input,select,textarea,h1,h2,h3,h4,h5,h6,main,section,article,nav,header,footer,form,table,[role="dialog"]',
        ),
      ];
      const adopted = eligible.filter(element => {
        const classes = element.getAttribute('class') ?? '';
        return classes
          .split(/\s+/)
          .some(name => name.startsWith('astryx-') || name.startsWith('ax-'));
      });
      return {
        textLength,
        visibleElementCount: visibleElements.length,
        eligibleElementCount: eligible.length,
        adoptedElementCount: adopted.length,
        adoptionShare:
          eligible.length === 0 ? 0 : adopted.length / eligible.length,
      };
    });

    const axe = await new AxeBuilder({page}).analyze();
    await page.screenshot({path: screenshotPath, fullPage: true});

    const source = await scanAuthoredSource(projectDir);
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
    const judge = skipJudge
      ? {skipped: true}
      : await runBlindJudge({prompt, screenshotPath, judgeRoot});

    return {
      build: commandReceipt(build),
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
    return {
      build: commandReceipt(build),
      render: {
        passed: false,
        nonBlank: false,
        consoleErrors: [],
        pageErrors: [],
        error:
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error),
      },
      source: await scanAuthoredSource(projectDir),
      accessibility: {violations: [], violationCount: null},
      judge: {skipped: true, error: 'Render failed'},
    };
  } finally {
    await browser?.close();
    await server.stop();
  }
}

export async function scanAuthoredSource(projectDir) {
  const files = [];
  await walk(projectDir, files);
  const authored = files.filter(file =>
    /\.(?:html|css|js|jsx|mjs|ts|tsx)$/.test(file),
  );
  let inlineStyleAttributes = 0;
  let rawHexValues = 0;
  let rawPixelValues = 0;
  for (const file of authored) {
    const source = await fsp.readFile(file, 'utf8');
    inlineStyleAttributes += (
      source.match(/\bstyle\s*=\s*(?:["'{]|\{\{)/g) ?? []
    ).length;
    rawHexValues += (source.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
    rawPixelValues += (source.match(/\b\d+(?:\.\d+)?px\b/gi) ?? []).length;
  }
  return {
    authoredFileCount: authored.length,
    inlineStyleAttributes,
    rawHexValues,
    rawPixelValues,
    hardCodedStyleCount: inlineStyleAttributes + rawHexValues + rawPixelValues,
  };
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

async function runBlindJudge({prompt, screenshotPath, judgeRoot}) {
  const anonymousDir = path.join(judgeRoot, randomUUID());
  await fsp.mkdir(anonymousDir, {recursive: true});
  await fsp.copyFile(screenshotPath, path.join(anonymousDir, 'screenshot.png'));
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
    const result = await runCommand(
      'claude',
      [
        '--safe-mode',
        '--no-session-persistence',
        '--permission-mode',
        'dontAsk',
        '--tools',
        'Read',
        '-p',
        '--output-format',
        'json',
        '--json-schema',
        JSON.stringify(schema),
      ],
      {cwd: anonymousDir, input: judgePrompt, timeoutMs: 5 * 60 * 1000},
    );
    if (result.code !== 0) {
      return {
        configBlind: true,
        error: result.stderr || result.stdout || `Judge exited ${result.code}`,
      };
    }
    const parsed = parseClaudeStructuredOutput(result.stdout);
    return {
      configBlind: true,
      ...parsed,
      durationMs: result.durationMs,
    };
  } catch (error) {
    return {
      configBlind: true,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await fsp.rm(anonymousDir, {recursive: true, force: true});
  }
}

function parseClaudeStructuredOutput(text) {
  const outer = JSON.parse(text);
  const candidate = outer.structured_output ?? outer.result ?? outer;
  if (typeof candidate === 'object') {
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
