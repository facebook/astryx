// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  generateCompressedIndex,
  detectStylingSystem,
  getXdsVersion,
  installAgentDocs,
  injectAgentsMd,
  injectClaudeMd,
  injectXdsBlock,
  removeAgentDocs,
  removeXdsBlock,
  discoverAgentDocs,
  resolveAgentPaths,
  parseBlockVersion,
  inspectAgentDocs,
  isAstryxInitialized,
} from './agent-docs.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-agent-docs-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('generateCompressedIndex', () => {
  it('includes the version number', () => {
    const result = generateCompressedIndex('1.2.3');
    expect(result).toContain('Astryx v1.2.3');
    expect(result).toContain('<!-- ASTRYX:START -->');
    expect(result).toContain('<!-- ASTRYX:END -->');
  });

  it('includes theme nudge rule', () => {
    const result = generateCompressedIndex('1.0.0');
    expect(result).toMatch(/astryx theme/);
    expect(result).toMatch(/never override --color-/);
  });

  it('sends frame choice to the layout doc rather than naming a shell', () => {
    const result = generateCompressedIndex('1.0.0');
    const frameRule = result.split('\n').find(l => l.includes('Frame first'));
    expect(frameRule).toContain('astryx docs layout');
    expect(result).not.toMatch(/AppShell/);
    expect(frameRule).not.toMatch(/https?:/);
  });

  it('includes the post-generation self-check rule', () => {
    const result = generateCompressedIndex('1.0.0');
    expect(result).toContain('SELF-CHECK before you finish');
    expect(result).toMatch(/re-read the file/);
    expect(result).toMatch(/don't hand-roll CSS/);
  });

  it('tailors the self-check to the styling system (xstyle for StyleX, not className for Tailwind)', () => {
    // StyleX path: className/inline style are veers; the fix is the xstyle prop + a token
    const stylex = generateCompressedIndex('1.0.0', {stylingSystem: 'stylex'});
    const stylexSelfCheck = stylex.split('\n').find(l => l.includes('SELF-CHECK'));
    expect(stylexSelfCheck).toMatch(/xstyle/);
    expect(stylexSelfCheck).toMatch(/className=/);
    // className IS the system in Tailwind — it must NOT be flagged
    const tailwind = generateCompressedIndex('1.0.0', {stylingSystem: 'tailwind'});
    const tailwindSelfCheck = tailwind.split('\n').find(l => l.includes('SELF-CHECK'));
    expect(tailwindSelfCheck).toBeDefined();
    expect(tailwindSelfCheck).not.toMatch(/className=/);
  });

  it('defaults to the CSS-variable styling path (no compiler)', () => {
    const result = generateCompressedIndex('1.0.0');
    expect(result).toMatch(/style\/className with tokens/);
    expect(result).toMatch(/var\(--color-\*/);
    // Must NOT push xstyle when no StyleX compiler is present.
    expect(result).not.toMatch(/xstyle prop/);
  });

  it('recommends xstyle when StyleX is configured', () => {
    const result = generateCompressedIndex('1.0.0', {stylingSystem: 'stylex'});
    expect(result).toMatch(/xstyle prop \/ StyleX tokens/);
  });

  it('recommends Tailwind utilities when Tailwind is configured', () => {
    const result = generateCompressedIndex('1.0.0', {stylingSystem: 'tailwind'});
    expect(result).toMatch(/Tailwind utilities backed by tokens/);
    expect(result).toMatch(/tailwind-theme\.css/);
  });

  it('includes upgrade command and migration rule', () => {
    const result = generateCompressedIndex('1.0.0');
    expect(result).toContain('upgrade --apply');
    expect(result).toMatch(/after any @astryxdesign\/core bump/);
  });

  it('states the invocation once in the CLI header (yarn)', () => {
    const result = generateCompressedIndex('1.0.0', {invocation: 'yarn astryx'});
    expect(result).toContain('yarn astryx <cmd>');
    expect(result).not.toContain('npx astryx');
  });

  it('uses the pnpm exec invocation', () => {
    const result = generateCompressedIndex('1.0.0', {invocation: 'pnpm exec astryx'});
    expect(result).toContain('pnpm exec astryx <cmd>');
    expect(result).not.toContain('npx astryx');
  });

  it('uses the scoped package for one-off (uninstalled) runs so agents never hit the bare name', () => {
    const result = generateCompressedIndex('1.0.0', {invocation: 'npx @astryxdesign/cli'});
    expect(result).toContain('npx @astryxdesign/cli <cmd>');
    // The header defines the mapping; the bare "run every command as `npx astryx`" footgun must be absent.
    expect(result).not.toContain('npx astryx <cmd>');
  });

  /** The `docs <topic>  a, b, c` line of the block. */
  function topicLine(block) {
    return (
      block.split('\n').find(line => line.trimStart().startsWith('docs <topic>')) ?? ''
    );
  }

  it('names the hyphenated topics, which the scan used to drop', () => {
    // The fallback scan matched `\w+`, which does not match `-`, so five real
    // topics were missing from every block ever written. An agent cannot ask
    // for a topic it was never told about, and `getting-started` — the one it
    // should reach for first — was one of them.
    const line = topicLine(generateCompressedIndex('1.0.0'));
    for (const topic of [
      'getting-started',
      'cli-integrations',
      'browser-support',
      'styling-libraries',
      'working-with-ai',
    ]) {
      expect(line).toContain(topic);
    }
  });

  it('lists the topics it is given, so an integration’s reach the agent', () => {
    const line = topicLine(
      generateCompressedIndex('1.0.0', {topics: ['tokens', 'deploying']}),
    );
    expect(line).toContain('tokens, deploying');
    // The project's catalog replaces the built-in scan rather than adding to it:
    // a topic an integration replaced must not also be listed under its old name.
    expect(line).not.toContain('typography');
  });

  it('omits the line entirely when the project has no topics', () => {
    expect(topicLine(generateCompressedIndex('1.0.0', {topics: []}))).toBe('');
  });
});

