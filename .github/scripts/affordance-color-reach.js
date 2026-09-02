#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @description Asserts a colour set on an affordance's theme target reaches the glyph it names
 * @input --storybook-dir <path> [--port <n>]
 * @output One line per case; exit 1 if a target cannot colour its own glyph
 *
 * A theme target that names a button holding one icon promises the obvious
 * thing: set a colour on it and the icon changes. That promise is easy to ship
 * broken, because an `Icon` that names its own colour (`color="secondary"`)
 * writes `color` on the glyph itself and beats anything the button inherits
 * down — the target resolves, the rule emits, and nothing moves. Table's sort
 * and filter affordances both shipped that way, which is what this guards.
 *
 * Nothing in the unit suite can see it. jsdom resolves no cascade, so a test
 * there can assert the class is on the button and the rule is in the CSS text
 * while the glyph still paints its own colour.
 *
 * The sibling guard, theme-var-reachability.js, asks whether a documented
 * *var* is settable. This asks whether an ordinary inherited property reaches
 * the descendant the target exists for, and it checks three things a var
 * cannot:
 *
 *   1. the glyph takes the themed colour at rest
 *   2. it still takes it under `:hover`, where a resting-state rule that only
 *      fires on hover would otherwise take over
 *   3. the elements the target must NOT repaint keep their own colour — a
 *      button that holds both a label and a glyph must colour only the glyph
 *
 * It also pins the resting contrast, because the reason these two grew a
 * `color` of their own is that the dimming they used instead (`opacity: 0.35`)
 * put them below the 3:1 WCAG 1.4.11 asks of a UI component.
 *
 * The probe stylesheet is not hand-written. It is what `defineTheme` emits for
 * a theme that sets `color` on the target — the same path a theme author takes
 * — so the derived-var expansion behind `table-sort-button` is exercised rather
 * than assumed. Writing the private var directly would pass whether or not that
 * expansion exists, which is the hole this closes.
 */

const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const args = process.argv.slice(2);
const getArg = name => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const port = Number(getArg('port') || 6013);

/** Distinctive enough that a coincidental match is not a concern. */
const SENTINEL = 'rgb(1, 2, 3)';

/** WCAG 1.4.11 — a UI component's states must reach 3:1 against their ground. */
const MIN_CONTRAST = 3;

const CASES = [
  {
    name: 'Table sort affordance',
    story: 'core-tablefiltering--with-sorting',
    target: 'astryx-table-sort-button',
    // The theme key `defineTheme` takes for this target.
    themeComponent: 'table-sort-button',
    // The header label shares the button with the glyph, so it has to keep the
    // cell's colour rather than follow the affordance's. `color` reaches the
    // glyph through the derived-var expansion, which drops the source property
    // so nothing lands on the button for the label to inherit.
    unchanged: 'the header label',
    unchangedSelector: '.astryx-table-sort-button span > span:first-child',
    // Activating this control moves it into a reflected state that restyles
    // the glyph (`direction`), which is where a component rule can quietly
    // take the theme's colour back.
    activates: true,
  },
  {
    name: 'Table filter affordance',
    story: 'core-tablefiltering--with-sorting',
    target: 'astryx-table-filter-button',
    themeComponent: 'table-filter-button',
    activates: false,
    // This button holds the glyph and nothing else, so plain `color` lands on
    // the button and there is nothing for it to over-reach.
    unchanged: null,
    unchangedSelector: null,
  },
];

/**
 * The CSS a theme author's `color` on one target actually produces.
 *
 * Goes through `defineTheme` + `generateThemeCSS` from the built core, so a
 * target whose `color` is expanded into a private var by the derived-var
 * registry is exercised through that expansion. The result is wrapped the way
 * `<Theme>` wraps it (`@layer astryx-theme`), and the scope attribute is put on
 * <html> in the page so the emitted `@scope` matches.
 */
const PROBE_THEME_NAME = 'affordance-reach-probe';

const CORE_ENTRY = path.resolve(__dirname, '../../packages/core/dist/index.js');

