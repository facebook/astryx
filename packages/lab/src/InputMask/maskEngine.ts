// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file maskEngine.ts
 * @input Pure string/caret math; no React, no DOM
 * @output Exports mask resolution, formatting, caret mapping and ghost helpers (RFC #4946)
 * @position InputMask internal engine; consumed by InputMask.tsx
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/InputMask/maskEngine.test.ts
 * - /packages/lab/src/InputMask/InputMask.tsx
 */

export interface MaskProp {
  /** Mask pattern: `#` is a digit slot, every other character is a literal. */
  pattern: string;
  /** Character shown for unfilled slots in the ghost hint. @default '_' */
  placeholder?: string;
}

export interface MaskDefinition {
  pattern: string;
  placeholder: string;
}

export function resolveMask(mask: MaskProp): MaskDefinition {
  return {pattern: mask.pattern, placeholder: mask.placeholder ?? '_'};
}

export function maxRawLength(def: MaskDefinition): number {
  let count = 0;
  for (const ch of def.pattern) {
    if (ch === '#') {
      count++;
    }
  }
  return count;
}

export function stripToRaw(def: MaskDefinition, text: string): string {
  return text.replace(/\D/g, '').slice(0, maxRawLength(def));
}

/**
 * Formats raw digits through the pattern with eager literals: every literal
 * run flushes together with the digit it precedes or follows, so after typing
 * "555" a phone mask already reads "(555) " and the next digit lands in the
 * next slot. An empty raw value renders nothing (no dangling leading literal).
 */
export function formatRaw(def: MaskDefinition, raw: string): string {
  let out = '';
  let pendingLiterals = '';
  let rawIndex = 0;
  for (const ch of def.pattern) {
    if (ch === '#') {
      if (rawIndex >= raw.length) {
        // Stopping at an unfilled slot: flush the trailing literal run only
        // if at least one digit was emitted, so an empty value stays empty.
        return out === '' ? '' : out + pendingLiterals;
      }
      out += pendingLiterals + raw[rawIndex];
      pendingLiterals = '';
      rawIndex++;
    } else {
      pendingLiterals += ch;
    }
  }
  return out === '' ? '' : out + pendingLiterals;
}

/**
 * Display caret position sitting after raw digit `rawIndex - 1` (and after
 * any literals flushed with it) — the position where the next digit types
 * into the following slot. Digit identity is irrelevant to positions.
 */
export function caretForRawIndex(
  def: MaskDefinition,
  rawIndex: number,
): number {
  return formatRaw(def, '0'.repeat(rawIndex)).length;
}

export function rawIndexForCaret(formatted: string, caret: number): number {
  let count = 0;
  for (let i = 0; i < caret && i < formatted.length; i++) {
    if (formatted[i] >= '0' && formatted[i] <= '9') {
      count++;
    }
  }
  return count;
}

/**
 * The unfilled tail of the mask, with `#` slots shown as the placeholder
 * character — rendered by InputMask as an aria-hidden ghost after the typed
 * text, USWDS-style, so the remaining shape stays visible while typing.
 */
export function ghostRemainder(def: MaskDefinition, raw: string): string {
  const template = def.pattern.replaceAll('#', def.placeholder);
  return template.slice(formatRaw(def, raw).length);
}