describe('detectStylingSystem', () => {
  function writePkg(deps) {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'x', devDependencies: deps}),
    );
  }

  it('defaults to css when no package.json', () => {
    expect(detectStylingSystem(tmpDir)).toBe('css');
  });

  it('returns css for a plain project', () => {
    writePkg({react: '19.0.0', vite: '6.0.0'});
    expect(detectStylingSystem(tmpDir)).toBe('css');
  });

  it('detects stylex when the compiler plugin is present', () => {
    writePkg({'@stylexjs/babel-plugin': '0.0.1'});
    expect(detectStylingSystem(tmpDir)).toBe('stylex');
  });

  it('detects tailwind when tailwindcss is present', () => {
    writePkg({tailwindcss: '4.0.0'});
    expect(detectStylingSystem(tmpDir)).toBe('tailwind');
  });

  it('does NOT treat the StyleX runtime alone as a compiler', () => {
    // Only the runtime, no compiler plugin → must stay on the safe css path.
    writePkg({'@stylexjs/stylex': '0.0.1'});
    expect(detectStylingSystem(tmpDir)).toBe('css');
  });

  it('prefers stylex over tailwind when both are configured', () => {
    writePkg({'@stylexjs/babel-plugin': '0.0.1', tailwindcss: '4.0.0'});
    expect(detectStylingSystem(tmpDir)).toBe('stylex');
  });
});

describe('getXdsVersion', () => {
  it('reads version from core package.json', () => {
    const coreDir = path.join(tmpDir, 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({version: '3.4.5'}),
    );

    expect(getXdsVersion(coreDir)).toBe('3.4.5');
  });
});

