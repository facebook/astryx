// Copyright (c) Meta Platforms, Inc. and affiliates.

import {getIconRegistry} from '@xds/core/Icon';
import {describe, expect, it} from 'vitest';
import {
  coerceDefault,
  coerceEnumOption,
  parsePropType,
} from '../components/component-detail/parsePropType';

describe('component detail prop controls', () => {
  it('treats XDSInputStatus as an editable status object control', () => {
    expect(parsePropType('XDSInputStatus', 'status')).toEqual({
      kind: 'input-status',
      options: ['error', 'warning', 'success'],
      allowEmpty: true,
    });
  });

  it('treats inline status object types as editable status object controls', () => {
    expect(
      parsePropType(
        "{ type: 'error' | 'warning' | 'success', message: string }",
        'status',
      ),
    ).toEqual({
      kind: 'input-status',
      options: ['error', 'warning', 'success'],
      allowEmpty: true,
    });
  });

  it('preserves narrower inline status option unions', () => {
    expect(
      parsePropType(
        "{ type: 'error' | 'warning'; message?: string }",
        'status',
      ),
    ).toEqual({
      kind: 'input-status',
      options: ['error', 'warning'],
      allowEmpty: true,
    });
  });

  it('does not confuse delivery status unions for input status objects', () => {
    expect(
      parsePropType(
        "'sending' | 'sent' | 'delivered' | 'read' | 'error'",
        'status',
      ),
    ).toEqual({
      kind: 'enum',
      options: ['sending', 'sent', 'delivered', 'read', 'error'],
      allowEmpty: false,
    });
  });

  it('expands mixed string-literal and boolean unions into enum options', () => {
    const control = parsePropType("'auto' | boolean", 'hasHoverIndication');

    expect(control).toMatchObject({
      kind: 'enum',
      options: ['auto', 'true', 'false'],
      allowEmpty: false,
    });
    if (control.kind === 'enum') {
      expect(coerceEnumOption(control, 'auto')).toBe('auto');
      expect(coerceEnumOption(control, 'true')).toBe(true);
      expect(coerceEnumOption(control, 'false')).toBe(false);
      expect(coerceDefault('true', control)).toBe(true);
      expect(coerceDefault('false', control)).toBe(false);
      expect(coerceDefault("'auto'", control)).toBe('auto');
    }
  });

  it('derives XDSIconType options from the canonical icon registry', () => {
    const control = parsePropType('XDSIconType', 'labelIcon');

    expect(control).toMatchObject({
      kind: 'enum',
      allowEmpty: true,
    });
    if (control.kind === 'enum') {
      expect(control.options).toEqual(Object.keys(getIconRegistry()));
    }
  });
});
