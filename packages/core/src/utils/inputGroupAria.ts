// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputGroupAria.ts
 * @input Receives InputGroup-like label and described-by IDs
 * @output Exports helpers for consistent InputGroup ARIA composition
 * @position Internal utility; used by inputs that can render inside InputGroup
 */

export interface InputGroupAriaSource {
  /** ID of the visible InputGroup label. */
  labelID: string;
  /** Space-separated IDs for group description/status text. */
  describedByIDs?: string;
}

export interface InputGroupInputAriaOptions {
  /** InputGroup context, or null when the input is standalone. */
  inputGroup: InputGroupAriaSource | null | undefined;
  /** ID of the input's own label when the group owns field chrome. */
  inputLabelID?: string;
  /** IDs for the input's own description/status text. */
  describedByIDs?: (string | null | undefined | false)[];
}

export interface InputGroupInputAria {
  /** Value for aria-labelledby on the input. */
  ariaLabelledBy?: string;
  /** Value for aria-describedby on the input. */
  ariaDescribedBy?: string;
}

function joinAriaIDs(
  ...values: (string | null | undefined | false)[]
): string | undefined {
  const ids = values
    .flatMap(value =>
      typeof value === 'string' ? value.trim().split(/\s+/) : [],
    )
    .filter(Boolean);

  if (ids.length === 0) {
    return undefined;
  }

  return Array.from(new Set(ids)).join(' ');
}

/**
 * Builds the ARIA label/description wiring for an input inside InputGroup.
 *
 * Standalone inputs keep their normal Field-driven label association. Grouped
 * inputs are named by the visible group label plus the input's own hidden label,
 * and inherit group description/status text in addition to input-local text.
 */
export function getInputGroupInputAria({
  inputGroup,
  inputLabelID,
  describedByIDs = [],
}: InputGroupInputAriaOptions): InputGroupInputAria {
  return {
    ariaLabelledBy: inputGroup
      ? joinAriaIDs(inputGroup.labelID, inputLabelID)
      : undefined,
    ariaDescribedBy: joinAriaIDs(inputGroup?.describedByIDs, ...describedByIDs),
  };
}