describe('injectXdsBlock', () => {
  it('injects into an existing file without markers', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, '# Existing content\n');

    const result = injectXdsBlock(filePath, '<!-- ASTRYX:START -->\nnew\n<!-- ASTRYX:END -->');

    expect(result).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('# Existing content');
    expect(content).toContain('<!-- ASTRYX:START -->');
  });

  it('replaces existing markers', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, 'before\n<!-- XDS:START -->\nold\n<!-- XDS:END -->\nafter\n');

    injectXdsBlock(filePath, '<!-- ASTRYX:START -->\nnew\n<!-- ASTRYX:END -->');

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('new');
    expect(content).not.toContain('old');
    expect(content).toContain('before');
    expect(content).toContain('after');
  });

  it('returns false and does not create file when createIfMissing is false', () => {
    const filePath = path.join(tmpDir, 'nonexistent.md');

    const result = injectXdsBlock(filePath, '<!-- ASTRYX:START -->\ncontent\n<!-- ASTRYX:END -->');

    expect(result).toBe(false);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('skips files without markers when onlyReplace is true', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, '# Existing content\n\nNo XDS markers here.\n');

    const result = injectXdsBlock(filePath, '<!-- ASTRYX:START -->\nnew\n<!-- ASTRYX:END -->', {onlyReplace: true});

    expect(result).toBe(false);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('<!-- ASTRYX:START -->');
    expect(content).toBe('# Existing content\n\nNo XDS markers here.\n');
  });

  it('replaces existing markers even when onlyReplace is true', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, 'before\n<!-- XDS:START -->\nold\n<!-- XDS:END -->\nafter\n');

    const result = injectXdsBlock(filePath, '<!-- ASTRYX:START -->\nnew\n<!-- ASTRYX:END -->', {onlyReplace: true});

    expect(result).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('new');
    expect(content).not.toContain('old');
  });

  it('creates file when createIfMissing is true', () => {
    const filePath = path.join(tmpDir, 'new.md');

    const result = injectXdsBlock(filePath, '<!-- ASTRYX:START -->\ncontent\n<!-- ASTRYX:END -->', {
      createIfMissing: true,
      header: '# Header',
    });

    expect(result).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('# Header');
    expect(content).toContain('<!-- ASTRYX:START -->');
  });
});

describe('injectAgentsMd', () => {
  it('creates new AGENTS.md when none exists', () => {
    injectAgentsMd(tmpDir, '1.0.0');

    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('# AGENTS.md');
    expect(content).toContain('<!-- ASTRYX:START -->');
    expect(content).toContain('Astryx v1.0.0');
    expect(content).toContain('<!-- ASTRYX:END -->');
  });

  it('updates existing AGENTS.md by replacing XDS markers', () => {
    const existing = `# My Project

Some content.

<!-- XDS:START -->
old content
<!-- XDS:END -->

More stuff.
`;
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), existing);

    injectAgentsMd(tmpDir, '2.0.0');

    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('Astryx v2.0.0');
    expect(content).not.toContain('old content');
    expect(content).toContain('Some content.');
    expect(content).toContain('More stuff.');
  });

  it('appends to existing AGENTS.md without markers', () => {
    const existing = `# My Project

Existing agent docs.
`;
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), existing);

    injectAgentsMd(tmpDir, '1.0.0');

    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('Existing agent docs.');
    expect(content).toContain('<!-- ASTRYX:START -->');
    expect(content).toContain('Astryx v1.0.0');
  });
});

describe('injectClaudeMd', () => {
  it('injects into existing CLAUDE.md', () => {
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude Config\n\nExisting rules.\n');

    const result = injectClaudeMd(tmpDir, '1.0.0');

    expect(result).toBe(true);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('# Claude Config');
    expect(content).toContain('Existing rules.');
    expect(content).toContain('<!-- ASTRYX:START -->');
    expect(content).toContain('Astryx v1.0.0');
  });

  it('does not create CLAUDE.md when it does not exist', () => {
    const result = injectClaudeMd(tmpDir, '1.0.0');

    expect(result).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(false);
  });

  it('updates existing markers in CLAUDE.md', () => {
    const existing = `# Claude Config

<!-- XDS:START -->
old content
<!-- XDS:END -->

Other rules.
`;
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), existing);

    injectClaudeMd(tmpDir, '2.0.0');

    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('Astryx v2.0.0');
    expect(content).not.toContain('old content');
    expect(content).toContain('Other rules.');
  });
});

