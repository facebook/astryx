import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  discoverComponents,
  discoverExternalComponents,
  findExternalComponentDoc,
  cleanReadme,
  extractCompact,
  extractProps,
  findComponentReadme,
  findComponentSource,
  levenshteinDistance,
  findClosestComponents,
} from './component/index.mjs';

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

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('button', 'button')).toBe(0);
  });

  it('returns correct distance for single edit', () => {
    expect(levenshteinDistance('button', 'buton')).toBe(1);
  });

  it('returns correct distance for multiple edits', () => {
    expect(levenshteinDistance('button', 'butan')).toBe(2);
  });

  it('handles empty strings', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('handles completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });
});

describe('findClosestComponents', () => {
  const components = {
    Action: ['Button', 'CloseButton', 'Link'],
    Form: ['TextInput', 'CheckboxInput', 'Switch'],
    Display: ['Avatar', 'Badge', 'Text'],
  };

  it('finds exact match (distance 0)', () => {
    const matches = findClosestComponents('Button', components);
    expect(matches[0]).toEqual({name: 'Button', distance: 0});
  });

  it('finds close match for misspelling', () => {
    const matches = findClosestComponents('buton', components);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].name).toBe('Button');
    expect(matches[0].distance).toBe(1);
  });

  it('is case-insensitive', () => {
    const matches = findClosestComponents('BUTTON', components);
    expect(matches[0]).toEqual({name: 'Button', distance: 0});
  });

  it('returns empty array for no close matches', () => {
    const matches = findClosestComponents('zzzzzzzzz', components);
    expect(matches).toEqual([]);
  });

  it('returns multiple matches when ambiguous', () => {
    // "Buttn" is close to both "Button" (distance 1) and could be near others
    const matches = findClosestComponents('Butten', components);
    // Should match at least Button
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].name).toBe('Button');
    // With maxDistance=3, "Badge" (distance 5) won't match,
    // but let's verify multiple matches with a wider net
    const wideMatches = findClosestComponents('Butten', components, 5);
    expect(wideMatches.length).toBeGreaterThan(1);
  });

  it('respects maxDistance parameter', () => {
    const matches = findClosestComponents('buton', components, 0);
    expect(matches).toEqual([]);
  });
});

describe('extractProps', () => {
  it('extracts a Props section from README content', () => {
    const input = [
      '# Button',
      '',
      '## Description',
      'A button component.',
      '',
      '## Props',
      '',
      '| Prop | Type | Default |',
      '|------|------|---------|',
      '| size | string | "md" |',
      '| variant | string | "primary" |',
      '',
      '## Examples',
      'Some examples here.',
    ].join('\n');

    const result = extractProps(input, 'Button');
    expect(result).toContain('## Props');
    expect(result).toContain('| size | string | "md" |');
    expect(result).toContain('| variant | string | "primary" |');
    expect(result).not.toContain('## Description');
    expect(result).not.toContain('## Examples');
  });

  it('extracts multiple Props sections', () => {
    const input = [
      '# Layout',
      '',
      '## XDSLayout Props',
      '| Prop | Type |',
      '|------|------|',
      '| gap | number |',
      '',
      '## XDSLayoutItem Props',
      '| Prop | Type |',
      '|------|------|',
      '| flex | number |',
      '',
      '## Examples',
      'Some examples.',
    ].join('\n');

    const result = extractProps(input, 'Layout');
    expect(result).toContain('## XDSLayout Props');
    expect(result).toContain('| gap | number |');
    expect(result).toContain('## XDSLayoutItem Props');
    expect(result).toContain('| flex | number |');
    expect(result).not.toContain('## Examples');
  });

  it('returns fallback message when no Props section found', () => {
    const input = '# Button\n\n## Description\nA button.\n';
    const result = extractProps(input, 'Button');
    expect(result).toBe('No props documentation found for Button.\n');
  });

  it('trims trailing blank lines', () => {
    const input = [
      '## Props',
      '| Prop | Type |',
      '|------|------|',
      '| size | string |',
      '',
      '',
      '',
    ].join('\n');

    const result = extractProps(input, 'Button');
    expect(result).not.toMatch(/\n\n$/);
    expect(result).toMatch(/\n$/);
  });
});

