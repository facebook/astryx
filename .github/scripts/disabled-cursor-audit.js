#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Asserts no disabled element answers the pointer with an interactive cursor
 * @input --storybook-dir <path> [--components <csv>] [--output <file>]
 *   [--concurrency <n>] [--port <n>]
 * @output JSON report of violations; exit 1 if any disabled element shows a
 *   cursor other than `default`
 *
 * The cursor is the only affordance a pointer user gets before they commit to
 * a click. A disabled control that answers with `pointer` promises a click it
 * will not honour, and one that answers with `default` says nothing at all —
 * the user learns the control is dead only by clicking it and watching
 * nothing happen.
 *
 * jsdom has no cursor and no hit testing, so the unit suite cannot see any of
 * this. Chromium can. For every disabled element in every story we hit-test
 * the points a pointer would actually land on and read the computed `cursor`
 * of the element that answers — which is the element the pointer hits, not
 * necessarily the disabled one: `cursor` inherits, so a child that declares
 * its own wins under the pointer, and a subtree behind `pointer-events: none`
 * hands the question to an ancestor.
 *
 * The expected cursor is `default`, not `not-allowed`. A disabled control
 * sealed behind `pointer-events: none` is never hit-tested, so it shows
 * whatever its ancestor shows and no declaration on it can change that — 75
 * of the 635 disabled elements in the story set are sealed that way. One
 * cursor everywhere beats a stronger one only half the library can paint, and
 * the disabled state already carries its own visual treatment.
 *
 * The gate is zero-tolerance and has no baseline: `default` on a disabled
 * control is never wrong, so there is nothing to grandfather. What it does
 * skip is an element nothing can point at — no box, or covered by something
 * else at every sample point — because a cursor nobody can reach is not a
 * defect a user can see. Elements sealed behind `pointer-events: none` are
 * counted and reported separately: the pointer lands on an ancestor there, so
 * the value is a property of the surrounding layout rather than the control,
 * and holding a component to it would be holding it to its consumer's markup.
 */

const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

// ---------------------------------------------------------------------------
// pure logic (exported for the unit test)
// ---------------------------------------------------------------------------

/** The one cursor a disabled control may answer with. */
const DISABLED_CURSOR = 'default';

/**
 * What counts as disabled — the same pair the hover sweep uses.
 *
 * `:disabled` covers the native form controls (including everything inside a
 * disabled fieldset); `[aria-disabled="true"]` covers the pattern astryx uses
 * wherever a disabled control must stay focusable so its reason is
 * discoverable — Button with a tooltip, Selector's trigger, SideNavItem.
 */
const DISABLED_SELECTOR = ':disabled, [aria-disabled="true"]';

/**
 * Which stories belong to the requested components.
 *
 * `--components` absent means every story (the full-sweep contract). Present
 * but empty means the caller derived an empty set — audit nothing and pass,
 * rather than fanning out to a full sweep the caller never asked for. Same
 * contract as accessibility-audit.js, so both can share one component list.
 */
function selectStories(entries, components) {
  const wanted = (components || []).map(c => c.toLowerCase());
  return entries.filter(entry => {
    if (entry.type === 'docs' || entry.id.endsWith('--docs')) return false;
    if (!/^(core|lab)-/.test(entry.id)) return false;
    if (wanted.length === 0) return true;
    const title = entry.title || '';
    const parts = title.split('/');
    const componentPart = parts.length > 1 ? parts[1] : parts[0];
    return wanted.includes(componentPart.replace(/^XDS/i, '').toLowerCase());
  });
}

/**
 * Turn one element's sampled points into a verdict.
 *
 * A sample is `{cursor, relation}`, where `relation` says what the pointer
 * found at that point: `self` or `descendant` (the control answered),
 * `ancestor` (the control is sealed behind `pointer-events: none`), `covered`
 * (something else is on top), or `none` (outside the viewport).
 *
 * The worst answer decides — one reachable point promising `pointer` is a
 * defect however many other points behave.
 */
function verdictFor(samples) {
  const answered = samples.filter(
    s => s.relation === 'self' || s.relation === 'descendant',
  );
  if (answered.length > 0) {
    const wrong = answered.find(s => s.cursor !== DISABLED_CURSOR);
    return wrong
      ? {status: 'violation', cursor: wrong.cursor}
      : {status: 'ok', cursor: DISABLED_CURSOR};
  }
  const ancestor = samples.find(s => s.relation === 'ancestor');
  if (ancestor) return {status: 'unreachable', cursor: ancestor.cursor};
  return {status: 'skipped', cursor: null};
}

