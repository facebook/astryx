// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {themePaletteGenerate} from './generate.mjs';

const temporaryDirectories = [];

function fixture() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-palette-'));
  temporaryDirectories.push(cwd);
  fs.writeFileSync(
    path.join(cwd, 'palette.config.json'),
    JSON.stringify({
      modeStrategy: 'light-only',
      stops: [20, 50, 80],
      families: [{id: 'blue', seed: '#0074e2'}],
    }),
  );
  return cwd;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('themePaletteGenerate', () => {
  it('returns a candidate without writing when no output is requested', () => {
    const cwd = fixture();
    const result = themePaletteGenerate('palette.config.json', {}, {cwd});

    expect(result.type).toBe('theme.palette.generate');
    expect(result.data).toMatchObject({
      recipe: 'astryx-oklch-v1',
      status: 'candidate',
      familyCount: 1,
      stopCount: 3,
      modes: ['light'],
      output: null,
      written: false,
    });
    expect(result.data.candidate.palette.blue.light).toEqual({
      20: expect.stringMatching(/^#[0-9a-f]{6}$/),
      50: expect.stringMatching(/^#[0-9a-f]{6}$/),
      80: expect.stringMatching(/^#[0-9a-f]{6}$/),
    });
    expect(result.data.candidate).toMatchObject({
      black: '#000000',
      white: '#ffffff',
    });
  });

  it('writes a candidate and detached reproducibility receipt together', () => {
    const cwd = fixture();
    const result = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts'},
      {cwd},
    );

    expect(result.data).toMatchObject({
      output: 'ocean.palette.ts',
      receipt: 'ocean.palette.receipt.json',
      written: true,
      reason: null,
    });
    const candidate = fs.readFileSync(
      path.join(cwd, 'ocean.palette.ts'),
      'utf-8',
    );
    const receipt = JSON.parse(
      fs.readFileSync(path.join(cwd, 'ocean.palette.receipt.json'), 'utf-8'),
    );
    expect(receipt.recipe).toBe('astryx-oklch-v1');
    expect(receipt.candidateSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(candidate).toContain('// prettier-ignore');
    expect(candidate).toContain("export const black = '#000000' as const;");
    expect(candidate).toContain("export const white = '#ffffff' as const;");
    expect(candidate).toContain('export const palette =');
    expect(candidate).not.toContain('generateTonalPalette');
  });

  it('supports JSON when an interoperable artifact is requested', () => {
    const cwd = fixture();
    const result = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.json'},
      {cwd},
    );

    const written = JSON.parse(
      fs.readFileSync(path.join(cwd, 'ocean.palette.json'), 'utf-8'),
    );
    expect(written).toEqual(result.data.candidate);
    expect(written).toMatchObject({black: '#000000', white: '#ffffff'});
    expect(result.data.receipt).toBe('ocean.palette.receipt.json');
  });

  it('emits requested decimal stops as literal TypeScript keys', () => {
    const cwd = fixture();
    fs.writeFileSync(
      path.join(cwd, 'palette.config.json'),
      JSON.stringify({
        modeStrategy: 'light-only',
        stops: [12.5, 50],
        families: [{id: 'blue', seed: '#0074e2'}],
      }),
    );

    themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts'},
      {cwd},
    );

    const candidate = fs.readFileSync(
      path.join(cwd, 'ocean.palette.ts'),
      'utf-8',
    );
    expect(candidate).toContain('"12.5":');
    expect(candidate).toContain('export const palette =');
    expect(candidate).toContain('as const');
  });

  it('writes a standardized preview without requiring palette output', () => {
    const cwd = fixture();
    const result = themePaletteGenerate(
      'palette.config.json',
      {preview: 'palette-preview.html'},
      {cwd},
    );

    expect(result.data).toMatchObject({
      output: null,
      receipt: null,
      preview: 'palette-preview.html',
      written: true,
    });
    const preview = fs.readFileSync(
      path.join(cwd, 'palette-preview.html'),
      'utf-8',
    );
    expect(preview).toContain('palette-preview-v1');
    expect(preview).not.toContain('Generated candidate');
    expect(preview).not.toContain('does not certify accessibility');
    expect(preview).not.toMatch(/https?:\/\//);
  });

  it('rejects output formats that cannot preserve the palette contract', () => {
    const cwd = fixture();
    expect(() =>
      themePaletteGenerate(
        'palette.config.json',
        {out: 'ocean.palette.js'},
        {cwd},
      ),
    ).toThrow('must end in .ts or .json');
  });

  it('does not overwrite an existing preview implicitly', () => {
    const cwd = fixture();
    fs.writeFileSync(path.join(cwd, 'palette-preview.html'), 'author edit\n');

    const result = themePaletteGenerate(
      'palette.config.json',
      {preview: 'palette-preview.html'},
      {cwd},
    );

    expect(result.data).toMatchObject({written: false, reason: 'exists'});
    expect(
      fs.readFileSync(path.join(cwd, 'palette-preview.html'), 'utf-8'),
    ).toBe('author edit\n');
  });

  it('leaves author-owned output untouched unless overwrite is explicit', () => {
    const cwd = fixture();
    fs.writeFileSync(path.join(cwd, 'ocean.palette.ts'), 'author edit\n');

    const skipped = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts'},
      {cwd},
    );
    expect(skipped.data).toMatchObject({written: false, reason: 'exists'});
    expect(fs.readFileSync(path.join(cwd, 'ocean.palette.ts'), 'utf-8')).toBe(
      'author edit\n',
    );

    const replaced = themePaletteGenerate(
      'palette.config.json',
      {out: 'ocean.palette.ts', overwrite: true},
      {cwd},
    );
    expect(replaced.data.written).toBe(true);
    expect(
      fs.readFileSync(path.join(cwd, 'ocean.palette.ts'), 'utf-8'),
    ).not.toBe('author edit\n');
  });

  it('returns stable errors for invalid input', () => {
    const cwd = fixture();
    fs.writeFileSync(path.join(cwd, 'palette.config.json'), '{');
    expect(() =>
      themePaletteGenerate('palette.config.json', {}, {cwd}),
    ).toThrow('Could not parse palette config');
  });
});
