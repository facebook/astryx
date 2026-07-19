// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useFormObserver.ts
 *
 * A framework-agnostic, DOM-derived form-state observer. The playground renders
 * the frozen, unmodified generated solutions, so we cannot tap each framework's
 * internal store without editing the artifact. Instead we observe the rendered
 * Astryx inputs directly — value, validity (aria-invalid), and status message —
 * which every target expresses identically through the same Astryx components.
 *
 * This gives a uniform, honest state view across all four frameworks. It reads
 * what the user actually sees, which is the right signal for visual judging.
 */

import {useEffect, useRef, useState, useCallback} from 'react';

export interface FieldState {
  name: string;
  label: string;
  type: string;
  value: string;
  touched: boolean;
  invalid: boolean;
  error: string | null;
}

export interface ObservedFormState {
  fields: FieldState[];
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: string[];
  invalidCount: number;
  isValid: boolean;
  lastSubmit: unknown;
  submitCount: number;
}

const EMPTY: ObservedFormState = {
  fields: [],
  values: {},
  errors: {},
  touched: [],
  invalidCount: 0,
  isValid: true,
  lastSubmit: null,
  submitCount: 0,
};

/** Resolve a control's accessible label from aria-labelledby / label / name. */
function labelFor(el: Element, root: HTMLElement): string {
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => root.querySelector(`#${CSS.escape(id)}`)?.textContent?.trim())
      .filter(Boolean);
    if (parts.length) {return parts.join(' ');}
  }
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) {return ariaLabel;}
  const id = el.getAttribute('id');
  if (id) {
    const lbl = root.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (lbl?.textContent) {return lbl.textContent.trim();}
  }
  return el.getAttribute('name') || el.getAttribute('data-testid') || 'field';
}

/** Read the status/error text associated with a control via aria-describedby. */
function errorFor(el: Element, root: HTMLElement): string | null {
  if (el.getAttribute('aria-invalid') !== 'true') {return null;}
  const describedBy = el.getAttribute('aria-describedby');
  if (describedBy) {
    for (const id of describedBy.split(/\s+/)) {
      const node = root.querySelector(`#${CSS.escape(id)}`);
      const txt = node?.textContent?.trim();
      if (txt) {return txt;}
    }
  }
  return 'Invalid';
}

function controlValue(el: Element): string {
  const input = el as HTMLInputElement;
  if (input.type === 'checkbox') {return input.checked ? 'true' : 'false';}
  return input.value ?? '';
}

export function useFormObserver(deps: unknown[]): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  state: ObservedFormState;
  reset: () => void;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<ObservedFormState>(EMPTY);
  const touchedRef = useRef<Set<string>>(new Set());
  const submitRef = useRef<{count: number; last: unknown}>({count: 0, last: null});

  const scan = useCallback(() => {
    const root = containerRef.current;
    if (!root) {return;}
    const controls = Array.from(
      root.querySelectorAll('input, textarea, select'),
    ).filter((el) => (el as HTMLInputElement).type !== 'submit');

    const fields: FieldState[] = [];
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};
    let invalidCount = 0;

    controls.forEach((el, i) => {
      const name =
        el.getAttribute('name') ||
        el.getAttribute('id') ||
        labelFor(el, root) ||
        `field-${i}`;
      const label = labelFor(el, root);
      const type = (el as HTMLInputElement).type || el.tagName.toLowerCase();
      const value = controlValue(el);
      const invalid = el.getAttribute('aria-invalid') === 'true';
      const error = errorFor(el, root);
      if (invalid) {invalidCount++;}
      if (error) {errors[name] = error;}
      values[name] = value;
      fields.push({
        name,
        label,
        type,
        value,
        touched: touchedRef.current.has(name),
        invalid,
        error,
      });
    });

    setState({
      fields,
      values,
      errors,
      touched: Array.from(touchedRef.current),
      invalidCount,
      isValid: invalidCount === 0,
      lastSubmit: submitRef.current.last,
      submitCount: submitRef.current.count,
    });
  }, []);

  const reset = useCallback(() => {
    touchedRef.current = new Set();
    submitRef.current = {count: 0, last: null};
    setState(EMPTY);
    // allow the newly mounted form to settle, then scan
    requestAnimationFrame(scan);
  }, [scan]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) {return;}

    const onInput = (e: Event) => {
      const t = e.target as HTMLElement;
      const name =
        t.getAttribute?.('name') || t.getAttribute?.('id') || labelFor(t, root);
      if (name) {touchedRef.current.add(name);}
      scan();
    };
    const onBlur = (e: Event) => {
      const t = e.target as HTMLElement;
      const name =
        t.getAttribute?.('name') || t.getAttribute?.('id') || labelFor(t, root);
      if (name) {touchedRef.current.add(name);}
      scan();
    };
    const onSubmit = (_e: Event) => {
      submitRef.current.count += 1;
      // capture the payload from current field values
      const payload: Record<string, string> = {};
      root
        .querySelectorAll('input, textarea, select')
        .forEach((el) => {
          const n = el.getAttribute('name') || el.getAttribute('id');
          if (n) {payload[n] = controlValue(el);}
        });
      submitRef.current.last = payload;
      // let validation render, then scan
      setTimeout(scan, 50);
    };

    root.addEventListener('input', onInput, true);
    root.addEventListener('change', onInput, true);
    root.addEventListener('blur', onBlur, true);
    root.addEventListener('submit', onSubmit, true);

    // Observe DOM mutations (validation messages appearing/disappearing).
    const mo = new MutationObserver(() => scan());
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-invalid', 'aria-describedby', 'value'],
    });

    // Initial scan after mount.
    const raf = requestAnimationFrame(scan);

    return () => {
      root.removeEventListener('input', onInput, true);
      root.removeEventListener('change', onInput, true);
      root.removeEventListener('blur', onBlur, true);
      root.removeEventListener('submit', onSubmit, true);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, deps);

  return {containerRef, state, reset};
}
