import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  discoverComponents,
  cleanReadme,
  extractCompact,
  findComponentReadme,
  findComponentSource,
} from './component.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-component-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('discoverComponents', () => {
  it('groups XDS*.tsx files by category', () => {
    const srcDir = path.join(tmpDir, 'src');
    // Create Button dir with XDSButton.tsx
    const buttonDir = path.join(srcDir, 'Button');
    fs.mkdirSync(buttonDir, {recursive: true});
    fs.writeFileSync(path.join(buttonDir, 'XDSButton.tsx'), '');

    // Create Avatar dir with XDSAvatar.tsx
    const avatarDir = path.join(srcDir, 'Avatar');
    fs.mkdirSync(avatarDir, {recursive: true});
    fs.writeFileSync(path.join(avatarDir, 'XDSAvatar.tsx'), '');

    // Create Grid dir with XDSGrid.tsx
    const gridDir = path.join(srcDir, 'Grid');
    fs.mkdirSync(gridDir, {recursive: true});
    fs.writeFileSync(path.join(gridDir, 'XDSGrid.tsx'), '');

    // Skip dirs
    const themeDir = path.join(srcDir, 'theme');
    fs.mkdirSync(themeDir, {recursive: true});
    fs.writeFileSync(path.join(themeDir, 'XDSTheme.tsx'), '');

    const result = discoverComponents(tmpDir);

    expect(result).toEqual({
      Layout: ['Grid'],
      Display: ['Avatar'],
      Action: ['Button'],
    });
  });

  it('skips test files', () => {
    const srcDir = path.join(tmpDir, 'src');
    const buttonDir = path.join(srcDir, 'Button');
    fs.mkdirSync(buttonDir, {recursive: true});
    fs.writeFileSync(path.join(buttonDir, 'XDSButton.tsx'), '');
    fs.writeFileSync(path.join(buttonDir, 'XDSButton.test.tsx'), '');

    const result = discoverComponents(tmpDir);
    expect(result).toEqual({Action: ['Button']});
  });

  it('puts unknown directories under Other', () => {
    const srcDir = path.join(tmpDir, 'src');
    const customDir = path.join(srcDir, 'CustomWidget');
    fs.mkdirSync(customDir, {recursive: true});
    fs.writeFileSync(path.join(customDir, 'XDSCustomWidget.tsx'), '');

    const result = discoverComponents(tmpDir);
    expect(result).toEqual({Other: ['CustomWidget']});
  });
});

describe('cleanReadme', () => {
  it('strips SYNC comments, rewrites title, collapses blanks', () => {
    const input = [
      '# /packages/core/src/Button',
      '<!-- SYNC: something -->',
      '',
      'Description here.',
      '',
      '',
      '',
      'More text.',
    ].join('\n');

    const result = cleanReadme(input, 'Button');
    expect(result).toContain('# Button');
    expect(result).not.toContain('SYNC');
    // Should collapse consecutive blank lines
    expect(result).not.toContain('\n\n\n');
  });

  it('preserves XDS prefix in display name', () => {
    const input = '# /packages/core/src/XDSButton\n\nContent.\n';
    const result = cleanReadme(input, 'XDSButton');
    expect(result).toContain('# XDSButton');
  });
});

