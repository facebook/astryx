// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file maskEngine.ts
 * @input Pure string/caret math; no React, no DOM
 * @output Exports mask resolution, formatting, edit resolution, caret mapping and ghost helpers (RFC #4946)
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

export type DeleteDirection = 'backward' | 'forward' | null;

export interface DisplayEdit {
  /** Raw digits after the edit, clamped to the mask capacity. */
  raw: string;
  /** Display caret to restore once the new value is rendered. */
  caret: number;
}

export function resolveMask(mask: MaskProp): MaskDefinition {
  return {pattern: mask.pattern, placeholder: mask.placeholder ?? '_'};
}

function digitsOf(text: string): string {
  return text.replace(/\D/g, '');
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

/**
 * Normalizes a raw-digits value from the `value`/`defaultValue` props: keeps
 * the digits and clamps them to the mask capacity. Never feed it a display
 * string — a pattern's literals may be digits too (`'(+1) ###'`); edits to
 * the display go through `resolveEdit`.
 */
export function clampRaw(def: MaskDefinition, value: string): string {
  return digitsOf(value).slice(0, maxRawLength(def));
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
 * Display position of raw slot `rawIndex`: after the digit before it and any
 * literals flushed with it, where the next digit types into that slot. Raw
 * index 0 sits after the leading literals; once every slot is filled the
 * caret rests at the end of the pattern.
 */
export function caretForRawIndex(
  def: MaskDefinition,
  rawIndex: number,
): number {
  let seen = 0;
  for (let i = 0; i < def.pattern.length; i++) {
    if (def.pattern[i] === '#') {
      if (seen === rawIndex) {
        return i;
      }
      seen++;
    }
  }
  return def.pattern.length;
}

/**
 * The digits sitting in `#` slots of a display string the mask rendered
 * itself. Its characters line up with the pattern one-to-one, so a digit at
 * a literal position is a literal, never typed data.
 */
function slotDigits(
  def: MaskDefinition,
  display: string,
  from: number,
  to: number,
): string {
  let out = '';
  for (let i = from; i < to; i++) {
    if (def.pattern[i] === '#') {
      out += display[i];
    }
  }
  return out;
}

/**
 * The digits of text an edit inserted at pattern position `at`. Text that
 * carries the mask's own literals in place (a copied formatted value) is
 * read against the pattern, so a literal digit stays a literal; anything
 * else is loose input and every digit in it counts.
 */
function insertedDigits(def: MaskDefinition, at: number, text: string): string {
  let aligned = '';
  for (let i = 0; i < text.length; i++) {
    const expected = def.pattern[at + i];
    const ch = text[i];
    if (expected === '#' ? ch < '0' || ch > '9' : ch !== expected) {
      return digitsOf(text);
    }
    if (expected === '#') {
      aligned += ch;
    }
  }
  return aligned;
}

/**
 * Resolves a browser edit of the formatted display into the raw digits and
 * the caret to restore. `prevDisplay` is what the mask rendered before the
 * edit, so its digits are read by slot position; whatever the edit inserted
 * (typed, pasted, dropped) goes through `insertedDigits`.
 *
 * A browser edit replaces one contiguous range and leaves the caret at the
 * end of what it inserted, so everything after the caret is untouched
 * display. When that does not hold (a programmatic value, undo) the whole
 * value is read as fresh input.
 */
export function resolveEdit(
  def: MaskDefinition,
  prevDisplay: string,
  nextDisplay: string,
  caret: number,
  deleteDirection: DeleteDirection = null,
): DisplayEdit {
  const tail = nextDisplay.slice(caret);
  const kept = prevDisplay.endsWith(tail) ? tail.length : 0;
  const insertEnd = nextDisplay.length - kept;
  const removeEnd = prevDisplay.length - kept;
  let prefix = 0;
  while (
    prefix < Math.min(insertEnd, removeEnd) &&
    prevDisplay[prefix] === nextDisplay[prefix]
  ) {
    prefix++;
  }

  const inserted = nextDisplay.slice(prefix, insertEnd);
  let head =
    slotDigits(def, prevDisplay, 0, prefix) +
    insertedDigits(def, prefix, inserted);
  let rest = slotDigits(def, prevDisplay, removeEnd, prevDisplay.length);

  if (
    inserted === '' &&
    removeEnd > prefix &&
    slotDigits(def, prevDisplay, prefix, removeEnd) === ''
  ) {
    // Only literals were deleted; the mask would put them straight back, so
    // delete through to the digit the user was aiming at.
    if (deleteDirection === 'backward') {
      head = head.slice(0, -1);
    } else if (deleteDirection === 'forward') {
      rest = rest.slice(1);
    }
  }

  const raw = (head + rest).slice(0, maxRawLength(def));
  const rawCaret = Math.min(head.length, raw.length);
  return {raw, caret: raw === '' ? 0 : caretForRawIndex(def, rawCaret)};
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