async function probeStylesheet(themeComponent, value) {
  if (!fs.existsSync(CORE_ENTRY)) {
    throw new Error(
      `Built core not found at ${CORE_ENTRY}. This guard generates its probe ` +
        `stylesheet with the real defineTheme, so core must be built first ` +
        `(the Storybook build in this job already requires it).`,
    );
  }
  const {defineTheme, generateThemeCSS} = await import(
    require('node:url').pathToFileURL(CORE_ENTRY).href
  );
  const theme = defineTheme({
    name: PROBE_THEME_NAME,
    components: {[themeComponent]: {base: {color: value}}},
  });
  const {component} = generateThemeCSS(theme);
  return component;
}

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function createServer(dir, listenPort) {
  return new Promise(resolve => {
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
          'Content-Type': CONTENT_TYPES[path.extname(resolved)] || 'text/plain',
        });
        res.end(data);
      });
    });

    server.listen(listenPort, () => resolve(server));
  });
}

/** WCAG relative luminance of an `rgb(r, g, b)` string. */
function luminance(color) {
  const [r, g, b] = (color.match(/\d+/g) || []).slice(0, 3).map(Number);
  const channel = v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
}

/**
 * In the page: read the glyph's colour, the ground it sits on, and the colour
 * of whatever the target must leave alone. `opacity` is folded in because it
 * composites toward the ground and is what put these two under 3:1.
 */
function readInPage([target, unchangedSelector]) {
  const button = document.querySelector(`.${target}`);
  if (!button) return {status: 'missing'};

  const glyph = button.querySelector('svg');
  if (!glyph) return {status: 'noglyph'};

  // What is actually PAINTED, not what the glyph inherits. `color` on the
  // <svg> is only a promise: the geometry inside honours it where it declares
  // `currentColor`, and ignores it the moment anything hardcodes a stroke or
  // fill. Reading `color` passes in both cases, which is the hole this closes.
  const paints = [];
  for (const node of glyph.querySelectorAll(
    'path,circle,rect,line,polyline,polygon,ellipse',
  )) {
    const cs = getComputedStyle(node);
    // A node paints with whichever of the two is not `none`; both can be set,
    // and then both have to be right.
    if (cs.stroke && cs.stroke !== 'none') paints.push(cs.stroke);
    if (cs.fill && cs.fill !== 'none') paints.push(cs.fill);
  }

  let opacity = 1;
  for (let el = glyph; el && el !== document.body; el = el.parentElement) {
    opacity *= Number(getComputedStyle(el).opacity);
  }

  let ground = 'rgb(255, 255, 255)';
  for (let el = button; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) {
      ground = bg;
      break;
    }
  }

  const unchanged = unchangedSelector
    ? getComputedStyle(document.querySelector(unchangedSelector)).color
    : null;

  return {
    status: 'ok',
    // The button's OWN colour: what every descendant, including the column
    // name, inherits unless it sets its own.
    buttonColor: getComputedStyle(button).color,
    color: getComputedStyle(glyph).color,
    paints: [...new Set(paints)],
    opacity: Number(opacity.toFixed(3)),
    ground,
    unchanged,
  };
}

/** Composite `color` over `ground` at `opacity`, the way the screen does. */
function composite(color, ground, opacity) {
  const c = (color.match(/\d+/g) || []).slice(0, 3).map(Number);
  const g = (ground.match(/\d+/g) || []).slice(0, 3).map(Number);
  const mixed = c.map((v, i) => Math.round(v * opacity + g[i] * (1 - opacity)));
  return `rgb(${mixed.join(', ')})`;
}

