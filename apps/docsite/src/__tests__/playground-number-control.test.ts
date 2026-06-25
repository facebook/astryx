// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file playground-number-control.test.ts
 *
 * Regression coverage for the playground "number" knob (issue: a Card with an
 * unset \`maxWidth\` showed \`0\` in the editor, and stepping 0 -> 1 -> 0 left a
 * literal \`maxWidth={0}\` in the source — collapsing sizing props with no path
 * back to the original unset render).
 *
 * Two invariants are pinned here:
 *  1. \`SizeValue\` (and bare \`number\`) resolve to the \`number\` control, so size
 *     props get a numeric knob in the first place.
 *  2. Clearing a numeric prop in the Properties popover removes the attribute
 *     from source (returning it to unset) instead of writing a literal value.
 *     This mirrors the \`commit('number', null)\` branch in PropertyEditor.
 */

import {describe, expect, it} from 'vitest';
import {parsePropType} from '../components/component-detail/parsePropType';
import {
  analyzeCode,
  formatAttr,
  removeAttribute,
  setAttribute,
  type InstanceInfo,
} from '../app/playground/propertyEditor/componentInstances';

function firstInstance(code: string): InstanceInfo {
  const instances = analyzeCode(code);
  expect(instances).not.toBeNull();
  expect(instances!.length).toBeGreaterThan(0);
  return instances![0];
}

/**
 * Mirror of PropertyEditor's number commit handler: a null value clears the
 * prop, any concrete number writes a literal.
 */
function commitNumber(
  code: string,
  instance: InstanceInfo,
  name: string,
  value: number | null,
): string {
  return value == null
    ? removeAttribute(code, instance, name)
    : setAttribute(code, instance, name, formatAttr(name, 'number', value));
}

describe('playground number control', () => {
  it('maps SizeValue and number to the number control', () => {
    expect(parsePropType('SizeValue', 'maxWidth')).toEqual({kind: 'number'});
    expect(parsePropType('number', 'ratio')).toEqual({kind: 'number'});
  });

  it('clearing a numeric prop removes it from source (no literal left behind)', () => {
    const base = '<Card>content</Card>';

    // Step the value up to 1, as the stepper would.
    const withMaxWidth = commitNumber(base, firstInstance(base), 'maxWidth', 1);
    expect(withMaxWidth).toBe('<Card maxWidth={1}>content</Card>');

    // Clearing returns the prop to unset rather than writing maxWidth={0}.
    const cleared = commitNumber(
      withMaxWidth,
      firstInstance(withMaxWidth),
      'maxWidth',
      null,
    );
    expect(cleared).toBe(base);
    expect(cleared).not.toContain('maxWidth');
  });

  it('explicitly setting 0 still writes a literal (0 is a valid value)', () => {
    const base = '<Card>content</Card>';
    const withZero = commitNumber(base, firstInstance(base), 'maxWidth', 0);
    expect(withZero).toBe('<Card maxWidth={0}>content</Card>');
  });
});
