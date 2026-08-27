#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Asserts no disabled element paints a hover state
 * @input --storybook-dir <path> [--components <csv>] [--output <file>]
 *   [--concurrency <n>] [--port <n>]
 * @output JSON report of violations; exit 1 if any disabled element changes
 *   appearance under :hover
 *
 * A disabled control must look inert. `:hover` does not care: it keeps
 * matching a `<button disabled>` in every engine, so a hover treatment
 * declared on the enabled element is still painted under the pointer unless
 * something takes it away. StyleX will not take it away by accident either —
 * `disabled: {backgroundImage: 'none'}` overrides the DEFAULT condition only,
 * leaving the variant's `:hover` class untouched and winning the moment the
 * pointer arrives. Button shipped exactly that (see the fix in this change).
 *
 * jsdom has no pointer and no cascade, so the unit suite cannot see any of
 * it. Chromium can: for every disabled element in every story we force
 * `:hover` through CDP (the same switch DevTools' `:hov` panel throws) and
 * compare the element's painted properties, and those of its subtree and its
 * ::before/::after, against the unhovered render. Any difference is a
 * violation. Forcing beats moving a real mouse here: it needs no geometry, it
 * cannot miss a covered or scrolled-out element, and it puts the state on the
 * disabled element ALONE, so an ancestor's legitimate hover never leaks into
 * the result.
 *
 * The gate is zero-tolerance and has no baseline: a hover state on a disabled
 * element is never correct, so there is nothing to grandfather. What it does
 * skip is an element nothing can point at — no box, or `pointer-events: none`
 * over its whole subtree — because a hover rule that can never be reached is
 * not a defect a user can see.
 */

const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

// ---------------------------------------------------------------------------
// pure logic (exported for the unit test)
// ---------------------------------------------------------------------------

/**
 * Painted properties compared hovered vs unhovered.
 *
 * Every entry is something a user can SEE change. `cursor` is here because a
 * pointer cursor is an affordance: a disabled control that answers the mouse
 * with `pointer` promises a click it will not honour.
 */
const VISUAL_PROPERTIES = [
  'background-color',
  'background-image',
  'border-block-end-color',
  'border-block-start-color',
  'border-inline-end-color',
  'border-inline-start-color',
  'box-shadow',
  'color',
  'cursor',
  'fill',
  'filter',
  'font-weight',
  'opacity',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'scale',
  'stroke',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-thickness',
  'transform',
  'translate',
  'visibility',
];

/**
 * What counts as disabled.
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
 * Compare two subtree snapshots and return the properties that moved.
 *
 * A snapshot is a flat list of nodes in document order, each node a
 * `{label, styles}` record whose `styles` holds one entry per
 * VISUAL_PROPERTIES for the element and for its ::before/::after. Both
 * snapshots come from the same DOM microseconds apart, so a length mismatch
 * means the story re-rendered underneath us; report it rather than guess.
 */
function diffSnapshots(before, after) {
  if (before.length !== after.length) {
    return [{label: '(subtree)', property: '(node count)', from: String(before.length), to: String(after.length)}];
  }
  const deltas = [];
  for (let i = 0; i < before.length; i++) {
    const b = before[i];
    const a = after[i];
    for (const property of Object.keys(b.styles)) {
      if (b.styles[property] !== a.styles[property]) {
        deltas.push({label: b.label, property, from: b.styles[property], to: a.styles[property]});
      }
    }
  }
  return deltas;
}

/** One line per violation, grouped by component, for the CI log. */
function formatViolations(violations) {
  if (violations.length === 0) return 'No disabled element paints a hover state.';
  const byComponent = new Map();
  for (const violation of violations) {
    const list = byComponent.get(violation.component) || [];
    list.push(violation);
    byComponent.set(violation.component, list);
  }
  const lines = [`${violations.length} disabled element(s) paint a hover state:`, ''];
  for (const [component, list] of [...byComponent.entries()].sort()) {
    lines.push(`  ${component} (${list.length})`);
    for (const violation of list) {
      const deltas = violation.deltas
        .slice(0, 4)
        .map(d => `${d.label} ${d.property}: ${d.from} -> ${d.to}`)
        .join('; ');
      lines.push(`    ${violation.story}  ${violation.element}`);
      lines.push(`      ${deltas}`);
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
        res.writeHead(200, {'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream'});
        res.end(data);
      });
    });
    server.listen(port, '127.0.0.1', () => resolve({server, port: server.address().port}));
  });
}

/**
 * Installed in the page: index the disabled elements and snapshot one.
 *
 * Snapshots run inside the page so a single round trip covers the whole
 * subtree. The label is only for the report — it never affects the verdict.
 */
