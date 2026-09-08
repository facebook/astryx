// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';
import transform from '../migrate-lab-drawer-imports.mjs';

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};

function apply(source) {
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('migrate-lab-drawer-imports', () => {
  it('moves Drawer and DrawerProps out of a mixed Lab root import', () => {
    const output =
      apply(`import {Drawer, type DrawerProps, Stat} from '@astryxdesign/lab';
const drawer: DrawerProps = {label: 'Details'};
const el = <Drawer {...drawer}>Details</Drawer>;`);

    expect(output).toContain(
      "import { Drawer, type DrawerProps } from '@astryxdesign/core/Drawer';",
    );
    expect(output).toContain("import { Stat } from '@astryxdesign/lab';");
  });

  it('preserves a type-only import declaration', () => {
    const output = apply("import type {DrawerProps} from '@astryxdesign/lab';");

    expect(output).toContain(
      "import type {DrawerProps} from '@astryxdesign/core/Drawer';",
    );
  });

  it('preserves local aliases', () => {
    const output = apply(
      "import {Drawer as SidePanel} from '@astryxdesign/lab';",
    );

    expect(output).toContain(
      "import {Drawer as SidePanel} from '@astryxdesign/core/Drawer';",
    );
  });

  it('rewrites direct Drawer subpath imports', () => {
    const output = apply("import {Drawer} from '@astryxdesign/lab/Drawer';");

    expect(output).toContain("from '@astryxdesign/core/Drawer'");
    expect(output).not.toContain('@astryxdesign/lab/Drawer');
  });

  it('splits mixed root re-exports', () => {
    const output = apply(
      "export {Drawer, type DrawerProps, Stat} from '@astryxdesign/lab';",
    );

    expect(output).toContain(
      "export { Drawer, type DrawerProps } from '@astryxdesign/core/Drawer';",
    );
    expect(output).toContain("export { Stat } from '@astryxdesign/lab';");
  });

  it('rewrites direct Drawer export-all declarations', () => {
    const output = apply("export * from '@astryxdesign/lab/Drawer';");

    expect(output).toContain("export * from '@astryxdesign/core/Drawer';");
  });

  it('leaves unrelated Lab imports unchanged', () => {
    const source = "import {Stat} from '@astryxdesign/lab';";
    expect(apply(source)).toBe(source);
  });

  it('is idempotent', () => {
    const source = "import {Drawer} from '@astryxdesign/lab';";
    const once = apply(source);
    expect(apply(once)).toBe(once);
  });
});
