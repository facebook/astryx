// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  createRegistryReceipt,
  parseRegistryReceipt,
  registryContentHash,
  registryReceiptTarget,
  serializeRegistryReceipt,
} from './receipt.mjs';

function receipt() {
  const target = 'components/astryx/examples/ButtonExample.tsx';
  const receiptTarget = registryReceiptTarget(target, 'example-button-basic');
  return createRegistryReceipt({
    item: {
      name: 'example-button-basic',
      path: 'examples/button/basic',
      aliases: ['examples/button/old-basic'],
      kind: 'example',
    },
    sourceVersion: '0.6.0',
    receiptTarget,
    files: [
      {
        id: 'primary',
        target,
        registryPath: 'registry/example-button-basic/ButtonExample.tsx',
        content: 'export default function Example() { return null; }\n',
      },
    ],
  });
}

describe('ShadCN registry receipts', () => {
  it('places a unique receipt beside the copied source', () => {
    expect(
      registryReceiptTarget(
        'components/astryx/examples/ButtonExample.tsx',
        'example-button-basic',
      ),
    ).toBe('components/astryx/examples/.astryx/example-button-basic.json');
  });

  it('records the installed base bytes and a relative target', () => {
    const value = receipt();
    expect(value.files[0]).toMatchObject({
      id: 'primary',
      target: '../ButtonExample.tsx',
      registryTarget: 'components/astryx/examples/ButtonExample.tsx',
      registryPath: 'registry/example-button-basic/ButtonExample.tsx',
      sha256: registryContentHash(value.files[0].content),
    });
    expect(
      parseRegistryReceipt(JSON.parse(serializeRegistryReceipt(value))),
    ).toEqual(value);
  });

  it('rejects duplicate file identities', () => {
    const value = receipt();
    expect(() =>
      parseRegistryReceipt({
        ...value,
        files: [value.files[0], {...value.files[0]}],
      }),
    ).toThrow(/must be unique/);
  });

  it('rejects traversal and corrupt hashes', () => {
    const value = receipt();
    expect(() =>
      parseRegistryReceipt({
        ...value,
        files: [{...value.files[0], target: '../../outside.tsx'}],
      }),
    ).toThrow(/adjacent source file/);
    expect(() =>
      parseRegistryReceipt({
        ...value,
        source: {...value.source, version: '0.6.0\n<<<<<<< injected'},
      }),
    ).toThrow(/semantic version/);
    expect(() =>
      parseRegistryReceipt({
        ...value,
        files: [{...value.files[0], sha256: 'not-a-hash'}],
      }),
    ).toThrow();
  });
});
