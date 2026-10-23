// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} =
    await import('../rename-switch-label-spacing-default-to-hug.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

const IMPORT = "import {Switch} from '@astryxdesign/core';\n";

describe('rename-switch-label-spacing-default-to-hug', () => {
  it('renames Switch labelSpacing="default" to labelSpacing="hug"', async () => {
    const input = `${IMPORT}<Switch label="Notify" value={on} labelSpacing="default" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).not.toContain('default');
  });

  it("renames expression-container labelSpacing={'default'}", async () => {
    const input = `${IMPORT}<Switch label="Notify" value={on} labelSpacing={'default'} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).not.toContain("'default'");
  });

  it('renames default inside a ternary labelSpacing expression', async () => {
    const input = `${IMPORT}<Switch label="Notify" value={on} labelSpacing={isRow ? 'spread' : 'default'} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).toContain("'spread'");
    expect(output).not.toContain("'default'");
  });

  it('does not change labelSpacing="spread"', async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing="spread" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch labelSpacing="default" on non-Switch components', async () => {
    const input = `<LegacyToggle labelSpacing="default" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch other props with a "default" value on Switch', async () => {
    const input = `<Switch label="Notify" value={on} data-variant="default" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch unrelated "default" string literals', async () => {
    const input = `const theme = {mode: 'default', label: 'Default Mode'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames labelSpacing args on a Storybook meta and its stories for an Astryx Switch', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const meta = {component: Switch, args: {labelSpacing: 'default'}};
export default meta;
export const Adjacent = {args: {labelSpacing: 'default' as const}};`;
    const output = await applyTransform(input);
    expect(output).toContain("args: {labelSpacing: 'hug'}");
    expect(output).toContain("'hug' as const");
    expect(output).not.toContain("'default'");
  });

  it('does not rename object labelSpacing prop when Switch is not imported', async () => {
    const input = `const cfg = {labelSpacing: 'default'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch a Switch from another package', async () => {
    const input = `import {Switch} from '@headlessui/react';
<Switch checked={on} labelSpacing="default" />;
const cfg = {labelSpacing: 'default'};`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('does not touch an unimported Switch', async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing="default" />`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('renames Storybook argTypes options on an Astryx Switch meta', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const meta = {component: Switch, argTypes: {labelSpacing: {control: 'select', options: ['default', 'spread']}}};
export default meta;`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).toContain("'spread'");
    expect(output).not.toContain("'default'");
  });

  it('leaves an unproven labelSpacing object in an Astryx file byte-for-byte unchanged', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const ROWS = [{labelSpacing: 'default' as const, label: 'Adjacent'}];`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('migrates Astryx JSX and leaves another library config in the same file unchanged', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
import {Toggle} from 'other-ui';
const toggleConfig = {labelSpacing: 'default'};
export const Row = () => <><Switch label="A" value labelSpacing="default" /><Toggle {...toggleConfig} /></>;`;
    expect(await applyTransform(input)).toBe(
      input.replace('labelSpacing="default" />', "labelSpacing='hug' />"),
    );
  });

  it('migrates a namespace-imported Switch meta and leaves other objects unchanged', async () => {
    const input = `import * as Astryx from '@astryxdesign/core';
const options = {labelSpacing: 'default'};
export default {component: Astryx.Switch, argTypes: {labelSpacing: {options: ['default', 'spread']}}};`;
    expect(await applyTransform(input)).toBe(
      input.replace(
        "options: ['default', 'spread']",
        "options: ['hug', 'spread']",
      ),
    );
  });

  it('migrates a story whose own component is an Astryx Switch, not one from another package', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
import {Switch as OtherSwitch} from 'other-ui';
export default {title: 'Switch'};
export const Hug = {component: Switch, args: {labelSpacing: 'default'}};
export const Other = {component: OtherSwitch, args: {labelSpacing: 'default'}};`;
    expect(await applyTransform(input)).toBe(
      input.replace(
        "{component: Switch, args: {labelSpacing: 'default'}}",
        "{component: Switch, args: {labelSpacing: 'hug'}}",
      ),
    );
  });

  it('migrates stories exported by name and args held in top-level bindings', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
const baseArgs = {labelSpacing: 'default'};
export default {component: Switch, args: baseArgs};
const Primary = {args: {labelSpacing: 'default'}};
export {Primary};
const unrelated = {labelSpacing: 'default'};`;
    expect(await applyTransform(input)).toBe(
      input
        .replace(
          "const baseArgs = {labelSpacing: 'default'}",
          "const baseArgs = {labelSpacing: 'hug'}",
        )
        .replace(
          "{args: {labelSpacing: 'default'}}",
          "{args: {labelSpacing: 'hug'}}",
        ),
    );
  });

  it('honours includeStories and excludeStories', async () => {
    const exclude = `import {Switch} from '@astryxdesign/core';
export default {component: Switch, excludeStories: /Fixture$/};
export const switchFixture = {args: {labelSpacing: 'default'}};
export const Hug = {args: {labelSpacing: 'default'}};`;
    expect(await applyTransform(exclude)).toBe(
      exclude.replace(
        "Hug = {args: {labelSpacing: 'default'}}",
        "Hug = {args: {labelSpacing: 'hug'}}",
      ),
    );
    const include = `import {Switch} from '@astryxdesign/core';
export default {component: Switch, includeStories: ['Hug']};
export const fixture = {args: {labelSpacing: 'default'}};
export const Hug = {args: {labelSpacing: 'default'}};`;
    expect(await applyTransform(include)).toBe(
      include.replace(
        "Hug = {args: {labelSpacing: 'default'}}",
        "Hug = {args: {labelSpacing: 'hug'}}",
      ),
    );
  });

  it('leaves named exports unchanged when the story filter cannot be read', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
export default {component: Switch, excludeStories: [...FIXTURES]};
export const Hug = {args: {labelSpacing: 'default'}};`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('leaves args and argTypes shared with another component story unchanged', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
import {Toggle} from 'other-ui';
const sharedArgs = {labelSpacing: 'default'};
const sharedArgTypes = {labelSpacing: {options: ['default', 'spread']}};
export default {component: Switch};
export const SwitchStory = {args: sharedArgs, argTypes: sharedArgTypes};
export const ToggleStory = {component: Toggle, args: sharedArgs, argTypes: sharedArgTypes};`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('leaves bindings referenced elsewhere and let or var bindings unchanged', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
let meta = {component: Switch, args: {labelSpacing: 'default'}};
meta = {component: Switch};
export default meta;
var args = {labelSpacing: 'default'};
export const Hug = {args};
const reused = {labelSpacing: 'default'};
export const Spread = {...{args: reused}};
export const Again = {args: reused};`;
    expect(await applyTransform(input)).toBe(input);
  });
});
