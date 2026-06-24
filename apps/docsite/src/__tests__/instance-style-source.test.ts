// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  readInstanceStyle,
  writeInstanceStyle,
  instanceStyleKey,
  hasForeignXstyle,
} from '../app/playground/styleOverride/instanceStyleSource';

const BASE = `import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';

export default function App() {
  return (
    <Card>
      <Button label="One" />
      <Button label="Two" />
    </Card>
  );
}`;

describe('instanceStyleSource', () => {
  it('derives a valid identifier key from an instance', () => {
    expect(instanceStyleKey('Button', 0)).toBe('button_0');
    expect(instanceStyleKey('TextInput', 2)).toBe('textInput_2');
  });

  it('returns empty + editable for an instance with no xstyle', () => {
    expect(readInstanceStyle(BASE, 'Button', 0)).toEqual({
      editable: true,
      props: {},
    });
  });

  it('writes a one-off style: injects stylex import, pgStyles block, and xstyle', () => {
    const next = writeInstanceStyle(BASE, 'Button', 0, {
      borderRadius: '9999px',
    });
    expect(next).toContain("import * as stylex from '@stylexjs/stylex'");
    expect(next).toContain('const pgStyles = stylex.create({');
    expect(next).toContain('button_0: {');
    expect(next).toContain("borderRadius: '9999px',");
    expect(next).toContain('xstyle={pgStyles.button_0}');
  });

  it('round-trips read after write', () => {
    const next = writeInstanceStyle(BASE, 'Button', 1, {
      padding: '24px',
      color: 'red',
    });
    expect(readInstanceStyle(next, 'Button', 1)).toEqual({
      editable: true,
      props: {padding: '24px', color: 'red'},
    });
    // Only the second button got the xstyle.
    expect(readInstanceStyle(next, 'Button', 0).props).toEqual({});
  });

  it('reuses the same pgStyles block + import on a second instance', () => {
    let next = writeInstanceStyle(BASE, 'Button', 0, {borderRadius: '4px'});
    next = writeInstanceStyle(next, 'Button', 1, {padding: '8px'});
    // One import, one create block.
    expect(next.match(/@stylexjs\/stylex/g)?.length).toBe(1);
    expect(next.match(/stylex\.create\(/g)?.length).toBe(1);
    expect(readInstanceStyle(next, 'Button', 0).props).toEqual({
      borderRadius: '4px',
    });
    expect(readInstanceStyle(next, 'Button', 1).props).toEqual({
      padding: '8px',
    });
  });

  it('clears the key and removes the managed xstyle when emptied', () => {
    const applied = writeInstanceStyle(BASE, 'Button', 0, {
      borderRadius: '9999px',
    });
    const cleared = writeInstanceStyle(applied, 'Button', 0, {});
    expect(cleared).not.toContain('xstyle={pgStyles.button_0}');
    expect(cleared).not.toContain('button_0: {');
    expect(readInstanceStyle(cleared, 'Button', 0).props).toEqual({});
  });

  it('flags a foreign (hand-written) xstyle as not editable and leaves it alone', () => {
    const foreign = BASE.replace(
      '<Button label="One" />',
      '<Button label="One" xstyle={myStyles.btn} />',
    );
    expect(hasForeignXstyle(foreign, 'Button', 0)).toBe(true);
    expect(readInstanceStyle(foreign, 'Button', 0).editable).toBe(false);
  });
});