describe('extractCompact', () => {
  it('skips configured sections', () => {
    const input = [
      '# /packages/core/src/Button',
      '',
      '## Features',
      'Feature list.',
      '',
      '## Files',
      'This should be skipped.',
      '',
      '## RTL Support',
      'Also skipped.',
      '',
      '## Props',
      'Props content.',
    ].join('\n');

    const result = extractCompact(input, 'Button');
    expect(result).toContain('# Button');
    expect(result).toContain('Feature list.');
    expect(result).not.toContain('This should be skipped.');
    expect(result).not.toContain('Also skipped.');
    expect(result).toContain('Props content.');
  });

  it('limits code blocks to MAX_EXAMPLES (3)', () => {
    const blocks = [];
    for (let i = 0; i < 5; i++) {
      blocks.push(`\`\`\`tsx\ncode block ${i}\n\`\`\``);
    }
    const input = `# /Button\n\n## Usage\n\n${blocks.join('\n\n')}\n`;

    const result = extractCompact(input, 'Button');
    // Should include at most 3 code blocks
    const codeBlockCount = (result.match(/```tsx/g) || []).length;
    expect(codeBlockCount).toBeLessThanOrEqual(3);
  });

  it('strips ASCII art blocks', () => {
    const input = [
      '# /Button',
      '',
      '```',
      '┌──────────────┐',
      '│  ASCII art   │',
      '└──────────────┘',
      '```',
      '',
      'Regular text.',
    ].join('\n');

    const result = extractCompact(input, 'Button');
    expect(result).not.toContain('┌──────────────┐');
    expect(result).toContain('Regular text.');
  });
});

describe('findComponentReadme', () => {
  it('finds direct README: src/{name}/README.md', () => {
    const srcDir = path.join(tmpDir, 'src');
    const compDir = path.join(srcDir, 'Button');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(path.join(compDir, 'README.md'), '# Button');

    const result = findComponentReadme(tmpDir, 'Button');
    expect(result).toBe(path.join(compDir, 'README.md'));
  });

  it('finds nested README: src/*/{name}/README.md', () => {
    const srcDir = path.join(tmpDir, 'src');
    const nestedDir = path.join(srcDir, 'Layout', 'Container');
    fs.mkdirSync(nestedDir, {recursive: true});
    fs.writeFileSync(path.join(nestedDir, 'README.md'), '# Container');

    const result = findComponentReadme(tmpDir, 'Container');
    expect(result).toBe(path.join(nestedDir, 'README.md'));
  });

  it('falls back to README near source file', () => {
    const srcDir = path.join(tmpDir, 'src');
    const deepDir = path.join(srcDir, 'Layout', 'Container', 'Card');
    fs.mkdirSync(deepDir, {recursive: true});
    fs.writeFileSync(path.join(deepDir, 'XDSCard.tsx'), '');
    // README in Container (parent of Card)
    fs.writeFileSync(
      path.join(srcDir, 'Layout', 'Container', 'README.md'),
      '# Container',
    );

    const result = findComponentReadme(tmpDir, 'Card');
    expect(result).toBe(
      path.join(srcDir, 'Layout', 'Container', 'README.md'),
    );
  });

  it('returns null when no README found', () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    expect(findComponentReadme(tmpDir, 'NonExistent')).toBeNull();
  });
});

describe('findComponentSource', () => {
  it('finds direct source: src/{name}/XDS{name}.tsx', () => {
    const srcDir = path.join(tmpDir, 'src');
    const compDir = path.join(srcDir, 'Button');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(path.join(compDir, 'XDSButton.tsx'), '');

    const result = findComponentSource(tmpDir, 'Button');
    expect(result).toBe(path.join(compDir, 'XDSButton.tsx'));
  });

  it('finds nested source: src/{name}/XDS{name}/XDS{name}.tsx', () => {
    const srcDir = path.join(tmpDir, 'src');
    const nestedDir = path.join(srcDir, 'Layout', 'XDSLayout');
    fs.mkdirSync(nestedDir, {recursive: true});
    fs.writeFileSync(path.join(nestedDir, 'XDSLayout.tsx'), '');

    const result = findComponentSource(tmpDir, 'Layout');
    expect(result).toBe(path.join(nestedDir, 'XDSLayout.tsx'));
  });

  it('finds deep fallback: src/*/*/XDS{name}.tsx', () => {
    const srcDir = path.join(tmpDir, 'src');
    const deepDir = path.join(srcDir, 'Layout', 'Container');
    fs.mkdirSync(deepDir, {recursive: true});
    fs.writeFileSync(path.join(deepDir, 'XDSCard.tsx'), '');

    const result = findComponentSource(tmpDir, 'Card');
    expect(result).toBe(path.join(deepDir, 'XDSCard.tsx'));
  });

  it('returns null when source not found', () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    expect(findComponentSource(tmpDir, 'NonExistent')).toBeNull();
  });
});