describe('removeAgentDocs', () => {
  it('removes XDS section from AGENTS.md', () => {
    const content = `# My Project

Custom content here.

<!-- XDS:START -->
XDS index stuff
<!-- XDS:END -->

More custom content.
`;
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), content);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    removeAgentDocs(tmpDir);

    const result = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(result).toContain('Custom content here.');
    expect(result).toContain('More custom content.');
    expect(result).not.toContain('<!-- XDS:START -->');
    expect(result).not.toContain('XDS index stuff');
  });

  it('removes the file entirely when only XDS content remains', () => {
    const content = `# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- XDS:START -->
XDS index stuff
<!-- XDS:END -->
`;
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), content);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    removeAgentDocs(tmpDir);

    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
  });

  it('removes XDS section from CLAUDE.md when present', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      '# AGENTS.md\n\n<!-- XDS:START -->\nstuff\n<!-- XDS:END -->\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'CLAUDE.md'),
      '# Claude\n\nRules.\n\n<!-- XDS:START -->\nstuff\n<!-- XDS:END -->\n\nMore rules.\n',
    );
    vi.spyOn(console, 'log').mockImplementation(() => {});

    removeAgentDocs(tmpDir);

    const claudeContent = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(claudeContent).toContain('Rules.');
    expect(claudeContent).toContain('More rules.');
    expect(claudeContent).not.toContain('<!-- XDS:START -->');
  });
});