async function checkCase(context, testCase) {
  const page = await context.newPage();
  const failures = [];
  const notes = [];

  try {
    await page.goto(
      `http://localhost:${port}/iframe.html?id=${testCase.story}&viewMode=story`,
      {waitUntil: 'networkidle', timeout: 30000},
    );
    // Storybook settles the network before it mounts the story, so
    // `networkidle` alone reads an empty root and every case fails for the
    // wrong reason. Wait for the element the case is about, with a glyph
    // inside it — which is exactly what the reads below need.
    await page.waitForSelector(`.${testCase.target} svg`, {
      state: 'attached',
      timeout: 30000,
    });

    const args = [testCase.target, testCase.unchangedSelector];
    const rest = await page.evaluate(readInPage, args);

    if (rest.status === 'missing') {
      return {failures: [`no element carries .${testCase.target}`], notes};
    }
    if (rest.status === 'noglyph') {
      return {failures: [`.${testCase.target} holds no glyph to colour`], notes};
    }

    // 1 — resting contrast, composited the way it is seen. Measured on the
    // painted stroke/fill rather than the inherited colour: they can differ,
    // and only one of them is on screen.
    const restPaint = rest.paints[0] || rest.color;
    const painted = composite(restPaint, rest.ground, rest.opacity);
    const ratio = contrastRatio(painted, rest.ground);
    notes.push(
      `rest ${restPaint}${rest.opacity === 1 ? '' : ` @ ${rest.opacity}`} on ${rest.ground} — ${ratio}:1`,
    );
    if (ratio < MIN_CONTRAST) {
      failures.push(
        `resting glyph is ${ratio}:1 against the header, below the ${MIN_CONTRAST}:1 ` +
          `WCAG 1.4.11 asks of a UI component` +
          (rest.opacity === 1
            ? ''
            : ` (it is dimmed to ${rest.opacity}, which composites toward the ground)`),
      );
    }

    // 2 — a themed colour reaches the glyph.
    //
    // The stylesheet is what `defineTheme` emits, plus a blanket transition
    // kill. These affordances transition `color` between their rest and hover
    // states, so a read taken right after the sentinel lands returns an
    // interpolated value and the case fails for a reason that has nothing to
    // do with reachability — measured mid-flight at rgb(61, 62, 62) between
    // the old colour and the new. What is being asserted is the settled paint,
    // so the animation is removed rather than waited on: a sleep long enough
    // for one theme's duration is a race in another.
    const themeCss = await probeStylesheet(testCase.themeComponent, SENTINEL);
    await page.evaluate(
      ([css, themeName, target]) => {
        // The emitted rules are `@scope (…theme=name…) to ([data-astryx-theme])`
        // — bounded so a nested theme does not inherit its parent's component
        // overrides. Storybook already mounts a theme, so naming <html> as the
        // scope root puts that mounted theme's element on the scope LIMIT and
        // the story falls outside: the rules parse, match nothing, and the case
        // fails for a reason that is not reachability. Rename the innermost
        // themed ancestor instead, which is where a real theme sits.
        const button = document.querySelector(`.${target}`);
        let host = document.documentElement;
        for (let el = button; el; el = el.parentElement) {
          if (el.hasAttribute('data-astryx-theme')) {
            host = el;
            break;
          }
        }
        host.setAttribute('data-astryx-theme', themeName);
        const style = document.createElement('style');
        style.id = 'reach-probe';
        style.textContent =
          `@layer astryx-theme {\n${css}\n}\n` +
          `*, *::before, *::after {
             transition-duration: 0s !important;
             animation-duration: 0s !important;
           }`;
        document.head.appendChild(style);
      },
      [themeCss, PROBE_THEME_NAME, testCase.target],
    );

    const themed = await page.evaluate(readInPage, args);
    const unmoved = themed.paints.filter(p => p !== SENTINEL);
    if (themed.paints.length === 0) {
      failures.push(
        `.${testCase.target}'s glyph paints nothing — no stroke or fill ` +
          `resolved on any of its geometry, so there is nothing to colour.`,
      );
    } else if (unmoved.length > 0) {
      failures.push(
        `a colour on .${testCase.target} in @layer astryx-theme did not reach the ` +
          `PAINTED glyph — stroke/fill stayed ${unmoved.join(', ')} while the ` +
          `inherited color read ${themed.color}. Geometry that hardcodes its ` +
          `paint ignores the target a theme is told to use.`,
      );
    } else {
      notes.push(`themed → painted ${themed.paints.join(', ')}`);
    }

    // 3 — and still reaches it under hover.
    const header = page.locator(`th:has(.${testCase.target})`).first();
    await header.hover({force: true});
    await page.waitForTimeout(120);
    const hovered = await page.evaluate(readInPage, args);
    const unmovedHover = hovered.paints.filter(p => p !== SENTINEL);
    if (unmovedHover.length > 0) {
      failures.push(
        `the themed colour is lost on hover — painted stroke/fill went to ` +
          `${unmovedHover.join(', ')}. A hover rule that re-states the resting ` +
          `colour takes the theme's away.`,
      );
    } else {
      notes.push(`hovered → painted ${hovered.paints.join(', ')}`);
    }

    // 3b — and still reaches it in the state the control reflects. A rule
    // keyed on that state sits on the same element as the theme's, so a
    // component that re-states the colour there wins back everything the
    // theme set, in the one state a theme author is least likely to check.
    if (testCase.activates) {
      await page.locator(`.${testCase.target}`).first().click();
      await page.waitForSelector(`.${testCase.target}[data-direction]`, {
        state: 'attached',
        timeout: 5000,
      });
      const activated = await page.evaluate(readInPage, args);
      const unmovedActive = activated.paints.filter(p => p !== SENTINEL);
      const state = await page.evaluate(
        target =>
          document
            .querySelector(`.${target}`)
            .getAttribute('data-direction'),
        testCase.target,
      );
      if (unmovedActive.length > 0) {
        failures.push(
          `the themed colour is lost once the control reflects a state — ` +
            `painted stroke/fill went to ${unmovedActive.join(', ')} at ` +
            `data-direction="${state}".`,
        );
      } else {
        notes.push(`data-direction="${state}" → painted ${activated.paints.join(', ')}`);
      }
    }

    // 4 — what the target must not repaint kept its own colour.
    if (testCase.unchangedSelector) {
      if (themed.buttonColor === SENTINEL) {
        failures.push(
          `the themed colour landed on .${testCase.target} itself, so every ` +
            `descendant inherits it. This target routes colour to its glyph ` +
            `through a derived var precisely so the column name does not move.`,
        );
      }
      if (themed.unchanged === SENTINEL) {
        failures.push(
          `${testCase.unchanged} followed the target's colour. It shares the ` +
            `element with the glyph, so it needs a colour of its own.`,
        );
      } else {
        notes.push(`${testCase.unchanged} held at ${themed.unchanged}`);
      }
    }
  } finally {
    await page.close();
  }

  return {failures, notes};
}

