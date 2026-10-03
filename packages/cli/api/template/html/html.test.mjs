// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  ASTRYX_VANILLA_CDN_PLACEHOLDER,
  ASTRYX_VANILLA_CDN_REF,
  templateHtml,
} from './html.mjs';

const FIXTURE = path.resolve(
  import.meta.dirname,
  '../../../test/fixtures/vanilla-project',
);

describe('templateHtml()', () => {
  it('lists sorted vanilla HTML templates', () => {
    expect(templateHtml(undefined, {cwd: FIXTURE, list: true})).toEqual({
      type: 'template.html.list',
      data: [{id: 'dashboard', file: 'dashboard.html'}],
    });
  });

  it('falls back to the bundled templates outside a checkout', () => {
    const outsideCheckout = fs.mkdtempSync(
      path.join(os.tmpdir(), 'astryx-cli-installed-'),
    );
    try {
      const result = templateHtml('dashboard', {cwd: outsideCheckout});
      expect(result.type).toBe('template.html');
      expect(result.data.source).toContain('<!doctype html>');
    } finally {
      fs.rmSync(outsideCheckout, {recursive: true, force: true});
    }
  });

  it('substitutes every placeholder with the pinned default CDN base', () => {
    const result = templateHtml('dashboard', {cwd: FIXTURE});
    expect(result.type).toBe('template.html');
    expect(result.data.cdnRef).toBe(ASTRYX_VANILLA_CDN_REF);
    expect(result.data.source).not.toContain(ASTRYX_VANILLA_CDN_PLACEHOLDER);
    expect(
      result.data.source.match(new RegExp(result.data.cdnBase, 'g')),
    ).toHaveLength(2);
  });

  it('supports an explicit CDN ref', () => {
    const result = templateHtml('dashboard', {cwd: FIXTURE, cdnRef: 'abc1234'});
    expect(result.data.cdnBase).toContain('@abc1234/packages/vanilla/dist');
    expect(result.data.source).toContain(result.data.cdnBase);
  });

  it('rejects unsafe CDN refs', () => {
    expect(() =>
      templateHtml('dashboard', {cwd: FIXTURE, cdnRef: '../main'}),
    ).toThrow(/Invalid vanilla CDN ref/);
  });

  it('reports a missing page as an unknown template', () => {
    const error = (() => {
      try {
        templateHtml('missing', {cwd: FIXTURE});
      } catch (caught) {
        return caught;
      }
    })();
    expect(error.code).toBe('ERR_UNKNOWN_TEMPLATE');
  });
});
