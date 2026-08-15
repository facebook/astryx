// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';
import transform from '../migrate-lab-bottom-sheet-imports.mjs';

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};

function applyTransform(source) {
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('migrate-lab-bottom-sheet-imports', () => {
  it('moves BottomSheet values and types while preserving other lab imports', () => {
    const input = `import {BottomSheet, type BottomSheetProps, Drawer} from '@astryxdesign/lab';
const sheet: BottomSheetProps = {isOpen: true, onOpenChange() {}, label: 'Filters', children: null};
const example = <BottomSheet {...sheet} />;`;
    const output = applyTransform(input);

    expect(output).toContain("from '@astryxdesign/core/BottomSheet'");
    expect(output).toMatch(/import \{\s*Drawer\s*\} from '@astryxdesign\/lab'/);
    expect(output).toContain('type BottomSheetProps');
  });

  it('moves the switcher exports', () => {
    const input = `import {BottomSheetSwitcher, type BottomSheetSwitcherProps} from '@astryxdesign/lab';`;
    const output = applyTransform(input);

    expect(output).toContain("from '@astryxdesign/core/BottomSheet'");
    expect(output).not.toContain("from '@astryxdesign/lab'");
  });

  it('repoints the former lab subpath', () => {
    const input = `import {BottomSheet} from '@astryxdesign/lab/BottomSheet';`;
    const output = applyTransform(input);

    expect(output).toContain("from '@astryxdesign/core/BottomSheet'");
  });

  it('leaves unrelated imports unchanged', () => {
    const input = `import {Drawer} from '@astryxdesign/lab';`;
    expect(applyTransform(input)).toBe(input);
  });
});