const PAGE_HARNESS = `
window.__astryxHoverAudit = {
  collect(selector) {
    this.nodes = [...document.querySelectorAll(selector)].filter(
      el => el.getClientRects().length > 0 && this.isHoverable(el)
    );
    return this.nodes.map(el => {
      const id = el.id ? '#' + el.id : '';
      const cls = typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.')
        : '';
      const role = el.getAttribute('role');
      return '<' + el.tagName.toLowerCase() + id + cls + (role ? ' role=' + role : '') + '>';
    });
  },
  // An element no pointer can hit never gets :hover in the first place, so a
  // hover rule matching it is unreachable rather than wrong (Link's disabled
  // style sets pointer-events: none, for one). A descendant that IS hittable
  // brings the whole ancestor chain back into :hover, so the subtree decides.
  isHoverable(el) {
    if (getComputedStyle(el).pointerEvents !== 'none') return true;
    return [...el.querySelectorAll('*')].some(
      child => getComputedStyle(child).pointerEvents !== 'none'
    );
  },
  snapshot(index, properties) {
    const out = [];
    const visit = (node, label) => {
      for (const pseudo of [null, '::before', '::after']) {
        const computed = getComputedStyle(node, pseudo);
        const styles = {};
        for (const property of properties) styles[property] = computed.getPropertyValue(property);
        out.push({label: label + (pseudo || ''), styles});
      }
      let child = 0;
      for (const element of node.children) {
        visit(element, label + ' > ' + element.tagName.toLowerCase() + ':nth-child(' + ++child + ')');
      }
    };
    visit(this.nodes[index], '');
    return out;
  },
};
`;

/** Freeze motion so a snapshot taken right after the state change is final. */
const FREEZE_MOTION = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}`;

async function auditStory(context, port, entry, limits) {
  const page = await context.newPage();
  const violations = [];
  let disabledElements = 0;
  try {
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${entry.id}&viewMode=story`, {
      waitUntil: 'load',
      timeout: limits.timeout,
    });
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
    await page.addStyleTag({content: FREEZE_MOTION});
    await page.waitForTimeout(200);
    await page.evaluate(PAGE_HARNESS);

    const labels = await page.evaluate(
      selector => window.__astryxHoverAudit.collect(selector),
      DISABLED_SELECTOR,
    );
    disabledElements = labels.length;
    if (disabledElements === 0) return {violations, disabledElements};

    const cdp = await context.newCDPSession(page);
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const {root} = await cdp.send('DOM.getDocument', {depth: -1, pierce: true});
      // Re-query through CDP so the nodeIds line up with the same filter the
      // page harness used: both walk the document in order, and the harness
      // drops only elements with no box, so we skip those here too.
      const {nodeIds} = await cdp.send('DOM.querySelectorAll', {
        nodeId: root.nodeId,
        selector: DISABLED_SELECTOR,
      });
      const boxed = await page.evaluate(
        selector =>
          [...document.querySelectorAll(selector)].map(
            el =>
              el.getClientRects().length > 0 &&
              window.__astryxHoverAudit.isHoverable(el),
          ),
        DISABLED_SELECTOR,
      );
      const hoverable = nodeIds.filter((_, i) => boxed[i]);

      for (let i = 0; i < hoverable.length && i < limits.elementsPerStory; i++) {
        const nodeId = hoverable[i];
        if (!nodeId) continue;
        const before = await page.evaluate(
          ([index, properties]) => window.__astryxHoverAudit.snapshot(index, properties),
          [i, VISUAL_PROPERTIES],
        );
        await cdp.send('CSS.forcePseudoState', {nodeId, forcedPseudoClasses: ['hover']});
        const after = await page.evaluate(
          ([index, properties]) => window.__astryxHoverAudit.snapshot(index, properties),
          [i, VISUAL_PROPERTIES],
        );
        await cdp.send('CSS.forcePseudoState', {nodeId, forcedPseudoClasses: []});

        const deltas = diffSnapshots(before, after);
        if (deltas.length > 0) {
          violations.push({
            component: entry.title || entry.id,
            story: entry.id,
            element: labels[i],
            deltas,
          });
        }
      }
    } finally {
      await cdp.detach().catch(() => {});
    }
  } finally {
    await page.close().catch(() => {});
  }
  return {violations, disabledElements};
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

  if (componentsArg !== null && componentsArg.split(',').filter(Boolean).length === 0) {
    console.log('No components to audit (--components is empty) — skipping.');
    return 0;
  }
  const components = (componentsArg || '').split(',').filter(Boolean);

  const dist = path.resolve(process.cwd(), storybookDir);
  if (!fs.existsSync(path.join(dist, 'index.json'))) {
    console.error(`Storybook build not found at ${dist}`);
    return 1;
  }
  const index = JSON.parse(fs.readFileSync(path.join(dist, 'index.json'), 'utf8'));
  const stories = selectStories(Object.values(index.entries || index.stories || {}), components);
  console.log(`Auditing ${stories.length} stories for hover states on disabled elements`);

  const {server, port: servedPort} = await serve(dist, port);
  const browser = await chromium.launch();
  const violations = [];
  const failures = [];
  let storiesWithDisabled = 0;
  let disabledElements = 0;

  try {
    const context = await browser.newContext({viewport: {width: 1280, height: 900}});
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
      auditedAt: new Date().toISOString(),
    },
    violations,
    failures,
  };
  if (outputFile) fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n');

  console.log(
    `\nChecked ${disabledElements} disabled element(s) across ${storiesWithDisabled} of ${stories.length} stories`,
  );
  if (failures.length > 0) {
    console.warn(`${failures.length} story/stories failed to load:`);
    for (const failure of failures.slice(0, 10)) console.warn(`  ${failure.story}: ${failure.error}`);
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
      console.error('Disabled-hover audit failed:', error);
      process.exit(1);
    });
}

module.exports = {VISUAL_PROPERTIES, DISABLED_SELECTOR, selectStories, diffSnapshots, formatViolations};