describe('installAgentDocs', () => {
  function setupCorePackage(dir, version = '1.0.0') {
    // Create a minimal @astryxdesign/core so getXdsVersion works
    const coreDir = path.join(dir, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({version}),
    );
  }

  it('creates AGENTS.md when no agent docs exist (tool-agnostic default)', () => {
    setupCorePackage(tmpDir);

    const written = installAgentDocs(tmpDir);

    expect(written).toEqual(['AGENTS.md']);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
    // Must NOT create the Claude-specific file by default.
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(false);
    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('# AGENTS.md');
    expect(content).toContain('<!-- ASTRYX:START -->');
  });

  it('defaults to AGENTS.md but writes .claude/CLAUDE.md only when --agent claude is explicit', () => {
    // Default (no agent): tool-agnostic AGENTS.md, never the Claude file.
    setupCorePackage(tmpDir);
    expect(installAgentDocs(tmpDir)).toEqual(['AGENTS.md']);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(false);

    // Explicit Claude: the Claude-specific file, in a fresh project.
    const claudeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-agent-docs-claude-'));
    setupCorePackage(claudeDir);
    try {
      expect(installAgentDocs(claudeDir, {agent: 'claude'})).toEqual(['.claude/CLAUDE.md']);
      expect(fs.existsSync(path.join(claudeDir, 'AGENTS.md'))).toBe(false);
    } finally {
      fs.rmSync(claudeDir, {recursive: true, force: true});
    }
  });

  it('injects into CLAUDE.md at root when it exists', () => {
    setupCorePackage(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n\nProject rules.\n');

    const written = installAgentDocs(tmpDir);

    expect(written).toEqual(['CLAUDE.md']);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
    const claudeContent = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(claudeContent).toContain('<!-- ASTRYX:START -->');
    expect(claudeContent).toContain('Project rules.');
  });

  it('injects into all existing agent doc files', () => {
    setupCorePackage(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents\n\nAgent rules.\n');
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n\nClaude rules.\n');

    const written = installAgentDocs(tmpDir);

    expect(written).toContain('AGENTS.md');
    expect(written).toContain('CLAUDE.md');
    const agentsContent = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    const claudeContent = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(agentsContent).toContain('<!-- ASTRYX:START -->');
    expect(claudeContent).toContain('<!-- ASTRYX:START -->');
  });

  it('updates existing .claude/CLAUDE.md', () => {
    setupCorePackage(tmpDir);
    fs.mkdirSync(path.join(tmpDir, '.claude'), {recursive: true});
    fs.writeFileSync(path.join(tmpDir, '.claude', 'CLAUDE.md'), '# Project\n\nExisting content.\n');

    const written = installAgentDocs(tmpDir);

    expect(written).toEqual(['.claude/CLAUDE.md']);
    const content = fs.readFileSync(path.join(tmpDir, '.claude', 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('Existing content.');
    expect(content).toContain('<!-- ASTRYX:START -->');
  });

  it('respects --agent claude preset: finds existing CLAUDE.md', () => {
    setupCorePackage(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n\nRules.\n');

    const written = installAgentDocs(tmpDir, {agent: 'claude'});

    expect(written).toEqual(['CLAUDE.md']);
  });

  it('respects --agent claude preset: creates .claude/CLAUDE.md when nothing exists', () => {
    setupCorePackage(tmpDir);

    const written = installAgentDocs(tmpDir, {agent: 'claude'});

    expect(written).toEqual(['.claude/CLAUDE.md']);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(true);
  });

  it('respects --agent codex preset: creates AGENTS.md', () => {
    setupCorePackage(tmpDir);

    const written = installAgentDocs(tmpDir, {agent: 'codex'});

    expect(written).toEqual(['AGENTS.md']);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
  });

  it('respects --agent hermes preset: creates AGENTS.md', () => {
    setupCorePackage(tmpDir);

    const written = installAgentDocs(tmpDir, {agent: 'hermes'});

    expect(written).toEqual(['AGENTS.md']);
    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('<!-- ASTRYX:START -->');
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(false);
  });

  it('respects explicit --paths', () => {
    setupCorePackage(tmpDir);

    const written = installAgentDocs(tmpDir, {paths: ['custom/AGENT.md']});

    expect(written).toEqual(['custom/AGENT.md']);
    expect(fs.existsSync(path.join(tmpDir, 'custom', 'AGENT.md'))).toBe(true);
  });

  it('onlyReplace: skips files without XDS markers', () => {
    setupCorePackage(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n\nProject rules only.\n');

    const written = installAgentDocs(tmpDir, {onlyReplace: true});

    expect(written).toEqual([]);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(content).not.toContain('<!-- ASTRYX:START -->');
    expect(content).toBe('# Claude\n\nProject rules only.\n');
  });

  it('onlyReplace: updates files that have XDS markers', () => {
    setupCorePackage(tmpDir, '2.0.0');
    fs.writeFileSync(
      path.join(tmpDir, 'CLAUDE.md'),
      '# Claude\n\n<!-- XDS:START -->\nPLACEHOLDER_STALE_CONTENT\n<!-- XDS:END -->\n\nOther rules.\n',
    );

    const written = installAgentDocs(tmpDir, {onlyReplace: true});

    expect(written).toEqual(['CLAUDE.md']);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('Astryx v2.0.0');
    expect(content).not.toContain('PLACEHOLDER_STALE_CONTENT');
    expect(content).toContain('Other rules.');
  });

  it('onlyReplace: does not create the default AGENTS.md when nothing exists', () => {
    setupCorePackage(tmpDir);

    const written = installAgentDocs(tmpDir, {onlyReplace: true});

    expect(written).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(false);
  });
});

describe('discoverAgentDocs', () => {
  it('finds AGENTS.md and CLAUDE.md at root', () => {
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '');
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '');

    const found = discoverAgentDocs(tmpDir);

    expect(found).toContain('AGENTS.md');
    expect(found).toContain('CLAUDE.md');
  });

  it('finds .claude/CLAUDE.md', () => {
    fs.mkdirSync(path.join(tmpDir, '.claude'), {recursive: true});
    fs.writeFileSync(path.join(tmpDir, '.claude', 'CLAUDE.md'), '');

    const found = discoverAgentDocs(tmpDir);

    expect(found).toContain('.claude/CLAUDE.md');
  });

  it('returns empty when nothing exists', () => {
    expect(discoverAgentDocs(tmpDir)).toEqual([]);
  });
});

describe('resolveAgentPaths', () => {
  it('claude preset finds existing CLAUDE.md at root', () => {
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '');
    const result = resolveAgentPaths(tmpDir, 'claude');
    expect(result).toEqual({inject: ['CLAUDE.md'], create: []});
  });

  it('claude preset falls back to .claude/CLAUDE.md', () => {
    const result = resolveAgentPaths(tmpDir, 'claude');
    expect(result).toEqual({inject: [], create: ['.claude/CLAUDE.md']});
  });

  it('all preset discovers existing files', () => {
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '');
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '');
    const result = resolveAgentPaths(tmpDir, 'all');
    expect(result.inject).toContain('AGENTS.md');
    expect(result.inject).toContain('CLAUDE.md');
    expect(result.create).toEqual([]);
  });

  it('all preset creates defaults when nothing exists', () => {
    const result = resolveAgentPaths(tmpDir, 'all');
    expect(result.inject).toEqual([]);
    expect(result.create).toContain('AGENTS.md');
    expect(result.create).toContain('.claude/CLAUDE.md');
  });

  it('hermes preset creates AGENTS.md when nothing exists', () => {
    const result = resolveAgentPaths(tmpDir, 'hermes');
    expect(result).toEqual({inject: [], create: ['AGENTS.md']});
  });

  it('hermes preset finds existing .hermes.md', () => {
    fs.writeFileSync(path.join(tmpDir, '.hermes.md'), '');
    const result = resolveAgentPaths(tmpDir, 'hermes');
    expect(result).toEqual({inject: ['.hermes.md'], create: []});
  });

  it('hermes preset finds existing HERMES.md when no .hermes.md', () => {
    fs.writeFileSync(path.join(tmpDir, 'HERMES.md'), '');
    const result = resolveAgentPaths(tmpDir, 'hermes');
    expect(result).toEqual({inject: ['HERMES.md'], create: []});
  });

  it('claude preset still creates .claude/CLAUDE.md when nothing exists (hermes is additive)', () => {
    const result = resolveAgentPaths(tmpDir, 'claude');
    expect(result).toEqual({inject: [], create: ['.claude/CLAUDE.md']});
  });
});

describe('parseBlockVersion', () => {
  it('reads the version from the header of a generated block', () => {
    expect(parseBlockVersion(generateCompressedIndex('1.2.3'))).toBe('1.2.3');
  });

  it('reads prerelease versions', () => {
    expect(parseBlockVersion('Astryx v1.2.3-beta.4 · 10 components')).toBe(
      '1.2.3-beta.4',
    );
  });

  it('returns null when no versioned header is present', () => {
    expect(parseBlockVersion('<!-- XDS:START -->\nold\n<!-- XDS:END -->')).toBeNull();
    expect(parseBlockVersion('')).toBeNull();
    expect(parseBlockVersion(undefined)).toBeNull();
  });
});

describe('inspectAgentDocs', () => {
  function writeBlock(rel, version) {
    const filePath = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, `# Doc\n\n${generateCompressedIndex(version)}\n`);
  }

  it('reports missing when no agent docs exist at all', () => {
    const res = inspectAgentDocs(tmpDir, '1.0.0');
    expect(res.status).toBe('missing');
    expect(res.files).toEqual([]);
    expect(res.staleFiles).toEqual([]);
  });

  it('reports missing when agent files exist but carry no Astryx marker', () => {
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents\n\nHand-written notes.\n');
    expect(inspectAgentDocs(tmpDir, '1.0.0').status).toBe('missing');
  });

  it('reports current when the only block matches the installed version', () => {
    writeBlock('AGENTS.md', '1.0.0');
    const res = inspectAgentDocs(tmpDir, '1.0.0');
    expect(res.status).toBe('current');
    expect(res.staleFiles).toEqual([]);
    expect(res.blockVersions).toEqual([]);
  });

  it('reports stale (with the old version) when the block is behind', () => {
    writeBlock('AGENTS.md', '1.0.0');
    const res = inspectAgentDocs(tmpDir, '2.0.0');
    expect(res.status).toBe('stale');
    expect(res.staleFiles).toEqual(['AGENTS.md']);
    expect(res.blockVersions).toEqual(['1.0.0']);
    expect(res.installedVersion).toBe('2.0.0');
  });

  it('treats a legacy XDS block as stale even with no parseable version', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'CLAUDE.md'),
      '# Claude\n\n<!-- XDS:START -->\nlegacy index\n<!-- XDS:END -->\n',
    );
    const res = inspectAgentDocs(tmpDir, '1.0.0');
    expect(res.status).toBe('stale');
    expect(res.files[0].legacy).toBe(true);
    expect(res.blockVersions).toEqual([]);
  });

  it('is stale if ANY marked file is behind (mixed current + stale)', () => {
    writeBlock('AGENTS.md', '2.0.0');
    writeBlock('CLAUDE.md', '1.0.0');
    const res = inspectAgentDocs(tmpDir, '2.0.0');
    expect(res.status).toBe('stale');
    expect(res.staleFiles).toEqual(['CLAUDE.md']);
  });

  it('defaults the installed version to the core package when omitted', () => {
    const coreDir = path.join(tmpDir, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(path.join(coreDir, 'package.json'), JSON.stringify({version: '3.0.0'}));
    writeBlock('AGENTS.md', '3.0.0');
    const res = inspectAgentDocs(tmpDir);
    expect(res.installedVersion).toBe('3.0.0');
    expect(res.status).toBe('current');
  });
});

