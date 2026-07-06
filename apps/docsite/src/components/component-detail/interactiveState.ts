// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Builds the initial prop state for component detail interactive previews.
 * Keeps runtime-only defaults (callbacks, mock search sources, descriptor
 * resolution) and preview-only controlled callbacks out of the generated JSON
 * registries while preserving typed option values from parsed controls.
 */

import {allSyntaxPresets} from '@astryxdesign/core/theme/syntax';
import {themeObjectsFull} from '../../generated/themeRegistry';
import {
  coerceDefault,
  coerceEnumOption,
  parsePropType,
  type PropControlDescriptor,
} from './parsePropType';
import {resolveValue} from './resolveElements';
import type {
  PropDoc,
  PlaygroundConfig,
} from '../../generated/componentRegistry';

export interface KnobProp {
  row: PropDoc;
  control: PropControlDescriptor;
}

const PREVIEW_SEARCH_ITEMS = [
  {id: 'dashboard', label: 'Dashboard'},
  {id: 'projects', label: 'Projects'},
  {id: 'settings', label: 'Settings'},
];

const PREVIEW_SEARCH_SOURCE = {
  search(query: string) {
    const normalized = query.trim().toLowerCase();
    if (normalized === '') {
      return PREVIEW_SEARCH_ITEMS;
    }
    return PREVIEW_SEARCH_ITEMS.filter(item =>
      item.label.toLowerCase().includes(normalized),
    );
  },
  bootstrap() {
    return PREVIEW_SEARCH_ITEMS;
  },
  cancel() {},
};

export function pickPrimaryProps(name: string, props: PropDoc[]): KnobProp[] {
  if (props.length === 0) {
    return [];
  }
  return props.map(row => ({
    row,
    control: parsePropType(row.type, row.name, row.slotElements),
  }));
}

function resolveThemeValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return resolveValue(value);
  }

  const byPackageName = themeObjectsFull[value];
  if (byPackageName) {
    return byPackageName;
  }

  return (
    Object.values(themeObjectsFull).find(theme => theme.name === value) ?? value
  );
}

function resolveSyntaxThemeValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return resolveValue(value);
  }

  return allSyntaxPresets.find(theme => theme.name === value) ?? value;
}

function resolveDefaultValue(
  value: unknown,
  control: PropControlDescriptor | undefined,
): unknown {
  if (control?.kind === 'theme') {
    return resolveThemeValue(value);
  }
  if (control?.kind === 'syntax-theme') {
    return resolveSyntaxThemeValue(value);
  }
  return resolveValue(value);
}

function getRequiredFallbackValue(
  row: PropDoc,
  control: PropControlDescriptor,
): unknown {
  switch (control.kind) {
    case 'enum':
      return coerceEnumOption(control, control.options[0]);
    case 'theme':
      return Object.values(themeObjectsFull)[0];
    case 'syntax-theme':
      return allSyntaxPresets[0];
    case 'input-status':
      return {
        type: control.options[0],
        message: `${control.options[0]} status`,
      };
    case 'boolean':
      return false;
    case 'string':
      return row.name;
    case 'number':
      return 0;
    case 'callback':
      return () => {};
    case 'element':
      return row.slotElements?.[0] != null
        ? resolveValue(row.slotElements[0])
        : undefined;
    case 'slot-list':
      return buildSlotListDefault(row);
    case 'unknown':
      if (/\bSearchSource\b/.test(row.type)) {
        return PREVIEW_SEARCH_SOURCE;
      }
      if (/\bnull\b/.test(row.type)) {
        return null;
      }
      return undefined;
  }
}

function buildSlotListDefault(row: PropDoc): unknown[] | undefined {
  const slotEl = row.slotElements?.[0];
  if (!slotEl) {
    return undefined;
  }
  return [1, 2, 3].map(n => {
    const tweaked = {...slotEl};
    const props = {...(tweaked.props ?? {})};
    if (typeof props.label === 'string') {
      props.label = `${props.label} ${n}`;
    }
    if (typeof props.value === 'string') {
      props.value = `${props.value}-${n}`;
    }
    tweaked.props = props;
    if (typeof tweaked.children === 'string') {
      tweaked.children = `${tweaked.children} ${n}`;
    }
    return resolveValue(tweaked);
  });
}

