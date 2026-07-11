// Copyright (c) Meta Platforms, Inc. and affiliates.

import {getIconRegistry} from '@astryxdesign/core/Icon';
import {describe, expect, it} from 'vitest';
import {
  coerceDefault,
  coerceEnumOption,
  parsePropType,
} from '../components/component-detail/parsePropType';

describe('component detail prop controls', () => {
  it('treats InputStatus as an editable status object control', () => {
    expect(parsePropType('InputStatus', 'status')).toEqual({
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

  it('keeps input status props as status controls even if slot elements are present', () => {
    expect(
      parsePropType('XDSInputStatus', 'status', [
        {
          __element: 'XDSFieldStatus',
          props: {type: 'error', message: 'Error'},
        },
      ]),
    ).toEqual({
      kind: 'input-status',
      options: ['error', 'warning', 'success'],
      allowEmpty: true,
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

  it('derives IconType options from the canonical icon registry', () => {
    const control = parsePropType('IconType', 'labelIcon');

    expect(control).toMatchObject({
      kind: 'enum',
      allowEmpty: true,
    });
    if (control.kind === 'enum') {
      expect(control.options).toEqual(Object.keys(getIconRegistry()));
    }
  });

  /**
   * Inlining a union into a doc's `type` changes what control the playground
   * renders for it (#1645). For most props that is an improvement — an
   * unknown type becomes a real enum picker. For two it would be a
   * regression, and those two are deliberately left naming their type. These
   * assertions pin both halves of that bargain so a later "let's finish the
   * job and inline the last few" cannot quietly break the preview.
   */
  describe('inlining a union does not degrade the playground control (#1645)', () => {
    it('leaves SpacingStep exactly as it was — same enum, before and after', () => {
      const inlined = '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10';
      const expected = {
        kind: 'enum',
        options: ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10'],
        allowEmpty: false,
      };
      // SpacingStep is special-cased in parsePropType, so both spellings must
      // land on the identical descriptor — the docs change is a no-op here.
      expect(parsePropType('SpacingStep', 'gap')).toEqual(expected);
      expect(parsePropType(inlined, 'gap')).toEqual(expected);
      expect(parsePropType(inlined, 'gap')).toEqual(
        parsePropType('SpacingStep', 'gap'),
      );
    });

    it('upgrades GridAlignment, TextSize and TextType from unknown to enum', () => {
      // Named, these are opaque: no control at all. Inlined, they become
      // pickers — the whole point of the change.
      expect(parsePropType('GridAlignment', 'align')).toEqual({
        kind: 'unknown',
      });
      expect(
        parsePropType("'start' | 'center' | 'end' | 'stretch'", 'align'),
      ).toEqual({
        kind: 'enum',
        options: ['start', 'center', 'end', 'stretch'],
        allowEmpty: false,
      });

      expect(parsePropType('TextSize', 'size')).toEqual({kind: 'unknown'});
      expect(
        parsePropType(
          "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | " +
            "'2xl' | '3xl' | '4xl'",
          'size',
        ),
      ).toMatchObject({kind: 'enum', allowEmpty: false});

      expect(parsePropType('TextType', 'type')).toEqual({kind: 'unknown'});
      const textType = parsePropType(
        "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | " +
          "'display-2' | 'display-3' | 'inherit'",
        'type',
      );
      expect(textType).toMatchObject({kind: 'enum', allowEmpty: false});
      if (textType.kind === 'enum') {
        // 'inherit' is one of the latent doc bugs this change fixed.
        expect(textType.options).toContain('inherit');
      }
    });

    it('keeps AppShell.mobileNav a bare ReactNode, because the hide is an exact match', () => {
      // PropertyEditor hides a prop via UNSUPPORTED_PROP_TYPES, a Set of
      // exact type strings containing 'ReactNode'. Widening mobileNav's doc
      // type to its true union would no longer match that string, so the prop
      // would reappear in the editor as an editable *string* and feed the
      // preview a string where a config object belongs.
      expect(parsePropType('ReactNode', 'mobileNav')).toEqual({kind: 'string'});
      const widened = parsePropType(
        "false | {hasToggle?: boolean, breakpoint?: 'sm' | 'md' | 'lg' | 'none'} | ReactNode",
        'mobileNav',
      );
      // Still a string control — but no longer the exact 'ReactNode' string
      // that the editor hides on, which is the trap. Its legal values live in
      // the description instead.
      expect(widened).toEqual({kind: 'string'});
      expect(
        "false | {hasToggle?: boolean, breakpoint?: 'sm' | 'md' | 'lg' | 'none'} | ReactNode",
      ).not.toBe('ReactNode');
    });

    it('keeps Lightbox.media naming its type, because spelling it out yields a string control', () => {
      // LightboxMedia is an object the preview must receive as an object.
      // Spelling the shape out makes parsePropType see a ReactNode-free
      // composite it cannot build a control for; the editor would then hand
      // the preview raw text. Left named, it stays unknown and uneditable.
      expect(parsePropType('LightboxMedia | LightboxMedia[]', 'media')).toEqual(
        {kind: 'unknown'},
      );
      // The inlined shape is *not* a safe substitute — it does not resolve to
      // anything that round-trips an object.
      const inlined = parsePropType(
        "{src: string, alt: string, caption?: string, type?: 'image' | 'video'}",
        'media',
      );
      expect(inlined).not.toMatchObject({kind: 'enum'});
    });
  });
});
