// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-table-renderprops-styles-to-xstyle.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-table-renderprops-styles-to-xstyle', () => {
  it('renames `props.styles` reads when the param is typed TableRenderProps', async () => {
    const input = `function transformTable(props: TableRenderProps) {
  return {...props, styles: [...props.styles, tableStyles.base]};
}`;
    const output = await applyTransform(input);
    expect(output).toContain('...props.xstyle');
    expect(output).toContain('xstyle: [');
    expect(output).not.toMatch(/\bstyles:/);
    expect(output).not.toContain('props.styles');
  });

  it('renames reads/writes for BodyCellRenderProps', async () => {
    const input = `const transformBodyCell = (props: BodyCellRenderProps) => ({
  ...props,
  styles: [...props.styles, cellStyles.padded],
});`;
    const output = await applyTransform(input);
    expect(output).toContain('...props.xstyle');
    expect(output).toContain('xstyle: [');
    expect(output).not.toContain('props.styles');
  });

  it('handles all six render-prop interface names as param types', async () => {
    for (const typeName of [
      'TableRenderProps',
      'HeaderRowRenderProps',
      'HeaderCellRenderProps',
      'BodyRowRenderProps',
      'BodyCellRenderProps',
      'ScrollWrapperRenderProps',
    ]) {
      const input = `function t(p: ${typeName}) { return p.styles; }`;
      const output = await applyTransform(input);
      expect(output).toContain('p.xstyle');
      expect(output).not.toContain('p.styles');
    }
  });

  it('renames the `styles:` key on a render-prop-shaped object literal (htmlProps + styles siblings)', async () => {
    const input = `const rp = {htmlProps: {}, styles: []};`;
    const output = await applyTransform(input);
    expect(output).toContain('xstyle: []');
    expect(output).not.toMatch(/\bstyles:/);
  });

  it('does NOT touch an unrelated `styles` from stylex.create', async () => {
    const input = `import * as stylex from '@stylexjs/stylex';
const styles = stylex.create({base: {color: 'red'}});
function useStuff() {
  return stylex.props(styles.base);
}`;
    const output = await applyTransform(input);
    // No render-prop binding, no htmlProps-shaped object -> unchanged
    expect(output).toContain('const styles = stylex.create');
    expect(output).toContain('styles.base');
    expect(output).not.toContain('xstyle');
  });

  it('does NOT rename `.styles` on an unrelated (untyped) object even when a render-prop binding exists elsewhere', async () => {
    const input = `function transformTable(props: TableRenderProps) {
  const theme = getTheme();
  return {...props, styles: [...props.styles, theme.styles.base]};
}`;
    const output = await applyTransform(input);
    // props.styles renamed; theme.styles left alone
    expect(output).toContain('...props.xstyle');
    expect(output).toContain('theme.styles.base');
  });

  it('returns undefined for files with no render-prop usage', async () => {
    const {default: transform} = await import(
      '../rename-table-renderprops-styles-to-xstyle.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `const styles = {a: 1};\nconst x = styles.a;`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('returns undefined for already-migrated code (xstyle only)', async () => {
    const {default: transform} = await import(
      '../rename-table-renderprops-styles-to-xstyle.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `function transformTable(props: TableRenderProps) {
  return {...props, xstyle: [...props.xstyle]};
}`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
