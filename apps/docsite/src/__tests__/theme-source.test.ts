// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  readThemeModel,
  writeThemeModel,
  serializeThemeArg,
  stripThemeWrapper,
  hasThemeScaffold,
  ensureThemeScaffold,
  readComponentBase,
  setComponentBase,
} from '../app/playground/themeSource';

const SCAFFOLDED = `import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

const appTheme = defineTheme({
  name: 'custom',
  tokens: {
    '--color-accent': '#7B61FF',
  },
  components: {
    'button': {
      'base': {
        'borderRadius': '9999px',
      },
    },
  },
});

export default function App() {
  return (
    <Theme theme={appTheme}>
      <Card>
        <Button label="Hi" />
      </Card>
    </Theme>
  );
}`;

describe('themeSource', () => {
  it('parses tokens and components from the defineTheme literal', () => {
    const parsed = readThemeModel(SCAFFOLDED);
    expect(parsed).not.toBeNull();
    expect(parsed!.model.tokens['--color-accent']).toBe('#7B61FF');
    expect(parsed!.model.components).toEqual({
      button: {base: {borderRadius: '9999px'}},
    });
  });

  it('normalizes [light, dark] token tuples to light-dark()', () => {
    const code = SCAFFOLDED.replace(
      "'--color-accent': '#7B61FF',",
      "'--color-accent': ['#7B61FF', '#9B85FF'],",
    );
    const parsed = readThemeModel(code);
    expect(parsed!.model.tokens['--color-accent']).toBe(
      'light-dark(#7B61FF, #9B85FF)',
    );
  });

  it('writes a token edit back into the defineTheme literal', () => {
    const parsed = readThemeModel(SCAFFOLDED)!;
    const next = writeThemeModel(SCAFFOLDED, {
      ...parsed.model,
      tokens: {...parsed.model.tokens, '--color-accent': '#FF0000'},
    });
    const reparsed = readThemeModel(next)!;
    expect(reparsed.model.tokens['--color-accent']).toBe('#FF0000');
    // The user JSX is untouched.
    expect(next).toContain('<Button label="Hi" />');
  });

  it('writes a component override back into the defineTheme literal', () => {
    const parsed = readThemeModel(SCAFFOLDED)!;
    const next = writeThemeModel(SCAFFOLDED, {
      ...parsed.model,
      components: {card: {base: {padding: '24px'}}},
    });
    const reparsed = readThemeModel(next)!;
    expect(reparsed.model.components).toEqual({
      card: {base: {padding: '24px'}},
    });
  });

  it('round-trips serialize → parse with no drift', () => {
    const parsed = readThemeModel(SCAFFOLDED)!;
    const next = writeThemeModel(SCAFFOLDED, parsed.model);
    const reparsed = readThemeModel(next)!;
    expect(reparsed.model).toEqual(parsed.model);
  });

  it('omits default-valued tokens when serializing', () => {
    const arg = serializeThemeArg({
      name: 'custom',
      tokens: {'--spacing-1': '4px'}, // 4px is the shipped default
      components: {},
    });
    expect(arg).not.toContain('--spacing-1');
  });

  it('strips the root <Theme> wrapper and the defineTheme decl for the preview copy', () => {
    const stripped = stripThemeWrapper(SCAFFOLDED);
    expect(stripped).not.toContain('<Theme theme={appTheme}>');
    expect(stripped).not.toContain('defineTheme(');
    expect(stripped).toContain('<Card>');
    expect(stripped).toContain('<Button label="Hi" />');
  });

  it('reads a component type base from the theme', () => {
    expect(readComponentBase(SCAFFOLDED, 'button')).toEqual({
      borderRadius: '9999px',
    });
    expect(readComponentBase(SCAFFOLDED, 'card')).toEqual({});
  });

  it('sets a component base, preserving the rest of the theme', () => {
    const next = setComponentBase(SCAFFOLDED, 'card', {padding: '24px'});
    expect(readComponentBase(next, 'card')).toEqual({padding: '24px'});
    // Existing button override + tokens are untouched.
    expect(readComponentBase(next, 'button')).toEqual({borderRadius: '9999px'});
    expect(readThemeModel(next)!.model.tokens['--color-accent']).toBe(
      '#7B61FF',
    );
  });

  it('removes a component node when its base is cleared', () => {
    const next = setComponentBase(SCAFFOLDED, 'button', {});
    expect(readComponentBase(next, 'button')).toEqual({});
    expect(next).not.toContain("'button'");
  });

  it('detects and injects a scaffold for un-themed code', () => {
    const bare = `import {Card} from '@astryxdesign/core/Card';

export default function App() {
  return (
    <Card>hello</Card>
  );
}`;
    expect(hasThemeScaffold(bare)).toBe(false);
    const scaffolded = ensureThemeScaffold(bare);
    expect(hasThemeScaffold(scaffolded)).toBe(true);
    expect(scaffolded).toContain('defineTheme(');
    expect(scaffolded).toContain('<Theme theme={appTheme}>');
    // And it parses back cleanly.
    expect(readThemeModel(scaffolded)).not.toBeNull();
  });
});