/** One line per violation, grouped by component, for the CI log. */
function formatViolations(violations) {
  if (violations.length === 0) {
    return `Every disabled element answers the pointer with ${DISABLED_CURSOR}.`;
  }
  const byComponent = new Map();
  for (const violation of violations) {
    const list = byComponent.get(violation.component) || [];
    list.push(violation);
    byComponent.set(violation.component, list);
  }
  const lines = [
    `${violations.length} disabled element(s) answer the pointer with the wrong cursor:`,
    '',
  ];
  for (const [component, list] of [...byComponent.entries()].sort()) {
    lines.push(`  ${component} (${list.length})`);
    for (const violation of list) {
      lines.push(`    ${violation.story}  ${violation.element}`);
      lines.push(
        `      cursor: ${violation.cursor} (expected ${DISABLED_CURSOR})`,
      );
    }
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// browser sweep
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
};

function serve(root, port) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/') url = '/index.html';
      const filePath = path.resolve(path.join(root, url));
      if (!filePath.startsWith(path.resolve(root))) {
        res.writeHead(403);
        return res.end('Forbidden');
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('Not found');
        }
        res.writeHead(200, {
          'Content-Type':
            MIME[path.extname(filePath)] || 'application/octet-stream',
        });
        res.end(data);
      });
    });
    server.listen(port, '127.0.0.1', () =>
      resolve({server, port: server.address().port}),
    );
  });
}

/**
 * Installed in the page: hit-test every disabled element and report what the
 * pointer would find.
 *
 * Sampling runs inside the page so one round trip covers every element in the
 * story. Five points per element — the centre and the four quadrant
 * midpoints — because a child that declares its own cursor often covers only
 * part of the control (an icon, a label, an inner input), and the centre
 * alone would miss it.
 */
const PAGE_HARNESS = `
window.__astryxCursorAudit = {
  label(el) {
    const id = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string' && el.className
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.')
      : '';
    const role = el.getAttribute('role');
    return '<' + el.tagName.toLowerCase() + id + cls + (role ? ' role=' + role : '') + '>';
  },
  points(rect) {
    const inset = (a, b, t) => a + (b - a) * t;
    return [
      [inset(rect.left, rect.right, 0.5), inset(rect.top, rect.bottom, 0.5)],
      [inset(rect.left, rect.right, 0.25), inset(rect.top, rect.bottom, 0.25)],
      [inset(rect.left, rect.right, 0.75), inset(rect.top, rect.bottom, 0.25)],
      [inset(rect.left, rect.right, 0.25), inset(rect.top, rect.bottom, 0.75)],
      [inset(rect.left, rect.right, 0.75), inset(rect.top, rect.bottom, 0.75)],
    ];
  },
  relation(el, hit) {
    if (!hit) return 'none';
    if (hit === el) return 'self';
    if (el.contains(hit)) return 'descendant';
    if (hit.contains(el)) return 'ancestor';
    return 'covered';
  },
  sample(selector) {
    return [...document.querySelectorAll(selector)]
      .filter(el => el.getClientRects().length > 0)
      .map(el => {
        const rect = el.getBoundingClientRect();
        const samples = this.points(rect)
          .filter(
            ([x, y]) =>
              x >= 0 && y >= 0 && x < innerWidth && y < innerHeight,
          )
          .map(([x, y]) => {
            const hit = document.elementFromPoint(x, y);
            return {
              relation: this.relation(el, hit),
              cursor: hit ? getComputedStyle(hit).cursor : null,
            };
          });
        return {label: this.label(el), samples};
      });
  },
};
`;