export function buildInitialState(
  knobs: KnobProp[],
  playground?: PlaygroundConfig | null,
): Record<string, unknown> {
  const state: Record<string, unknown> = {};

  const controlByName = new Map(
    knobs.map(({row, control}) => [row.name, control]),
  );

  // Apply playground defaults first (resolved from ElementDescriptor if needed)
  if (playground?.defaults) {
    for (const [key, value] of Object.entries(playground.defaults)) {
      state[key] = resolveDefaultValue(value, controlByName.get(key));
    }
  }

  // Fill in remaining props from doc defaults / auto-generation
  for (const {row, control} of knobs) {
    if (state[row.name] !== undefined) {
      continue;
    }
    const def = coerceDefault(row.default, control);
    if (def !== undefined) {
      state[row.name] = def;
    } else if (control.kind === 'slot-list') {
      // Always generate initial items for slot-lists (empty list isn't useful)
      const slotList = buildSlotListDefault(row);
      if (slotList !== undefined) {
        state[row.name] = slotList;
      }
    } else if (row.required) {
      const fallback = getRequiredFallbackValue(row, control);
      if (fallback !== undefined) {
        state[row.name] = fallback;
      }
    }
  }
  return state;
}

/**
 * True when an overlay-mode component (`playground.overlay`) is closed in the
 * current preview state. The component renders nothing inline while closed
 * (e.g. a `showModal()` drawer), so the stage shows an open-trigger
 * placeholder instead of an empty box.
 */
export function isOverlayPreviewClosed(
  playground: PlaygroundConfig | null | undefined,
  state: Record<string, unknown>,
): boolean {
  return playground?.overlay === true && state.isOpen !== true;
}

export function getMissingRequiredProps(
  knobs: KnobProp[],
  state: Record<string, unknown>,
): string[] {
  return knobs
    .filter(({row}) => row.required === true && state[row.name] === undefined)
    .map(({row}) => row.name);
}

/**
 * Returns the name of a callback's first parameter from its stringified type,
 * e.g. `(page: number) => void` → `page`. Returns `null` for unnamed params.
 */
function getCallbackTargetProp(type: string): string | null {
  const match = /^\s*\(\s*([^):,]+)/.exec(type);
  if (!match) {
    return null;
  }
  const name = match[1].trim().replace(/\?$/, '');
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : null;
}

/**
 * Wires controlled-component change handlers back into playground state so the
 * preview reflects interaction (clicking a Pagination page, etc.). A callback
 * whose first parameter names a value prop in `state` (page/onChange,
 * value/onChange, pageSize/onPageSizeChange) replaces its noop with one that
 * updates that prop. isOpen/onOpenChange stays gated behind canControlOpenState.
 */
export function buildRuntimePreviewState(
  state: Record<string, unknown>,
  onPropChange?: (propName: string, value: unknown) => void,
  options?: {canControlOpenState?: boolean; knobs?: KnobProp[]},
): Record<string, unknown> {
  if (onPropChange == null) {
    return state;
  }

  const next: Record<string, unknown> = {...state};
  let changed = false;

  for (const {row, control} of options?.knobs ?? []) {
    if (control.kind !== 'callback') {
      continue;
    }
    // Only change handlers — not side-effect callbacks (changeAction) or
    // one-off events (onClick).
    if (!/^on[A-Z].*Change$/.test(row.name) && row.name !== 'onChange') {
      continue;
    }
    const target = getCallbackTargetProp(row.type);
    if (target == null || !(target in state)) {
      continue;
    }
    if (target === 'isOpen' && options?.canControlOpenState !== true) {
      continue;
    }
    next[row.name] = (value: unknown) => onPropChange(target, value);
    changed = true;
  }

  // Fallback when knobs aren't supplied: bridge a controllable isOpen pair.
  if (
    !changed &&
    options?.canControlOpenState === true &&
    typeof state.isOpen === 'boolean'
  ) {
    next.onOpenChange = (isOpen: boolean) => onPropChange('isOpen', isOpen);
    return next;
  }

  return changed ? next : state;
}