async function run() {
  const dir = path.resolve(process.cwd(), storybookDir);
  if (!fs.existsSync(path.join(dir, 'index.json'))) {
    console.error(`Storybook build not found at ${dir}`);
    return 1;
  }

  const server = await createServer(dir, port);
  const browser = await chromium.launch();
  let failed = 0;

  try {
    const context = await browser.newContext({
      viewport: {width: 1100, height: 700},
    });

    for (const testCase of CASES) {
      const {failures, notes} = await checkCase(context, testCase);
      if (failures.length === 0) {
        console.log(`✓ ${testCase.name} — ${notes.join('; ')}`);
        continue;
      }
      failed += 1;
      for (const f of failures) {
        console.error(`✗ ${testCase.name}: ${f}`);
      }
      if (notes.length > 0) {
        console.error(`  measured: ${notes.join('; ')}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failed > 0) {
    console.error(
      `\nFailing: ${failed} affordance target(s). A target that names a button ` +
        `holding one icon has to be able to colour that icon — otherwise the ` +
        `documented seam does nothing and says nothing.`,
    );
    return 1;
  }
  console.log(`\nAll ${CASES.length} affordance targets colour their own glyph.`);
  return 0;
}

run()
  .then(code => {
    process.exitCode = code;
  })
  .catch(e => {
    console.error('Affordance colour reachability guard failed:', e);
    process.exit(1);
  });
