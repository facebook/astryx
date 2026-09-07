#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @description Runs listed stories' play functions in real Chromium and fails when one throws
 * @input --storybook-dir <path> [--port <n>]
 * @output One line per story; exit 1 if a play function threw, the story errored, or it never finished
 *
 * A story's play function is the only place a geometry assertion can live —
 * getBoundingClientRect needs a real layout engine — but on its own it is
 * observed by nothing that can fail: Vitest collects only `*.test.*` files,
 * and the visual gate loads each story waiting for rendered DOM without
 * awaiting or inspecting the play result. A broken play assertion therefore
 * leaves every required check green (PR #3938 round 3).
 *
 * This guard closes that gap. It serves the built Storybook, loads each
 * listed story's iframe in Chromium, and listens on the preview channel for
 * the play outcome: `storyRendered` only fires after `play` resolves, and
 * any thrown assertion surfaces as `playFunctionThrewException` (or one of
 * its sibling error events). No outcome within the timeout also fails —
 * a story that cannot boot must not pass by silence.
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const port = Number(getArg('port') || 6010);

// Stories whose play assertions are load-bearing. Adding a story here is the
// whole cost of promoting its play function into required CI.
const TARGETS = [
  {
    component: 'TabList',
    story: 'core-tablist--full-bleed-geometry',
    guards:
      'isFullBleed strip/label geometry incl. clamp far side, and the real ' +
      'LayoutHeader paddingBlockEnd -> TabList isFullBleed dock (#2622)',
  },
  {
    component: 'Selector',
    story: 'core-selector--keyboard-bottom-sheet-policy',
    guards:
      'fine-pointer bottom sheet stays keyboard operable: Enter opens the ' +
      'real modal dialog, focus enters the listbox, arrows move the active ' +
      'option, Escape closes through the real exit transition and returns ' +
      'focus to the trigger. The combination is long-standing (plain ' +
      'presentation="bottom-sheet"); what this adds is real-browser evidence ' +
      'for it, since jsdom stubs showModal and never runs the exit',
  },
  {
    component: 'DateInput',
    story: 'core-dateinput--adaptations-fine-bottom-sheet',
    guards:
      'a policy-pinned bottom sheet on a fine pointer stays keyboard ' +
      'operable: Enter opens a genuinely modal <dialog> (:modal, which only ' +
      'showModal() can make true), focus moves into the sheet, and Escape ' +
      'closes it through the real exit transition and returns focus to the ' +
      'field. jsdom stubs showModal and never runs that exit, so the unit ' +
      'suite can only assert against a simulation of this surface',
  },
  {
    component: 'DateInput',
    story: 'core-dateinput--adaptations-latched-while-in-use',
    guards:
      'the adaptations latch survives a REAL browser focus move: after the ' +
      "policy flips under a focused field, the browser's own focusout/" +
      'focusin pair between the input and its calendar toggle must not ' +
      'release it — the tree stays mounted, the entry survives and the click ' +
      'lands — and the pending surface arrives once the field goes idle. ' +
      'jsdom can model that sequence but never dispatch one',
  },
];

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function createServer(dir, listenPort) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path
        .join(dir, req.url === '/' ? 'index.html' : req.url)
        .split('?')[0];

      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(dir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(resolved, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type':
            CONTENT_TYPES[path.extname(resolved)] || 'text/plain',
        });
        res.end(data);
      });
    });

    server.listen(listenPort, () => resolve(server));
  });
}

// Records the story's play outcome from the preview channel. `storyRendered`
// is emitted only after the play function resolves; every failure mode has
// its own event. Attached before any preview code runs so no event is missed.
function recordStoryOutcome() {
  window.__storyOutcome = { done: false, errors: [] };
  const ERROR_EVENTS = [
    'playFunctionThrewException',
    'unhandledErrorsWhilePlaying',
    'storyThrewException',
    'storyErrored',
    'storyMissing',
  ];
  const describe = (payload) => {
    if (payload == null) return '';
    if (typeof payload === 'string') return payload;
    return [payload.name, payload.title, payload.message, payload.description]
      .filter(Boolean)
      .join(': ');
  };
  const attach = () => {
    const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (!channel) {
      setTimeout(attach, 50);
      return;
    }
    channel.on('storyRendered', () => {
      window.__storyOutcome.done = true;
    });
    for (const event of ERROR_EVENTS) {
      channel.on(event, (payload) => {
        window.__storyOutcome.errors.push(
          `${event}${describe(payload) ? ` — ${describe(payload)}` : ''}`
        );
        window.__storyOutcome.done = true;
      });
    }
  };
  attach();
}

async function probe(page, target) {
  await page.addInitScript(recordStoryOutcome);
  await page.goto(
    `http://localhost:${port}/iframe.html?id=${target.story}&viewMode=story`,
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForFunction(
    () => window.__storyOutcome && window.__storyOutcome.done === true,
    null,
    { timeout: 30000 }
  );
  return page.evaluate(() => window.__storyOutcome);
}

async function run() {
  const dir = path.resolve(process.cwd(), storybookDir);
  if (!fs.existsSync(dir)) {
    console.error(`Storybook build not found at ${dir}`);
    return 1;
  }

  const server = await createServer(dir, port);
  const browser = await chromium.launch();
  let failures = 0;

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });

    for (const target of TARGETS) {
      const page = await context.newPage();
      try {
        const outcome = await probe(page, target);
        if (outcome.errors.length > 0) {
          failures++;
          console.error(
            `✗ ${target.component} (${target.story}):\n    ${outcome.errors.join('\n    ')}`
          );
        } else {
          console.log(
            `✓ ${target.component} (${target.story}): play passed — ${target.guards}`
          );
        }
      } catch (e) {
        failures++;
        console.error(
          `✗ ${target.component} (${target.story}): no play outcome — ${e.message}`
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures > 0) {
    console.error(`\nFailing: ${failures} story play function(s) did not pass.`);
    return 1;
  }
  console.log('\nAll story play guards passed.');
  return 0;
}

run()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((e) => {
    console.error('Story play guard failed:', e);
    process.exit(1);
  });
