// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../drop-xds-prefix-imports.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('drop-xds-prefix-imports', () => {
  it('renames a named import + its JSX usage', async () => {
    const input = [
      `import {XDSButton} from '@xds/core';`,
      `export const App = () => <XDSButton label="Hi" />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`import {Button} from '@xds/core';`);
    expect(output).toContain('<Button label="Hi" />');
    expect(output).not.toContain('XDSButton');
  });

  it('renames subpath imports and keeps the source path', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';`;
    const output = await applyTransform(input);
    expect(output).toContain('Button');
    // The subpath dir is NOT renamed by this codemod.
    expect(output).toContain(`from '@xds/core/Button'`);
    expect(output).not.toContain('XDSButton');
  });

  it('renames hooks (useXDS -> use)', async () => {
    const input = [
      `import {useXDSTheme} from '@xds/core';`,
      `const t = useXDSTheme();`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {useTheme}');
    expect(output).toContain('const t = useTheme();');
    expect(output).not.toContain('useXDSTheme');
  });

  it('renames type-only imports and type references', async () => {
    const input = [
      `import type {XDSButtonProps} from '@xds/core';`,
      `type Props = XDSButtonProps & {extra: true};`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('ButtonProps');
    expect(output).not.toContain('XDSButtonProps');
  });

  it('renames type references in generic type-argument positions', async () => {
    const input = [
      `import {XDSTableColumn} from '@xds/core/Table';`,
      `const cols = useMemo<XDSTableColumn<Issue>[]>(() => [], []);`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`import {TableColumn} from '@xds/core/Table';`);
    expect(output).toContain('useMemo<TableColumn<Issue>[]>');
    // The unrelated generic argument `Issue` must be left alone.
    expect(output).toContain('<Issue>');
    expect(output).not.toContain('XDSTableColumn');
  });

  it('rewrites the imported name but keeps a custom local alias', async () => {
    const input = [
      `import {XDSButton as Btn} from '@xds/core';`,
      `export const App = () => <Btn />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('Button as Btn');
    expect(output).toContain('<Btn />');
    expect(output).not.toContain('XDSButton');
  });

  it('does NOT touch identifiers that are not imported from @xds/core', async () => {
    const input = [
      `import {XDSButton} from '@my/other-lib';`,
      `const XDSCustomThing = 1;`,
      `export const App = () => <XDSButton />;`,
    ].join('\n');
    const output = await applyTransform(input);
    // Neither the third-party import nor the local symbol should change.
    expect(output).toContain(`import {XDSButton} from '@my/other-lib';`);
    expect(output).toContain('const XDSCustomThing = 1;');
    expect(output).toContain('<XDSButton />');
  });

  it('does NOT touch strings that merely start with XDS', async () => {
    const input = [
      `import {XDSButton} from '@xds/core';`,
      `const label = 'XDSButton is great';`,
      `export const App = () => <XDSButton label={label} />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`'XDSButton is great'`);
    expect(output).toContain('<Button label={label} />');
  });

  it('handles multiple specifiers and a mix of components, hooks, and types', async () => {
    const input = [
      `import {XDSButton, XDSCard, useXDSToast} from '@xds/core';`,
      `import type {XDSCardProps} from '@xds/core';`,
      `export function App() {`,
      `  const toast = useXDSToast();`,
      `  const p: XDSCardProps = {};`,
      `  return <XDSCard><XDSButton /></XDSCard>;`,
      `}`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {Button, Card, useToast}');
    expect(output).toContain('CardProps');
    expect(output).toContain('const toast = useToast();');
    expect(output).toContain('<Card><Button /></Card>');
    expect(output).not.toContain('XDS');
  });

  it('rewrites re-exports from @xds/core', async () => {
    const input = `export {XDSButton} from '@xds/core/Button';`;
    const output = await applyTransform(input);
    expect(output).toContain('Button');
    expect(output).toContain(`from '@xds/core/Button'`);
    expect(output).not.toContain('XDSButton');
  });

  it('returns source unchanged when there is nothing to rename', async () => {
    const input = `import {useState} from 'react';\nconst x = 1;`;
    const output = await applyTransform(input);
    expect(output).toContain(`import {useState} from 'react';`);
    expect(output).toContain('const x = 1;');
  });

  it('aliases to Astryx<Name> when the bare name collides with a local export function', async () => {
    const input = [
      `import {XDSCodeBlock} from '@xds/core/CodeBlock';`,
      `export function CodeBlock({code}: {code: string}) {`,
      `  return <XDSCodeBlock code={code} />;`,
      `}`,
    ].join('\n');
    const output = await applyTransform(input);
    // Import aliased to AstryxCodeBlock; local declaration untouched.
    expect(output).toContain('CodeBlock as AstryxCodeBlock');
    expect(output).toContain('@xds/core/CodeBlock');
    expect(output).toContain('export function CodeBlock({code}');
    expect(output).toContain('<AstryxCodeBlock code={code} />');
    // No duplicate CodeBlock binding (not imported bare).
    expect(output).not.toMatch(/import \{CodeBlock\}/);
  });

  it('aliases on collision with a local const/class binding', async () => {
    const input = [
      `import {XDSCard} from '@xds/core';`,
      `const Card = 42;`,
      `export const value = <XDSCard />;`,
      `export const other = Card;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {Card as AstryxCard}');
    expect(output).toContain('const Card = 42;');
    expect(output).toContain('<AstryxCard />');
    expect(output).toContain('export const other = Card;');
  });

  it('un-prefixes override keys inside an @xds/core mock factory', async () => {
    const input = [
      `vi.mock('@xds/core/Text', async orig => ({`,
      `  ...(await orig<typeof import('@xds/core/Text')>()),`,
      `  useXDSTruncation: () => ({ref: vi.fn(), isTruncated: true, fullText: ''}),`,
      `}));`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('useTruncation:');
    expect(output).not.toContain('useXDSTruncation');
    // This codemod does not touch the module-path string (that is the
    // module-specifiers codemod's job); the @xds/core/Text path stays here.
    expect(output).toContain(`vi.mock('@xds/core/Text'`);
  });

  it('un-prefixes component override keys inside a bare @xds/core jest.mock factory', async () => {
    const input = [
      `jest.mock('@xds/core', () => ({`,
      `  XDSButton: () => null,`,
      `  useXDSToast: () => ({}),`,
      `}));`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('Button:');
    expect(output).toContain('useToast:');
    expect(output).not.toContain('XDSButton');
    expect(output).not.toContain('useXDSToast');
  });

  it('does NOT touch mock factory keys for a non-@xds package', async () => {
    const input = [
      `vi.mock('some-other-pkg', () => ({`,
      `  useXDSFoo: () => 1,`,
      `}));`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does NOT touch useXDS keys in an unrelated object literal (not a mock factory)', async () => {
    const input = [`const config = {`, `  useXDSWhatever: true,`, `};`].join(
      '\n',
    );
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('aliases a component wrapper collision in place (XDS -> Astryx), leaving the local fn untouched', async () => {
    const input = [
      `import {XDSLinkProvider} from '@xds/core/Link';`,
      `export default function LinkProvider({children}) {`,
      `  return <XDSLinkProvider component={NextLink}>{children}</XDSLinkProvider>;`,
      `}`,
    ].join('\n');
    const output = await applyTransform(input);
    // Import aliased in place, local wrapper + its name untouched.
    expect(output).toContain('import {LinkProvider as AstryxLinkProvider}');
    expect(output).toContain('function LinkProvider({children})');
    // JSX rewritten to the alias -> no self-recursion.
    expect(output).toContain('<AstryxLinkProvider component={NextLink}>');
    expect(output).not.toContain('XDSLinkProvider');
    // No duplicate bare LinkProvider import.
    expect(output).not.toMatch(/import \{LinkProvider\}/);
  });

  it('aliases a hook collision as use<Astryx>Name (not <Astryx>use)', async () => {
    const input = [
      `import {useXDSToast} from '@xds/core';`,
      `function useToast() {`,
      `  return useXDSToast();`,
      `}`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {useToast as useAstryxToast}');
    expect(output).toContain('function useToast()');
    expect(output).toContain('return useAstryxToast();');
    expect(output).not.toContain('useXDSToast');
    // Must not produce the malformed `Astryxuse...` form.
    expect(output).not.toContain('AstryxuseToast');
  });

  it('aliases on collision with a local default import binding', async () => {
    const input = [
      `import Link from 'next/link';`,
      `import {XDSLink} from '@xds/core';`,
      `export const a = <XDSLink href="/" />;`,
      `export const b = <Link href="/" />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {Link as AstryxLink}');
    expect(output).toContain(`import Link from 'next/link';`);
    expect(output).toContain('<AstryxLink href="/" />');
    expect(output).toContain('<Link href="/" />');
    expect(output).not.toContain('XDSLink');
  });

  it('aliases on collision with a local type alias', async () => {
    const input = [
      `import type {XDSTab} from '@xds/core';`,
      `type Tab = {id: string};`,
      `const active: XDSTab = null as any;`,
      `const local: Tab = {id: '1'};`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('Tab as AstryxTab');
    expect(output).toContain('type Tab = {id: string};');
    expect(output).toContain('const active: AstryxTab');
    expect(output).toContain('const local: Tab');
    expect(output).not.toContain('XDSTab');
  });

  it('aliases on collision with a local interface', async () => {
    const input = [
      `import type {XDSTheme} from '@xds/core';`,
      `interface Theme {}`,
      `const t: XDSTheme = null as any;`,
      `const local: Theme = {};`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('Theme as AstryxTheme');
    expect(output).toContain('interface Theme {}');
    expect(output).toContain('const t: AstryxTheme');
    expect(output).not.toContain('XDSTheme');
  });

  it('still bare-renames when there is NO colliding local binding', async () => {
    const input = [
      `import {XDSButton} from '@xds/core';`,
      `export const App = () => <XDSButton label="Hi" />;`,
    ].join('\n');
    const output = await applyTransform(input);
    // No local `Button` binding -> existing blind bare-rename behavior kept.
    expect(output).toContain(`import {Button} from '@xds/core';`);
    expect(output).toContain('<Button label="Hi" />');
    expect(output).not.toContain('AstryxButton');
    expect(output).not.toContain('XDSButton');
  });

  describe('JSX whitespace preservation on element-name rename', () => {
    it('preserves the space between text and a following {expression} inside return (...)', async () => {
      const input = [
        `import {XDSText} from '@xds/core';`,
        `export function App({name}) {`,
        `  return (`,
        `    <XDSText>hello {name} world</XDSText>`,
        `  );`,
        `}`,
      ].join('\n');
      const output = await applyTransform(input);
      // Element is renamed...
      expect(output).toContain('<Text>');
      expect(output).toContain('</Text>');
      expect(output).not.toContain('XDSText');
      // ...and the whitespace around the {expression} survives (the bug
      // collapsed `{name} world` to `{name}world`).
      expect(output).toContain('hello {name} world');
      expect(output).not.toContain('{name}world');
    });

    it('preserves whitespace with multiple {expressions} adjacent to text', async () => {
      const input = [
        `import {XDSText} from '@xds/core';`,
        `export function App({a, b}) {`,
        `  return (`,
        `    <XDSText>involving {a} in the {b} dataset</XDSText>`,
        `  );`,
        `}`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('involving {a} in the {b} dataset');
      expect(output).toContain('<Text>');
      expect(output).not.toContain('XDSText');
    });

    it('preserves whitespace across a multi-line JSX body', async () => {
      const input = [
        `import {XDSText} from '@xds/core';`,
        `export function App({a, b}) {`,
        `  return (`,
        `    <XDSText>`,
        `      involving {a} in the {b} dataset`,
        `    </XDSText>`,
        `  );`,
        `}`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('involving {a} in the {b} dataset');
      expect(output).toContain('<Text>');
      expect(output).toContain('</Text>');
      expect(output).not.toContain('XDSText');
    });

    it('renames both the opening and closing tag of the same element', async () => {
      const input = [
        `import {XDSCard} from '@xds/core';`,
        `export const App = ({n}) => (<XDSCard>value {n} here</XDSCard>);`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('<Card>');
      expect(output).toContain('</Card>');
      expect(output).toContain('value {n} here');
      expect(output).not.toContain('XDSCard');
    });

    it('preserves whitespace for multiple different elements in one return', async () => {
      const input = [
        `import {XDSCard, XDSText, XDSButton} from '@xds/core';`,
        `export const App = ({n}) => (`,
        `  <XDSCard>`,
        `    <XDSText>hello {n} world</XDSText>`,
        `    <XDSButton>click {n} here</XDSButton>`,
        `  </XDSCard>`,
        `);`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('import {Card, Text, Button}');
      expect(output).toContain('<Card>');
      expect(output).toContain('hello {n} world');
      expect(output).toContain('click {n} here');
      expect(output).not.toContain('XDS');
    });

    it('renames only the mapped segment of a member-expression tag name, preserving whitespace', async () => {
      const input = [
        `import {XDSMenu} from '@xds/core';`,
        `export const App = ({x}) => (<XDSMenu.Item>pick {x} now</XDSMenu.Item>);`,
      ].join('\n');
      const output = await applyTransform(input);
      // Only the mapped `XDSMenu` segment is renamed; `.Item` is preserved.
      expect(output).toContain('<Menu.Item>');
      expect(output).toContain('</Menu.Item>');
      expect(output).toContain('pick {x} now');
      expect(output).not.toContain('XDSMenu');
    });

    it('renames a self-closing element with attributes without altering the attributes', async () => {
      const input = [
        `import {XDSButton} from '@xds/core';`,
        `export const App = () => <XDSButton label="x" onClick={fn} />;`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('<Button label="x" onClick={fn} />');
      expect(output).not.toContain('XDSButton');
    });

    it('handles a JSX body with no whitespace to preserve', async () => {
      const input = [
        `import {XDSButton} from '@xds/core';`,
        `export const App = ({label}) => <XDSButton>{label}</XDSButton>;`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('<Button>{label}</Button>');
      expect(output).not.toContain('XDSButton');
    });

    it('preserves whitespace when the bare name is aliased on a collision', async () => {
      const input = [
        `import {XDSCodeBlock} from '@xds/core/CodeBlock';`,
        `export function CodeBlock({code}) {`,
        `  return (<XDSCodeBlock>run {code} now</XDSCodeBlock>);`,
        `}`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('CodeBlock as AstryxCodeBlock');
      expect(output).toContain('<AstryxCodeBlock>');
      expect(output).toContain('</AstryxCodeBlock>');
      expect(output).toContain('run {code} now');
    });

    it('keeps a custom local alias on the element tag and preserves whitespace', async () => {
      const input = [
        `import {XDSText as Txt} from '@xds/core';`,
        `export const App = ({n}) => (<Txt>hello {n} world</Txt>);`,
      ].join('\n');
      const output = await applyTransform(input);
      expect(output).toContain('Text as Txt');
      expect(output).toContain('<Txt>hello {n} world</Txt>');
      expect(output).not.toContain('XDSText');
    });

    it('is idempotent: a second pass over already-migrated output is a no-op', async () => {
      const input = [
        `import {XDSText} from '@xds/core';`,
        `export const App = ({n}) => (<XDSText>a {n} b</XDSText>);`,
      ].join('\n');
      const once = await applyTransform(input);
      const twice = await applyTransform(once);
      expect(twice).toBe(once);
      expect(once).toContain('a {n} b');
    });
  });
});
