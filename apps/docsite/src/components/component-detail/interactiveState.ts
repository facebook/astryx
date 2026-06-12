// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Builds the initial prop state for component detail interactive previews.
 * Keeps runtime-only defaults (callbacks, mock search sources, descriptor
 * resolution) out of the generated JSON registries while preserving typed
 * option values from parsed controls.
 */

import {allSyntaxPresets} from '@xds/core/theme/syntax';
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
      if (/\bXDSSearchSource\b/.test(row.type)) {
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

export function getMissingRequiredProps(
  knobs: KnobProp[],
  state: Record<string, unknown>,
): string[] {
  return knobs
    .filter(({row}) => row.required === true && state[row.name] === undefined)
    .map(({row}) => row.name);
}
