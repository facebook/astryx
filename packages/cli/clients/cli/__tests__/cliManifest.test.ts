// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'fs';
import path from 'path';
import {describe, it, expect} from 'vitest';

describe('@astryxdesign/cli Theme Manifest & Template Validation', () => {
  const manifestPath = path.resolve(
    'packages/cli/assets/templates/themes/manifest.json',
  );

  it('validates theme manifest existence and structure', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.version).toBe(1);
    expect(Array.isArray(manifest.themes)).toBe(true);
    expect(manifest.themes.length).toBeGreaterThan(0);
  });

  it('verifies all referenced theme files exist', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const themesDir = path.dirname(manifestPath);

    for (const theme of manifest.themes) {
      expect(theme.slug).toBeDefined();
      expect(theme.displayName).toBeDefined();
      expect(theme.entry).toBeDefined();

      const entryPath = path.join(themesDir, theme.slug, theme.entry);
      expect(fs.existsSync(entryPath)).toBe(true);

      for (const file of theme.files) {
        const filePath = path.join(themesDir, theme.slug, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    }
  });
});
