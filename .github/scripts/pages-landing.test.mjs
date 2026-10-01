// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file GitHub Pages compatibility landing contracts.
 * @input The one-page source and its direct Pages workflow.
 * @output Route recovery, accessibility, canonical-link, and ownership checks.
 * @position Prevents the legacy origin from becoming a second maintained site.
 */

import fs from 'node:fs';
import path from 'node:path';

import {JSDOM} from 'jsdom';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PAGE = fs.readFileSync(
  path.join(ROOT, '.github/pages/index.html'),
  'utf8',
);

function render(url) {
  return new JSDOM(PAGE, {runScripts: 'dangerously', url}).window.document;
}

function luminance(hex) {
  const channels = hex
    .match(/[0-9a-f]{2}/gi)
    .map(channel => Number.parseInt(channel, 16) / 255)
    .map(channel =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('GitHub Pages compatibility landing', () => {
  it('keeps primary text and its caption above WCAG AA contrast', () => {
    const background = '#4b57b5';
    expect(PAGE).toContain(`background: ${background}`);
    expect(contrast('#ffffff', background)).toBeGreaterThanOrEqual(4.5);
    // The caption uses opacity: 0.8, so test the composited foreground too.
    expect(contrast('#dbddf0', background)).toBeGreaterThanOrEqual(4.5);
  });

  it('labels the canonical docsite as primary and exposes both stable apps', () => {
    const document = render('https://facebook.github.io/astryx/');
    expect(document.querySelector('h1')?.textContent).toBe('Astryx has moved');
    expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Astryx destinations',
    );
    expect(document.querySelector('a.primary')?.href).toBe(
      'https://astryx.atmeta.com/',
    );
    expect(document.querySelector('#storybook')?.href).toBe(
      'https://astryx.atmeta.com/storybook/',
    );
    expect(document.querySelector('#sandbox')?.href).toBe(
      'https://astryx.atmeta.com/sandbox/',
    );
    expect(document.querySelector('link[rel="canonical"]')?.href).toBe(
      'https://astryx.atmeta.com/',
    );
    expect(document.querySelector('meta[name="robots"]')?.content).toBe(
      'noindex, follow',
    );
  });

  it.each([
    [
      'Storybook',
      'https://facebook.github.io/astryx/storybook/?path=/story/core-button--primary#docs',
      '#storybook',
      'https://astryx.atmeta.com/storybook/?path=/story/core-button--primary#docs',
    ],
    [
      'Sandbox',
      'https://facebook.github.io/astryx/sandbox/templates/login-sso/?theme=dark#preview',
      '#sandbox',
      'https://astryx.atmeta.com/sandbox/templates/login-sso/?theme=dark#preview',
    ],
  ])(
    'preserves an old %s deep link in its recovery destination',
    (_name, oldUrl, selector, expected) => {
      expect(render(oldUrl).querySelector(selector)?.href).toBe(expected);
    },
  );

  it('does not guess a destination for unrelated old paths', () => {
    const document = render(
      'https://facebook.github.io/astryx/reports/old-run/?view=details#failure',
    );
    expect(document.querySelector('#storybook')?.href).toBe(
      'https://astryx.atmeta.com/storybook/',
    );
    expect(document.querySelector('#sandbox')?.href).toBe(
      'https://astryx.atmeta.com/sandbox/',
    );
  });

  it('publishes the same source as index and 404 without branch fanout', () => {
    const workflow = yaml.parse(
      fs.readFileSync(
        path.join(ROOT, '.github/workflows/pages-deploy.yml'),
        'utf8',
      ),
    );
    expect(workflow.on.workflow_run).toBeUndefined();
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.concurrency).toEqual({
      group: 'github-pages-landing',
      'cancel-in-progress': true,
    });
    expect(Object.keys(workflow.jobs)).toEqual(['deploy']);
    const command = workflow.jobs.deploy.steps
      .map(step => step.run ?? '')
      .join('\n');
    expect(command).toContain(
      'cp .github/pages/index.html pages-dist/index.html',
    );
    expect(command).toContain(
      'cp .github/pages/index.html pages-dist/404.html',
    );
    expect(command).not.toContain('storybook');
    expect(command).not.toContain('sandbox');
    expect(command).not.toContain('gh-pages');
  });
});