describe('injectXdsBlock / removeXdsBlock — malformed managed blocks (no user-content loss)', () => {
  const S = '<!-- ASTRYX:START -->';
  const E = '<!-- ASTRYX:END -->';
  const BLOCK = `${S}\nNEW\n${E}`;

  it('does not duplicate user content when END precedes START', () => {
    const f = path.join(tmpDir, 'a.md');
    fs.writeFileSync(f, `# Doc\nUSER-A\n${E}\nUSER-B\n${S}\nUSER-C\n`);
    removeXdsBlock(f);
    const c = fs.readFileSync(f, 'utf-8');
    expect((c.match(/USER-B/g) || []).length).toBeLessThanOrEqual(1);
  });

  it('refuses (throws) instead of orphaning a second block when duplicates exist', () => {
    const f = path.join(tmpDir, 'b.md');
    fs.writeFileSync(f, `# Doc\n${S}\nB1\n${E}\nMID\n${S}\nB2\n${E}\nTAIL\n`);
    expect(() => injectXdsBlock(f, BLOCK)).toThrow(/multiple|malformed/i);
    // file left untouched for the user to fix
    expect(fs.readFileSync(f, 'utf-8')).toContain('MID');
    expect(fs.readFileSync(f, 'utf-8')).toContain('TAIL');
  });

  it('refuses to append a second block when a START has no matching END', () => {
    const f = path.join(tmpDir, 'c.md');
    fs.writeFileSync(f, `# Doc\nUSER1\n${S}\nOLD (no end)\nUSER2\n`);
    expect(() => injectXdsBlock(f, BLOCK)).toThrow(/end marker|malformed|no matching/i);
    expect((fs.readFileSync(f, 'utf-8').match(/ASTRYX:START/g) || []).length).toBe(1);
  });

  it('replaces a single well-formed block idempotently, preserving surrounding content', () => {
    const f = path.join(tmpDir, 'ok.md');
    fs.writeFileSync(f, `# Doc\nUSER\n${S}\nOLD\n${E}\nTAIL\n`);
    injectXdsBlock(f, BLOCK);
    const c = fs.readFileSync(f, 'utf-8');
    expect((c.match(/ASTRYX:START/g) || []).length).toBe(1);
    expect(c).toContain('NEW');
    expect(c).toContain('USER');
    expect(c).toContain('TAIL');
    expect(c).not.toContain('OLD');
  });
});