async function auditStory(context, port, entry, limits) {
  const page = await context.newPage();
  const violations = [];
  const unreachable = [];
  let disabledElements = 0;
  try {
    await page.goto(
      `http://127.0.0.1:${port}/iframe.html?id=${entry.id}&viewMode=story`,
      {waitUntil: 'load', timeout: limits.timeout},
    );
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    // Wait for the story to actually mount before counting disabled elements:
    // a bare `load` can land before React has rendered, and the sweep would
    // then report a story as having nothing to check.
    await page
      .waitForFunction(
        () => {
          const root = document.getElementById('storybook-root');
          return Boolean(root && root.children.length > 0);
        },
        {timeout: 5000},
      )
      .catch(() => {});
    await page.waitForTimeout(200);
    await page.evaluate(PAGE_HARNESS);

    const elements = await page.evaluate(
      selector => window.__astryxCursorAudit.sample(selector),
      DISABLED_SELECTOR,
    );
    disabledElements = elements.length;

    for (const element of elements.slice(0, limits.elementsPerStory)) {
      const verdict = verdictFor(element.samples);
      const record = {
        component: entry.title || entry.id,
        story: entry.id,
        element: element.label,
        cursor: verdict.cursor,
      };
      if (verdict.status === 'violation') violations.push(record);
      if (verdict.status === 'unreachable') unreachable.push(record);
    }
  } finally {
    await page.close().catch(() => {});
  }
  return {violations, unreachable, disabledElements};
}

async function run() {
  const args = process.argv.slice(2);
  const getArg = name => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
  };

  const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
  const outputFile = getArg('output');
  const componentsArg = getArg('components');
  const concurrency = Math.max(1, Number(getArg('concurrency') || 4));
  const port = Number(getArg('port') || 0);
  const limits = {
    timeout: Number(getArg('timeout') || 20000),
    elementsPerStory: Number(getArg('max-elements') || 30),
  };

  if (
    componentsArg !== null &&
    componentsArg.split(',').filter(Boolean).length === 0
  ) {
    console.log('No components to audit (--components is empty) — skipping.');
    return 0;
  }
  const components = (componentsArg || '').split(',').filter(Boolean);

  const dist = path.resolve(process.cwd(), storybookDir);
  if (!fs.existsSync(path.join(dist, 'index.json'))) {
    console.error(`Storybook build not found at ${dist}`);
    return 1;
  }
  const index = JSON.parse(
    fs.readFileSync(path.join(dist, 'index.json'), 'utf8'),
  );
  const stories = selectStories(
    Object.values(index.entries || index.stories || {}),
    components,
  );
  console.log(`Auditing ${stories.length} stories for the disabled cursor`);

  const {server, port: servedPort} = await serve(dist, port);
  const browser = await chromium.launch();
  const violations = [];
  const unreachable = [];
  const failures = [];
  let storiesWithDisabled = 0;
  let disabledElements = 0;

  try {
    const context = await browser.newContext({
      viewport: {width: 1280, height: 900},
    });
    const queue = [...stories];
    const workers = Array.from({length: concurrency}, async () => {
      for (;;) {
        const entry = queue.shift();
        if (!entry) return;
        try {
          const result = await auditStory(context, servedPort, entry, limits);
          if (result.disabledElements > 0) {
            storiesWithDisabled++;
            disabledElements += result.disabledElements;
          }
          violations.push(...result.violations);
          unreachable.push(...result.unreachable);
        } catch (error) {
          failures.push({story: entry.id, error: error.message});
        }
      }
    });
    await Promise.all(workers);
  } finally {
    await browser.close();
    server.close();
  }

  const report = {
    summary: {
      storiesAudited: stories.length,
      storiesWithDisabledElements: storiesWithDisabled,
      disabledElementsChecked: disabledElements,
      violations: violations.length,
      unreachable: unreachable.length,
      auditedAt: new Date().toISOString(),
    },
    violations,
    unreachable,
    failures,
  };
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n');
  }

  console.log(
    `\nChecked ${disabledElements} disabled element(s) across ${storiesWithDisabled} of ${stories.length} stories`,
  );
  if (unreachable.length > 0) {
    console.log(
      `${unreachable.length} sealed behind pointer-events: none (cursor comes from an ancestor)`,
    );
  }
  if (failures.length > 0) {
    console.warn(`${failures.length} story/stories failed to load:`);
    for (const failure of failures.slice(0, 10)) {
      console.warn(`  ${failure.story}: ${failure.error}`);
    }
  }
  console.log(formatViolations(violations));

  return violations.length > 0 ? 1 : 0;
}

if (require.main === module) {
  run()
    .then(code => {
      process.exitCode = code;
    })
    .catch(error => {
      console.error('Disabled-cursor audit failed:', error);
      process.exit(1);
    });
}

module.exports = {
  DISABLED_CURSOR,
  DISABLED_SELECTOR,
  selectStories,
  verdictFor,
  formatViolations,
};