describe('discoverExternalComponents', () => {
  it('finds .doc.mjs files in the docs directory', () => {
    const docsDir = path.join(tmpDir, 'src');
    const compDir = path.join(docsDir, 'Employee');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(path.join(compDir, 'EmployeeHoverCard.doc.mjs'), '');
    fs.writeFileSync(path.join(compDir, 'EmployeeLink.doc.mjs'), '');

    const result = discoverExternalComponents(docsDir);
    expect(result).toEqual(['EmployeeHoverCard', 'EmployeeLink']);
  });

  it('scans nested directories recursively', () => {
    const docsDir = path.join(tmpDir, 'src');
    const deepDir = path.join(docsDir, 'a', 'b', 'c');
    fs.mkdirSync(deepDir, {recursive: true});
    fs.writeFileSync(path.join(deepDir, 'DeepComponent.doc.mjs'), '');

    const result = discoverExternalComponents(docsDir);
    expect(result).toEqual(['DeepComponent']);
  });

  it('ignores non-.doc.mjs files', () => {
    const docsDir = path.join(tmpDir, 'src');
    fs.mkdirSync(docsDir, {recursive: true});
    fs.writeFileSync(path.join(docsDir, 'Foo.doc.mjs'), '');
    fs.writeFileSync(path.join(docsDir, 'Foo.tsx'), '');
    fs.writeFileSync(path.join(docsDir, 'README.md'), '');
    fs.writeFileSync(path.join(docsDir, 'index.mjs'), '');

    const result = discoverExternalComponents(docsDir);
    expect(result).toEqual(['Foo']);
  });

  it('skips node_modules and __tests__ directories', () => {
    const docsDir = path.join(tmpDir, 'src');
    const nmDir = path.join(docsDir, 'node_modules', 'dep');
    const testDir = path.join(docsDir, '__tests__');
    fs.mkdirSync(nmDir, {recursive: true});
    fs.mkdirSync(testDir, {recursive: true});
    fs.writeFileSync(path.join(nmDir, 'Hidden.doc.mjs'), '');
    fs.writeFileSync(path.join(testDir, 'TestOnly.doc.mjs'), '');
    fs.writeFileSync(path.join(docsDir, 'Visible.doc.mjs'), '');

    const result = discoverExternalComponents(docsDir);
    expect(result).toEqual(['Visible']);
  });

  it('returns empty array for nonexistent directory', () => {
    const result = discoverExternalComponents(path.join(tmpDir, 'nope'));
    expect(result).toEqual([]);
  });

  it('returns sorted results', () => {
    const docsDir = path.join(tmpDir, 'src');
    fs.mkdirSync(docsDir, {recursive: true});
    fs.writeFileSync(path.join(docsDir, 'Zebra.doc.mjs'), '');
    fs.writeFileSync(path.join(docsDir, 'Alpha.doc.mjs'), '');
    fs.writeFileSync(path.join(docsDir, 'Middle.doc.mjs'), '');

    const result = discoverExternalComponents(docsDir);
    expect(result).toEqual(['Alpha', 'Middle', 'Zebra']);
  });
});

describe('findExternalComponentDoc', () => {
  it('finds a doc file by component name', () => {
    const docsDir = path.join(tmpDir, 'src');
    const compDir = path.join(docsDir, 'Employee');
    fs.mkdirSync(compDir, {recursive: true});
    const docPath = path.join(compDir, 'EmployeeHoverCard.doc.mjs');
    fs.writeFileSync(docPath, '');

    const result = findExternalComponentDoc(docsDir, 'EmployeeHoverCard');
    expect(result).toBe(docPath);
  });

  it('searches nested directories', () => {
    const docsDir = path.join(tmpDir, 'src');
    const deepDir = path.join(docsDir, 'nested', 'deep');
    fs.mkdirSync(deepDir, {recursive: true});
    const docPath = path.join(deepDir, 'DeepThing.doc.mjs');
    fs.writeFileSync(docPath, '');

    const result = findExternalComponentDoc(docsDir, 'DeepThing');
    expect(result).toBe(docPath);
  });

  it('returns null when component not found', () => {
    const docsDir = path.join(tmpDir, 'src');
    fs.mkdirSync(docsDir, {recursive: true});

    const result = findExternalComponentDoc(docsDir, 'NonExistent');
    expect(result).toBeNull();
  });

  it('returns null for nonexistent directory', () => {
    const result = findExternalComponentDoc(path.join(tmpDir, 'nope'), 'Foo');
    expect(result).toBeNull();
  });

  it('skips node_modules and __tests__', () => {
    const docsDir = path.join(tmpDir, 'src');
    const nmDir = path.join(docsDir, 'node_modules', 'dep');
    fs.mkdirSync(nmDir, {recursive: true});
    fs.writeFileSync(path.join(nmDir, 'Hidden.doc.mjs'), '');

    const result = findExternalComponentDoc(docsDir, 'Hidden');
    expect(result).toBeNull();
  });
});
