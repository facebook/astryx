import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  generateCompressedIndex,
  getXdsVersion,
  injectAgentsMd,
  removeAgentDocs,
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
});