describe('isAstryxInitialized — resilient to malformed markers (postinstall hot path)', () => {
  // isAstryxInitialized runs on every consumer `npm install` (via postinstall).
  // It must never throw — even on a half-written or garbage-marker file — so it
  // uses a plain `.includes(MARKER_START)`, never the strict findManagedBlock.
  const START = '<!-- ASTRYX:START -->';
  const END = '<!-- ASTRYX:END -->';

  it('returns true (never throws) on duplicate START markers', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      `${START}\na\n${START}\nb\n${END}\n`,
    );
    expect(() => isAstryxInitialized(tmpDir)).not.toThrow();
    expect(isAstryxInitialized(tmpDir)).toBe(true);
  });

  it('returns true on an END-before-START file without throwing', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      `${END}\nuser\n${START}\nblock\n`,
    );
    expect(() => isAstryxInitialized(tmpDir)).not.toThrow();
    expect(isAstryxInitialized(tmpDir)).toBe(true);
  });

  it('returns true on a START with no END (half-written block)', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      `# Doc\nuser\n${START}\ntruncated block, no end\n`,
    );
    expect(() => isAstryxInitialized(tmpDir)).not.toThrow();
    expect(isAstryxInitialized(tmpDir)).toBe(true);
  });

  it('returns false for a directory with no agent docs', () => {
    expect(isAstryxInitialized(tmpDir)).toBe(false);
  });

  it('returns false for a nonexistent directory', () => {
    expect(isAstryxInitialized(path.join(tmpDir, 'does-not-exist'))).toBe(false);
  });
});
