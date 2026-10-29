// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeKnobs.interaction.browser.spec.ts
 * @input Themes from `defineTheme`, their CSS from `generateThemeCSS`, the
 *   knob reader and the animator, bundled with esbuild onto a fixture page;
 *   real Chromium and WebKit (the interaction projects: a phone with a coarse
 *   pointer) plus a fine-pointer describe
 * @output `spec:AST-108` FR3 and FR4a: the springs take `tempo` and
 *   `character` from the CSS the durations use, so a nested theme that sets
 *   neither plays its enclosing theme's, one that sets a knob stops it, and an
 *   adaptation rule's knobs apply where its condition holds; reading them
 *   forces no layout, and a spring started on a busy main thread starts on its
 *   first frame
 * @position Real-browser verification of `spec:AST-108` FR3
 */

import {fileURLToPath} from 'node:url';
import {expect, test, type Page} from '@playwright/test';
import {build} from 'esbuild';
import type * as Bundle from './themeKnobsBundle';

declare global {
  interface Window {
    ThemeKnobs: typeof Bundle;
  }
}

let script = '';

test.beforeAll(async () => {
  const result = await build({
    entryPoints: [
      fileURLToPath(new URL('./themeKnobsBundle.ts', import.meta.url)),
    ],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'ThemeKnobs',
    target: 'es2022',
    plugins: [
      {
        // The token defaults are a StyleX `defineVars` call, which a real
        // build compiles away; on this page they are their plain values.
        name: 'stylex-defaults',
        setup(context) {
          context.onResolve({filter: /^@stylexjs\/stylex$/}, () => ({
            path: 'stylex',
            namespace: 'stylex-defaults',
          }));
          context.onLoad({filter: /.*/, namespace: 'stylex-defaults'}, () => ({
            contents:
              'export const defineVars = vars => vars; export default {defineVars};',
            loader: 'js',
          }));
        },
      },
    ],
  });
  script = result.outputFiles[0].text;
});

/**
 * An outer theme with both knobs, holding a theme that sets none and one
 * that sets only `character: 'standard'`, beside a theme whose knobs come
 * from a coarse-pointer adaptation rule.
 */
const THEMES = `
const {defineTheme, generateThemeCSS, registerSpringsTable} = ThemeKnobs;
registerSpringsTable();
const themes = [
  defineTheme({name: 'outer', motion: {tempo: 1.4, character: 'expressive'}}),
  defineTheme({name: 'plain'}),
  defineTheme({name: 'own', motion: {character: 'standard'}}),
  defineTheme({
    name: 'ruled',
    adaptations: {
      rules: [
        {when: {pointer: 'coarse'}, value: {motion: {tempo: 0.8, character: 'crisp'}}},
      ],
    },
  }),
];
const style = document.createElement('style');
style.textContent = themes.map(theme => generateThemeCSS(theme).component).join('\\n');
document.head.append(style);
`;

const BODY = `
<div data-astryx-theme="outer"><div id="outer"></div>
  <div data-astryx-theme="plain"><div id="plain"></div></div>
  <div data-astryx-theme="own"><div id="own"></div></div>
</div>
<div data-astryx-theme="ruled"><div id="ruled"></div></div>
<div id="loose"></div>`;

