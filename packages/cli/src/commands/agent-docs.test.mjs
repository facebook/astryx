import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  generateCompressedIndex,
  getXdsVersion,
  installAgentDocs,
  injectAgentsMd,
  injectClaudeMd,
  injectXdsBlock,
  removeAgentDocs,
  removeXdsBlock,
} from './agent-docs.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-agent-docs-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('generateCompressedIndex', () => {
  it('includes the version number', () => {
    const result = generateCompressedIndex('1.2.3');
    expect(result).toContain('[XDS v1.2.3]');
    expect(result).toContain('<!-- XDS:START -->');
    expect(result).toContain('<!-- XDS:END -->');
  });

  it('does not include theme command references', () => {
    const result = generateCompressedIndex('1.0.0');
    expect(result).not.toContain('npx xds theme');
  });

  it('includes upgrade command and migration rule', () => {
    const result = generateCompressedIndex('1.0.0');
    expect(result).toContain('npx xds upgrade');
    expect(result).toContain('npx xds upgrade --apply');
    expect(result).toContain('ALWAYS run npx xds upgrade --apply to migrate breaking API changes');
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

    const result = injectXdsBlock(filePath, '<!-- XDS:START -->\nnew\n<!-- XDS:END -->');

    expect(result).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('# Existing content');
    expect(content).toContain('<!-- XDS:START -->');
  });

  it('replaces existing markers', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, 'before\n<!-- XDS:START -->\nold\n<!-- XDS:END -->\nafter\n');

    injectXdsBlock(filePath, '<!-- XDS:START -->\nnew\n<!-- XDS:END -->');

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('new');
    expect(content).not.toContain('old');
    expect(content).toContain('before');
    expect(content).toContain('after');
  });

  it('returns false and does not create file when createIfMissing is false', () => {
    const filePath = path.join(tmpDir, 'nonexistent.md');

    const result = injectXdsBlock(filePath, '<!-- XDS:START -->\ncontent\n<!-- XDS:END -->');

    expect(result).toBe(false);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('creates file when createIfMissing is true', () => {
    const filePath = path.join(tmpDir, 'new.md');

    const result = injectXdsBlock(filePath, '<!-- XDS:START -->\ncontent\n<!-- XDS:END -->', {
      createIfMissing: true,
      header: '# Header',
    });

    expect(result).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('# Header');
    expect(content).toContain('<!-- XDS:START -->');
  });
});

describe('injectAgentsMd', () => {
  it('creates new AGENTS.md when none exists', () => {
    injectAgentsMd(tmpDir, '1.0.0');

    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('# AGENTS.md');
    expect(content).toContain('<!-- XDS:START -->');
    expect(content).toContain('[XDS v1.0.0]');
    expect(content).toContain('<!-- XDS:END -->');
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
    expect(content).toContain('[XDS v2.0.0]');
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
    expect(content).toContain('<!-- XDS:START -->');
    expect(content).toContain('[XDS v1.0.0]');
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
    expect(content).toContain('<!-- XDS:START -->');
    expect(content).toContain('[XDS v1.0.0]');
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
    expect(content).toContain('[XDS v2.0.0]');
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
    // Create a minimal @xds/core so getXdsVersion works
    const coreDir = path.join(dir, 'node_modules', '@xds', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({version}),
    );
  }

  it('creates AGENTS.md when neither file exists', () => {
    setupCorePackage(tmpDir);

    installAgentDocs(tmpDir);

    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(false);
  });

  it('injects into CLAUDE.md and skips creating AGENTS.md when only CLAUDE.md exists', () => {
    setupCorePackage(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n\nProject rules.\n');

    installAgentDocs(tmpDir);

    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
    const claudeContent = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(claudeContent).toContain('<!-- XDS:START -->');
    expect(claudeContent).toContain('Project rules.');
  });

  it('injects into both when both files exist', () => {
    setupCorePackage(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents\n\nAgent rules.\n');
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n\nClaude rules.\n');

    installAgentDocs(tmpDir);

    const agentsContent = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    const claudeContent = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(agentsContent).toContain('<!-- XDS:START -->');
    expect(claudeContent).toContain('<!-- XDS:START -->');
  });
});
