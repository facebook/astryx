// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {parsePropType} from '../components/component-detail/parsePropType';

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

  it('uses valid semantic icon options for XDSIconType props', () => {
    const control = parsePropType('XDSIconType', 'labelIcon');

    expect(control).toMatchObject({
      kind: 'enum',
      allowEmpty: true,
    });
    expect(control).toEqual(
      expect.objectContaining({
        options: expect.arrayContaining(['info', 'success', 'error', 'search']),
      }),
    );
    if (control.kind === 'enum') {
      expect(control.options).not.toContain('checkCircle');
      expect(control.options).not.toContain('xCircle');
    }
  });
});
