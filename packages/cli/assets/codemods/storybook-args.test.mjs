// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';
import {
  importedComponentBindings,
  storybookArgObjects,
} from './storybook-args.mjs';

const j = jscodeshift.withParser('tsx');

/** @param {string} source */
function found(source) {
  const root = j(source);
  const bindings = importedComponentBindings(root, j, {
    matchesImport: value => value.startsWith('@astryxdesign/core'),
    components: new Set(['Text']),
  });
  return storybookArgObjects(root, j, bindings).map(({kind, path}) => [
    kind,
    j(path.node).toSource(),
  ]);
}

describe('storybookArgObjects', () => {
  it('returns meta args, argTypes, and story args for an imported component', () => {
    expect(
      found(`import {Text as T} from '@astryxdesign/core';
const meta = {component: T, args: {a: 1}, argTypes: {b: {}}} as const;
export default meta;
export const One = {args: {c: 2}};`),
    ).toEqual([
      ['args', '{a: 1}'],
      ['argTypes', '{b: {}}'],
      ['args', '{c: 2}'],
    ]);
  });

  it('resolves a namespace member and an inline default export', () => {
    expect(
      found(`import * as A from '@astryxdesign/core';
export default {component: A.Text, args: {a: 1}};`),
    ).toEqual([['args', '{a: 1}']]);
  });

  it('returns nothing for another package, an unimported name, or no meta', () => {
    expect(
      found(`import {Text} from 'react-native';
export default {component: Text, args: {a: 1}};`),
    ).toEqual([]);
    expect(found(`export default {component: Text, args: {a: 1}};`)).toEqual(
      [],
    );
    expect(
      found(`import {Text} from '@astryxdesign/core';
const meta = {component: Text, args: {a: 1}};`),
    ).toEqual([]);
  });

  it('skips a story that names its own component', () => {
    expect(
      found(`import {Text} from '@astryxdesign/core';
import {Other} from 'other-ui';
export default {component: Text};
export const Mixed = {component: Other, args: {a: 1}};`),
    ).toEqual([]);
  });
});
