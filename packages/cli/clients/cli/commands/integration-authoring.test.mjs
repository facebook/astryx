// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;

function parseEnvelope(stdout) {
  return JSON.parse(stdout.trim());
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-integration-authoring-cli-'),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify({
      name: '@acme/widgets',
      version: '1.0.0',
      files: [],
    })}\n`,
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration authoring CLI', () => {
  it('dry-runs and writes through the same generic add command', async () => {
    const planned = await runCli(
      ['integration', 'add', 'component', 'AcmeWidget', '--dry-run', '--json'],
      tmpDir,
    );
    expect(planned.status).toBe(0);
    const plan = parseEnvelope(planned.stdout);
    expect(plan).toMatchObject({
      type: 'integration.add',
      data: {
        kind: 'component',
        name: 'AcmeWidget',
        written: false,
        dryRun: true,
      },
    });
    expect(fs.existsSync(path.join(tmpDir, 'components'))).toBe(false);

    const written = await runCli(
      ['integration', 'add', 'component', 'AcmeWidget', '--json'],
      tmpDir,
    );
    expect(written.status).toBe(0);
    const receipt = parseEnvelope(written.stdout);
    expect(receipt).toMatchObject({
      type: 'integration.add',
      data: {
        kind: 'component',
        name: 'AcmeWidget',
        root: {path: './components', created: true},
        manifest: 'astryx.integration.mjs',
        written: true,
        dryRun: false,
      },
    });
    expect(receipt.data.files).toEqual(plan.data.files);
  });

  it('makes generated contributions visible without publishing or a config', async () => {
    for (const args of [
      ['component', 'AcmeWidget'],
      ['doc', 'local-guide'],
      ['template', 'local-page'],
      ['theme', 'ocean'],
    ]) {
      const added = await runCli(
        ['integration', 'add', ...args, '--json'],
        tmpDir,
      );
      expect(added.status).toBe(0);
    }

    const components = parseEnvelope(
      (await runCli(['component', '--list', '--json'], tmpDir)).stdout,
    );
    expect(
      Object.values(components.data.components)
        .flat()
        .some(
          component =>
            component.name === 'AcmeWidget' &&
            component.package === '@acme/widgets',
        ),
    ).toBe(true);

    const docs = parseEnvelope(
      (await runCli(['docs', 'local-guide', '--json'], tmpDir)).stdout,
    );
    expect(docs.data).toMatchObject({
      name: 'local-guide',
    });

    const templates = parseEnvelope(
      (await runCli(['template', '--list', '--json'], tmpDir)).stdout,
    );
    expect(templates.data).toContainEqual(
      expect.objectContaining({
        id: 'local-page',
        package: '@acme/widgets',
      }),
    );

    const themes = parseEnvelope(
      (await runCli(['theme', 'list', '--json'], tmpDir)).stdout,
    );
    expect(themes.data).toContainEqual(
      expect.objectContaining({slug: 'ocean', package: '@acme/widgets'}),
    );
  });

  it('packs the generated contribution and proves the consumer inventory', async () => {
    const added = await runCli(
      ['integration', 'add', 'component', 'AcmeWidget', '--json'],
      tmpDir,
    );
    expect(added.status).toBe(0);

    const checked = await runCli(
      ['integration', 'pack', '--check', '--json'],
      tmpDir,
    );
    expect(checked.status).toBe(0);
    expect(parseEnvelope(checked.stdout)).toMatchObject({
      type: 'integration.pack-check',
      data: {
        name: '@acme/widgets',
        version: '1.0.0',
        packable: true,
        contributions: {
          local: {components: ['AcmeWidget']},
          packed: {components: ['AcmeWidget']},
        },
      },
    });
  });

  it('requires the explicit --check gate on pack', async () => {
    const result = await runCli(['integration', 'pack', '--json'], tmpDir);
    expect(result.status).not.toBe(0);
    expect(parseEnvelope(result.stdout)).toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
      error: 'Pass --check to verify the integration tarball.',
    });
  });

  it('refuses kind-specific options on another kind', async () => {
    const result = await runCli(
      [
        'integration',
        'add',
        'component',
        'AcmeWidget',
        '--to',
        '1.0.0',
        '--json',
      ],
      tmpDir,
    );
    expect(result.status).not.toBe(0);
    expect(parseEnvelope(result.stdout)).toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
      error: 'Option "to" does not apply to integration kind "component".',
    });
  });
});
