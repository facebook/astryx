// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  createRegistryReceipt,
  registryReceiptTarget,
  serializeRegistryReceipt,
} from '../../../authoring/shadcn/receipt.mjs';
import {
  discoverRegistryReceipts,
  reconcileRegistryCompositions,
} from './registry.mjs';

const ITEM = {
  name: 'example-button-basic',
  path: 'examples/button/basic',
  aliases: [],
  kind: 'example',
};
const SOURCE_TARGET = 'components/astryx/examples/ButtonBasic.tsx';
const REGISTRY_PATH = 'registry/example-button-basic/ButtonBasic.tsx';
const RECEIPT_TARGET = registryReceiptTarget(SOURCE_TARGET, ITEM.name);

let project;
let root;

function receipt(content, overrides = {}) {
  return createRegistryReceipt({
    item: overrides.item ?? ITEM,
    sourceVersion: overrides.version ?? '0.5.0',
    receiptTarget: RECEIPT_TARGET,
    files: [
      {
        id: 'primary',
        target: SOURCE_TARGET,
        registryPath: REGISTRY_PATH,
        content,
      },
    ],
  });
}

function seed({base, current = base, receiptValue = receipt(base)}) {
  const sourcePath = path.join(root, SOURCE_TARGET);
  const receiptPath = path.join(root, RECEIPT_TARGET);
  fs.mkdirSync(path.dirname(sourcePath), {recursive: true});
  fs.mkdirSync(path.dirname(receiptPath), {recursive: true});
  if (current !== null) fs.writeFileSync(sourcePath, current, 'utf8');
  fs.writeFileSync(
    receiptPath,
    typeof receiptValue === 'string'
      ? receiptValue
      : serializeRegistryReceipt(receiptValue),
    'utf8',
  );
  return {sourcePath, receiptPath};
}

function remote(latest, overrides = {}) {
  const receiptFiles = [
    {
      id: 'primary',
      target: SOURCE_TARGET,
      registryPath: REGISTRY_PATH,
      content: latest,
    },
    ...(overrides.extraFiles ?? []),
  ];
  const nextReceipt = createRegistryReceipt({
    item: overrides.item ?? ITEM,
    sourceVersion: overrides.version ?? '0.6.0',
    receiptTarget: RECEIPT_TARGET,
    files: receiptFiles,
  });
  const item = {
    name: nextReceipt.item.name,
    type: nextReceipt.item.kind === 'page' ? 'registry:page' : 'registry:block',
    files: [
      ...receiptFiles.map(file => ({
        path: file.registryPath,
        type: 'registry:block',
        target: file.target,
        content:
          file.id === 'primary'
            ? (overrides.sourceContent ?? file.content)
            : file.content,
      })),
      {
        path: 'registry/example-button-basic/astryx-receipt.json',
        type: 'registry:file',
        target: overrides.receiptTarget ?? RECEIPT_TARGET,
        content: serializeRegistryReceipt(nextReceipt),
      },
    ],
  };
  return vi.fn(
    async () => new globalThis.Response(JSON.stringify(item), {status: 200}),
  );
}

async function reconcile(options = {}, context = {}) {
  return reconcileRegistryCompositions(
    {path: 'src', ...options},
    {cwd: project, registryOrigin: 'https://registry.example.test', ...context},
  );
}

beforeEach(() => {
  project = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-composition-upgrade-'),
  );
  root = path.join(project, 'src');
  fs.mkdirSync(root, {recursive: true});
});

afterEach(() => {
  fs.rmSync(project, {recursive: true, force: true});
});

