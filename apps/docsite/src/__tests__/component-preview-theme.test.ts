// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const componentDetailDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../components/component-detail',
);

function readComponentDetailFile(name: string): string {
  return readFileSync(join(componentDetailDir, name), 'utf8');
}

describe('component detail preview theming', () => {
  it('applies the neutral preview theme around preview containers', () => {
    expect(readComponentDetailFile('ComponentDetailClient.tsx')).toMatch(
      /<ComponentPreviewTheme>\s*<XDSCard variant="muted" padding=\{0\}>/,
    );
    expect(readComponentDetailFile('InteractivePreview.tsx')).toMatch(
      /<ComponentPreviewTheme>\s*<XDSCard[\s>]/,
    );
    expect(readComponentDetailFile('ExampleBlock.tsx')).toMatch(
      /<ComponentPreviewTheme>\s*<XDSCard padding=\{3\}>/,
    );
  });

  it('keeps the theme boundary at the container instead of inside content', () => {
    expect(readComponentDetailFile('ShowcasePreview.tsx')).not.toContain(
      'XDSTheme theme={neutralTheme}',
    );
    expect(readComponentDetailFile('InteractivePreview.tsx')).not.toContain(
      'XDSTheme theme={neutralTheme}',
    );
    expect(readComponentDetailFile('ExampleBlock.tsx')).not.toContain(
      'XDSTheme theme={neutralTheme}',
    );
  });
});