async function open(page: Page) {
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
<script>${script}</script>
<script>${THEMES}</script>
${BODY}`;
  await page.route('http://knobs.test/', async route =>
    route.fulfill({contentType: 'text/html', body: html}),
  );
  await page.goto('http://knobs.test/');
}

const knobsOf = (page: Page, id: string) =>
  page.evaluate(
    target =>
      window.ThemeKnobs.themeMotionKnobs(document.getElementById(target)),
    id,
  );

test('a nested theme that sets no knob plays its enclosing theme\u2019s, and one that sets a knob stops it', async ({
  page,
}) => {
  await open(page);
  const outer = {tempo: 1.4, tempoIsSet: true, character: 'expressive'};
  expect(await knobsOf(page, 'outer')).toEqual(outer);
  expect(await knobsOf(page, 'plain')).toEqual(outer);
  expect(await knobsOf(page, 'own')).toEqual({...outer, character: 'standard'});
  expect(await knobsOf(page, 'loose')).toEqual({
    tempo: 1,
    tempoIsSet: false,
    character: 'standard',
  });
});

test('an adaptation rule\u2019s knobs apply where its condition holds: a coarse pointer', async ({
  page,
}) => {
  await open(page);
  expect(await knobsOf(page, 'ruled')).toEqual({
    tempo: 0.8,
    tempoIsSet: true,
    character: 'crisp',
  });
});

test('a spring started in a nested theme plays at the enclosing theme\u2019s tempo, and starts on its first frame while the layout is dirty', async ({
  page,
}) => {
  await open(page);
  const read = await page.evaluate(
    () =>
      new Promise<{nested: number; loose: number; started: boolean}>(
        resolve => {
          const {createAnimator, END_HOLD_MS, springs} = window.ThemeKnobs;
          // A busy main thread: a large tree whose layout is dirty when the
          // springs start.
          const filler = document.createElement('div');
          for (let index = 0; index < 12000; index += 1) {
            filler.append(
              Object.assign(document.createElement('p'), {
                textContent: `row ${index}`,
              }),
            );
          }
          document.body.append(filler);
          requestAnimationFrame(() => {
            filler.style.width = '321px';
            /** A spring's settle time: its animation, less the end hold. */
            const start = (id: string) => {
              const element = document.getElementById(id) as HTMLElement;
              void createAnimator(element).animate(
                {x: 100},
                {spring: springs.menuOpen},
              );
              return element.getAnimations()[0];
            };
            // 'own' sets only character 'standard': its tempo is the outer 1.4.
            const nested = start('own');
            const loose = start('loose');
            const settle = (animation: Animation) =>
              Number(animation.effect?.getTiming().duration) - END_HOLD_MS;
            requestAnimationFrame(() => {
              resolve({
                nested: settle(nested),
                loose: settle(loose),
                started: nested.startTime != null && loose.startTime != null,
              });
            });
          });
        },
      ),
  );
  expect(read.started).toBe(true);
  expect(read.nested / read.loose).toBeCloseTo(1.4, 2);
});

test('reading the knobs forces no layout, where reading a size does (Chromium\u2019s Long Animation Frames)', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Long Animation Frames, which time forced style and layout, are Chromium\u2019s',
  );
  await open(page);
  const forced = await page.evaluate(
    () =>
      new Promise<{knobs: number; size: number}>(resolve => {
        const filler = document.createElement('div');
        for (let index = 0; index < 12000; index += 1) {
          filler.append(
            Object.assign(document.createElement('p'), {
              textContent: `row ${index}`,
            }),
          );
        }
        document.body.append(filler);
        const plain = document.getElementById('plain') as HTMLElement;
        const starts: Record<'knobs' | 'size', number> = {
          knobs: NaN,
          size: NaN,
        };
        const scripts: {
          startTime: number;
          forcedStyleAndLayoutDuration: number;
        }[] = [];
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            scripts.push(
              ...(entry as unknown as {scripts: typeof scripts}).scripts,
            );
          }
        }).observe({type: 'long-animation-frame', buffered: false});
        // Each task dirties the layout only, with new text and no style
        // change, then holds the main thread 60 ms, so its frame is long
        // enough to be reported with the forced work its script did.
        const task = (name: 'knobs' | 'size', read: () => void) => () => {
          starts[name] = performance.now();
          (filler.firstChild as HTMLElement).textContent += ' more';
          read();
          const end = performance.now() + 60;
          while (performance.now() < end) {
            // Hold the main thread.
          }
        };
        setTimeout(
          task('knobs', () => window.ThemeKnobs.themeMotionKnobs(plain)),
          50,
        );
        setTimeout(
          task('size', () => plain.offsetWidth),
          300,
        );
        setTimeout(() => {
          const forcedAt = (time: number) =>
            scripts.find(entry => Math.abs(entry.startTime - time) < 10)
              ?.forcedStyleAndLayoutDuration ?? NaN;
          resolve({knobs: forcedAt(starts.knobs), size: forcedAt(starts.size)});
        }, 900);
      }),
  );
  console.log(
    `forced style and layout: knobs ${forced.knobs} ms, size ${forced.size} ms`,
  );
  // Reading a size lays the whole tree out; reading the knobs lays out none.
  expect(forced.size).toBeGreaterThan(1);
  expect(forced.knobs).toBeLessThan(forced.size / 4);
});

test.describe('under a fine pointer', () => {
  test.use({
    isMobile: false,
    hasTouch: false,
    viewport: {width: 1280, height: 800},
  });

  test('an adaptation rule for a coarse pointer leaves the knobs at Astryx\u2019s own', async ({
    page,
  }) => {
    await open(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: fine)').matches),
    ).toBe(true);
    expect(await knobsOf(page, 'ruled')).toEqual({
      tempo: 1,
      tempoIsSet: false,
      character: 'standard',
    });
  });
});