describe('registry composition upgrades', () => {
  it('discovers only JSON receipts inside .astryx directories', () => {
    const {receiptPath} = seed({base: 'base\n'});
    fs.writeFileSync(
      path.join(path.dirname(receiptPath), 'notes.txt'),
      'ignore',
    );
    fs.mkdirSync(path.join(root, 'node_modules', 'x', '.astryx'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(root, 'node_modules', 'x', '.astryx', 'ignored.json'),
      '{}',
    );

    expect(discoverRegistryReceipts(root)).toEqual([receiptPath]);
  });

  it('bounds concurrent registry fetches', async () => {
    const remoteItems = new Map();
    for (let index = 0; index < 12; index++) {
      const item = {
        name: `example-test-${index}`,
        path: `examples/test/item-${index}`,
        aliases: [],
        kind: 'example',
      };
      const sourceTarget = `components/astryx/examples/Test${index}.tsx`;
      const registryPath = `registry/${item.name}/Test${index}.tsx`;
      const receiptTarget = registryReceiptTarget(sourceTarget, item.name);
      const installed = createRegistryReceipt({
        item,
        sourceVersion: '0.5.0',
        receiptTarget,
        files: [
          {
            id: 'primary',
            target: sourceTarget,
            registryPath,
            content: 'old\n',
          },
        ],
      });
      const latest = createRegistryReceipt({
        item,
        sourceVersion: '0.6.0',
        receiptTarget,
        files: [
          {
            id: 'primary',
            target: sourceTarget,
            registryPath,
            content: 'new\n',
          },
        ],
      });
      const sourcePath = path.join(root, sourceTarget);
      const receiptPath = path.join(root, receiptTarget);
      fs.mkdirSync(path.dirname(sourcePath), {recursive: true});
      fs.mkdirSync(path.dirname(receiptPath), {recursive: true});
      fs.writeFileSync(sourcePath, 'old\n');
      fs.writeFileSync(receiptPath, serializeRegistryReceipt(installed));
      remoteItems.set(
        `/${item.path}.json`,
        JSON.stringify({
          name: item.name,
          type: 'registry:block',
          files: [
            {
              path: registryPath,
              type: 'registry:block',
              target: sourceTarget,
              content: 'new\n',
            },
            {
              path: `registry/${item.name}/astryx-receipt.json`,
              type: 'registry:file',
              target: receiptTarget,
              content: serializeRegistryReceipt(latest),
            },
          ],
        }),
      );
    }

    let active = 0;
    let maximum = 0;
    const fetchImpl = vi.fn(async url => {
      active++;
      maximum = Math.max(maximum, active);
      await new Promise(resolve => setTimeout(resolve, 5));
      active--;
      const body = remoteItems.get(new URL(url).pathname);
      return new globalThis.Response(body ?? 'not found', {
        status: body ? 200 : 404,
      });
    });
    const result = await reconcile({}, {fetchImpl});

    expect(result.summary).toMatchObject({found: 12, wouldUpdate: 12});
    expect(maximum).toBe(8);
  });

  it('reports a current pristine source without writing', async () => {
    const {sourcePath, receiptPath} = seed({base: 'same\n'});
    const before = fs.readFileSync(receiptPath, 'utf8');
    const result = await reconcile(
      {},
      {fetchImpl: remote('same\n', {version: '0.5.0'})},
    );

    expect(result.summary).toMatchObject({
      applied: false,
      found: 1,
      current: 1,
      conflicts: 0,
      failed: 0,
    });
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('same\n');
    expect(fs.readFileSync(receiptPath, 'utf8')).toBe(before);
  });

  it('refuses source from a different Astryx release', async () => {
    const {sourcePath} = seed({base: 'old\n'});
    const result = await reconcile(
      {apply: true},
      {fetchImpl: remote('new\n'), expectedVersion: '0.5.0'},
    );

    expect(result.summary).toMatchObject({ok: false, failed: 1, updated: 0});
    expect(result.summary.items[0].message).toMatch(/project has 0\.5\.0/);
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('old\n');
  });

  it('accepts canary source for an installed canary release', async () => {
    const {sourcePath} = seed({base: 'old\n'});
    const result = await reconcile(
      {apply: true},
      {
        fetchImpl: remote('new\n', {version: 'canary'}),
        expectedVersion: '0.6.0-canary.42',
      },
    );

    expect(result.summary).toMatchObject({ok: true, updated: 1});
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('new\n');
  });

  it('previews a pristine update without writing', async () => {
    const {sourcePath, receiptPath} = seed({base: 'old\n'});
    const before = fs.readFileSync(receiptPath, 'utf8');
    const result = await reconcile({}, {fetchImpl: remote('new\n')});

    expect(result.summary).toMatchObject({
      found: 1,
      wouldUpdate: 1,
      updated: 0,
    });
    expect(result.summary.items[0].action).toBe('would-update');
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('old\n');
    expect(fs.readFileSync(receiptPath, 'utf8')).toBe(before);
  });

  it('updates a pristine source and advances its receipt', async () => {
    const {sourcePath, receiptPath} = seed({base: 'old\n'});
    fs.writeFileSync(`${sourcePath}.astryx-conflict`, 'stale\n');
    const result = await reconcile({apply: true}, {fetchImpl: remote('new\n')});

    expect(result.summary).toMatchObject({
      applied: true,
      found: 1,
      wouldUpdate: 0,
      updated: 1,
      conflicts: 0,
      items: [{action: 'updated'}],
    });
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('new\n');
    expect(fs.existsSync(`${sourcePath}.astryx-conflict`)).toBe(false);
    expect(
      JSON.parse(fs.readFileSync(receiptPath, 'utf8')).source.version,
    ).toBe('0.6.0');
  });

  it('rolls back source when the receipt write fails', async () => {
    if (process.platform === 'win32') return;
    const {sourcePath, receiptPath} = seed({base: 'old\n'});
    const receiptDir = path.dirname(receiptPath);
    fs.chmodSync(receiptDir, 0o500);
    try {
      const result = await reconcile(
        {apply: true},
        {fetchImpl: remote('new\n')},
      );

      expect(result.summary).toMatchObject({
        ok: false,
        updated: 0,
        failed: 1,
        items: [{action: 'write-error'}],
      });
      expect(fs.readFileSync(sourcePath, 'utf8')).toBe('old\n');
      expect(
        JSON.parse(fs.readFileSync(receiptPath, 'utf8')).source.version,
      ).toBe('0.5.0');
    } finally {
      fs.chmodSync(receiptDir, 0o700);
    }
  });

  it('preserves CRLF when updating a pristine source', async () => {
    const {sourcePath} = seed({
      base: 'first\nsecond\n',
      current: 'first\r\nsecond\r\n',
    });
    const result = await reconcile(
      {apply: true},
      {fetchImpl: remote('first\nupdated\n')},
    );

    expect(result.summary).toMatchObject({updated: 1, conflicts: 0});
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('first\r\nupdated\r\n');
  });

  it('three-way merges non-overlapping user and upstream edits', async () => {
    const base = 'title\nbody\nfooter\n';
    const current = 'custom title\nbody\nfooter\n';
    const latest = 'title\nbody\nnew footer\n';
    const {sourcePath} = seed({base, current});
    const result = await reconcile({apply: true}, {fetchImpl: remote(latest)});

    expect(result.summary).toMatchObject({
      merged: 1,
      conflicts: 0,
      items: [{action: 'merged'}],
    });
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe(
      'custom title\nbody\nnew footer\n',
    );
  });

  it('preserves CRLF when three-way merging', async () => {
    const base = 'title\nbody\nfooter\n';
    const current = 'custom title\r\nbody\r\nfooter\r\n';
    const latest = 'title\nbody\nnew footer\n';
    const {sourcePath} = seed({base, current});
    const result = await reconcile({apply: true}, {fetchImpl: remote(latest)});

    expect(result.summary).toMatchObject({merged: 1, conflicts: 0});
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe(
      'custom title\r\nbody\r\nnew footer\r\n',
    );
  });

  it('leaves edited source and receipt untouched on conflict', async () => {
    const base = 'value = 1\n';
    const current = 'value = local\n';
    const latest = 'value = upstream\n';
    const {sourcePath, receiptPath} = seed({base, current});
    const beforeReceipt = fs.readFileSync(receiptPath, 'utf8');
    const result = await reconcile({apply: true}, {fetchImpl: remote(latest)});
    const conflictPath = `${sourcePath}.astryx-conflict`;

    expect(result.summary).toMatchObject({conflicts: 1, updated: 0, merged: 0});
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe(current);
    expect(fs.readFileSync(receiptPath, 'utf8')).toBe(beforeReceipt);
    expect(fs.readFileSync(conflictPath, 'utf8')).toContain(
      '<<<<<<< current project',
    );
    expect(fs.readFileSync(conflictPath, 'utf8')).toContain(
      '>>>>>>> latest 0.6.0',
    );
  });

  it('does not recreate a deleted or moved source', async () => {
    const {sourcePath} = seed({base: 'old\n', current: null});
    const result = await reconcile({apply: true}, {fetchImpl: remote('new\n')});

    expect(result.summary).toMatchObject({missing: 1, conflicts: 1});
    expect(fs.existsSync(sourcePath)).toBe(false);
  });

  it('does not replace a symbolic-link source', async () => {
    if (process.platform === 'win32') return;
    const {sourcePath} = seed({base: 'old\n'});
    const linkedPath = path.join(root, 'linked.tsx');
    fs.writeFileSync(linkedPath, 'linked\n', 'utf8');
    fs.rmSync(sourcePath);
    fs.symlinkSync(linkedPath, sourcePath);

    const result = await reconcile({apply: true}, {fetchImpl: remote('new\n')});

    expect(result.summary).toMatchObject({invalid: 1, conflicts: 1});
    expect(fs.lstatSync(sourcePath).isSymbolicLink()).toBe(true);
    expect(fs.readFileSync(linkedPath, 'utf8')).toBe('linked\n');
  });

  it('accepts an installed route that became an alias', async () => {
    seed({base: 'old\n'});
    const fetchImpl = remote('new\n', {
      item: {
        ...ITEM,
        path: 'examples/button/new-basic',
        aliases: [ITEM.path],
      },
    });
    const result = await reconcile({apply: true}, {fetchImpl});

    expect(result.summary.updated).toBe(1);
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://registry.example.test/examples/button/basic.json',
    );
  });

  it('refuses an upstream source-set change', async () => {
    const {sourcePath} = seed({base: 'old\n'});
    const result = await reconcile(
      {apply: true},
      {
        fetchImpl: remote('new\n', {
          extraFiles: [
            {
              id: 'secondary',
              target: 'components/astryx/examples/Helper.ts',
              registryPath: 'registry/example-button-basic/Helper.ts',
              content: 'export const helper = true;\n',
            },
          ],
        }),
      },
    );

    expect(result.summary).toMatchObject({conflicts: 1, updated: 0});
    expect(result.summary.items[0].message).toMatch(/source set/);
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('old\n');
  });

  it('rejects a corrupt installed base before fetching or writing', async () => {
    const value = receipt('base\n');
    value.files[0].sha256 = '0'.repeat(64);
    const {sourcePath} = seed({base: 'base\n', receiptValue: value});
    const fetchImpl = remote('new\n');
    const result = await reconcile({apply: true}, {fetchImpl});

    expect(result.summary).toMatchObject({invalid: 1, failed: 0});
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('base\n');
  });

  it('rejects a receipt target that escapes the source root', async () => {
    const value = receipt('base\n');
    value.files[0].target = '../../../outside.tsx';
    const outside = path.join(project, 'outside.tsx');
    seed({base: 'base\n', receiptValue: value});
    const result = await reconcile({apply: true}, {fetchImpl: remote('new\n')});

    expect(result.summary.invalid).toBe(1);
    expect(fs.existsSync(outside)).toBe(false);
  });

  it('rejects an oversized registry item before reading its body', async () => {
    seed({base: 'old\n'});
    const fetchImpl = vi.fn(
      async () =>
        new globalThis.Response('{}', {
          status: 200,
          headers: {'content-length': String(16 * 1024 * 1024 + 1)},
        }),
    );
    const result = await reconcile({apply: true}, {fetchImpl});

    expect(result.summary.failed).toBe(1);
    expect(result.summary.items[0].message).toMatch(/exceeds/);
  });

  it('rejects a remote receipt installed under the wrong target', async () => {
    const {sourcePath} = seed({base: 'old\n'});
    const result = await reconcile(
      {apply: true},
      {
        fetchImpl: remote('new\n', {
          receiptTarget: 'components/astryx/.astryx/wrong.json',
        }),
      },
    );

    expect(result.summary.failed).toBe(1);
    expect(result.summary.items[0].message).toMatch(/misplaced/);
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('old\n');
  });

  it('rejects a remote receipt that disagrees with shipped source', async () => {
    const {sourcePath} = seed({base: 'old\n'});
    const result = await reconcile(
      {apply: true},
      {fetchImpl: remote('new\n', {sourceContent: 'tampered\n'})},
    );

    expect(result.summary.failed).toBe(1);
    expect(fs.readFileSync(sourcePath, 'utf8')).toBe('old\n');
  });
});
