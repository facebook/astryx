// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theming-target-name.js
 * @description The name of a theming target is part of its contract, so it has
 * a shape: `{parent}-{position}-{component}`.
 *
 * Canonical criteria: "Principles for authoring theming targets" in the wiki's
 * Theming Infrastructure page — https://github.com/facebook/astryx/wiki/Theming-Infrastructure
 * This rule encodes the mechanical half of principle 3 (a shared vocabulary)
 * and principle 2's "state is not a name"; the wiki is the source of truth.
 *
 * Two things are mechanically checkable in that shape, and this rule checks
 * only those two:
 *
 * 1. **The component slot.** When the target is attached directly to an
 *    internally-composed Astryx component, the last segment of the name must be
 *    that component — `icon`, `checkbox`, `button`, `divider` — not what the
 *    glyph happens to look like today. `selector-check` on an `<Icon>` names an
 *    appearance: rename the glyph and the target lies. It also has no position
 *    segment, so a sibling component cannot converge on it (principle 3). The
 *    same target as `selector-option-icon` says where it is and what it is.
 *
 * 2. **State is not a name.** A target ending in `-disabled` / `-selected` /
 *    `-checked` / `-expanded` / `-open` mints a sub-target for something that
 *    is data on the target: pass it through `themeProps({selected})`, which
 *    emits the class token and the `data-*` attribute together (principle 2).
 *
 * What is NOT checked: whether `option` or `trigger` is the right position word
 * for this spot, and whether the parent prefix matches its owning component.
 * The position vocabulary is open (trigger/option/item/row/header/leading/
 * trailing/menu…), and the prefix is not derivable from the file — `Table/`
 * renders `base-table`, `Field/` renders `input-status-icon`, and both are
 * correct. Guessing there produces noise, not findings.
 *
 * Bad:
 *   <Icon icon="check" {...themeProps('selector-check')} />
 *   themeProps('selector-option-selected')
 *
 * Good:
 *   <Icon icon="check" {...themeProps('selector-option-icon')} />
 *   themeProps('selector-option', {selected})
 */

import {
  createFileScanner,
  isHostElement,
  jsxNameRoot,
  jsxNameText,
} from './theming-target.js';

/**
 * State words that must not be the last segment of a target name. `state`
 * itself is included: `-state` as a name segment is the same mistake, except
 * after a placeholder qualifier (see `PLACEHOLDER_QUALIFIERS`).
 */
const STATE_SUFFIXES = new Set([
  'disabled',
  'selected',
  'checked',
  'unchecked',
  'expanded',
  'collapsed',
  'open',
  'closed',
  'active',
  'inactive',
  'hovered',
  'focused',
  'pressed',
  'highlighted',
  'state',
]);

/**
 * Qualifiers that make `-state` one noun naming a placeholder region rather
 * than a state modifier: `selector-empty-state` is the "no results" element
 * itself, which exists only in that condition and has nowhere else to hang its
 * target — unlike `selector-option-selected`, which is a state of an element
 * that exists either way.
 */
const PLACEHOLDER_QUALIFIERS = new Set(['empty', 'loading', 'error']);

/**
 * Composed components for which the component slot is unambiguous: leaf,
 * decorative, single-purpose things. The check is deliberately NOT applied to
 * every composed component, because the position vocabulary and the component
 * vocabulary collide on row/container primitives — principle 3 says an option
 * row is `{component}-option` in *every* list-like component, so
 * `selector-option` on the shared `<Item>` primitive is the CORRECT name, not
 * `selector-option-item`. Restricting the check to leaves keeps it from
 * arguing with the principle it is meant to support.
 */
const DEFAULT_COMPONENT_SLOTS = [
  'Icon',
  'CheckboxInput',
  'RadioInput',
  'Switch',
  'Divider',
  'Spinner',
  'Button',
  'IconButton',
  'Avatar',
  'Badge',
  'Image',
  'Thumbnail',
];

/**
 * Component names whose target segment is not simply the kebab-cased name.
 * Kept short on purpose — each entry is a naming decision already made
 * elsewhere in the system.
 */
const COMPONENT_SLOT_ALIASES = new Map([
  ['CheckboxInput', ['checkbox']],
  ['RadioInput', ['radio']],
  ['IconButton', ['button', 'icon-button']],
  ['Spinner', ['spinner', 'loader']],
]);

/** Kebab-case a PascalCase component name: `MultiSelector` → multi-selector. */
function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** Segments the last part of a target name may legitimately be for `<X>`. */
function acceptedSlots(componentName) {
  const aliases = COMPONENT_SLOT_ALIASES.get(componentName);
  if (aliases != null) {
    return new Set(aliases);
  }
  const kebabbed = kebab(componentName);
  return new Set([kebabbed, ...kebabbed.split('-')]);
}

/**
 * The target names that are this file's OWN root, from its path:
 * `Selector/SelectorOption.tsx` → `selector-option`, `selector`.
 *
 * A component's root target names the component; it has no position because it
 * IS the component (`clickable-card` on the `<Card>` it renders, `timestamp` on
 * its `<Text>`). Only the sub-element targets a component mints for its
 * internals are held to {parent}-{position}-{component}.
 */
function rootTargetNames(filename) {
  const parts = filename.split(/[\\/]/);
  const base = (parts[parts.length - 1] ?? '').replace(/\.[jt]sx?$/, '');
  const dir = parts[parts.length - 2] ?? '';
  const names = new Set();
  for (const candidate of [base, dir]) {
    if (/^[A-Z]/.test(candidate)) {
      names.add(kebab(candidate));
    }
  }
  return names;
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Theme target names follow {parent}-{position}-{component}; state is data on the target, not a name',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      appearanceInComponentSlot:
        "Theme target '{{target}}' is attached to <{{component}}>, but its " +
        "last segment is '{{slot}}' — an appearance, not the component. Name " +
        'it {parent}-{position}-{{expected}} (position: ' +
        'trigger/option/item/row/header/leading/trailing/menu…) so the target ' +
        'survives a change of glyph and a sibling component can converge on ' +
        'the same shape.',
      missingPosition:
        "Theme target '{{target}}' is attached to <{{component}}> but names " +
        'only {parent}-{component}. Add the position segment ' +
        '({parent}-{position}-{component}: trigger/option/item/row/header/' +
        'leading/trailing/menu…) so a second {{slot}} in the same component ' +
        'can be named without collision.',
      stateSubTarget:
        "Theme target '{{target}}' ends in the state '{{state}}'. State is " +
        'data on the target, not a target of its own: pass it through ' +
        "themeProps('{{base}}', {{{state}}}), which emits the class token and " +
        'the data-{{state}} attribute together.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowTargets: {
            type: 'array',
            items: {type: 'string'},
            description: 'Target names grandfathered in.',
          },
          allowFiles: {
            type: 'array',
            items: {type: 'string'},
            description: 'Substring match on the filename.',
          },
          componentSlots: {
            type: 'array',
            items: {type: 'string'},
            description:
              'Composed components whose name must appear in the target’s ' +
              'component slot. Leaves only — see DEFAULT_COMPONENT_SLOTS.',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allowTargets = new Set(options.allowTargets ?? []);
    const allowFiles = options.allowFiles ?? [];
    const componentSlots = new Set(
      options.componentSlots ?? DEFAULT_COMPONENT_SLOTS,
    );
    const scanner = createFileScanner(context);
    if (allowFiles.some((pattern) => scanner.filename.includes(pattern))) {
      return {};
    }
    const rootNames = rootTargetNames(scanner.filename);

    const elements = [];

    function checkElement(node) {
      const opening = node.openingElement;
      const targets = scanner
        .themeTargets(opening)
        .filter(
          (target) => target.name != null && !allowTargets.has(target.name),
        );
      if (targets.length === 0) {
        return;
      }

      const componentRoot = jsxNameRoot(opening.name);
      const onComponent =
        !isHostElement(opening.name) &&
        scanner.isAstryxComponent(opening.name) &&
        componentSlots.has(componentRoot);
      const componentName = jsxNameText(opening.name);
      const slots = onComponent ? acceptedSlots(componentRoot) : null;

      for (const target of targets) {
        // The component's own root target names the component, not a position
        // inside it.
        if (rootNames.has(target.name)) {
          continue;
        }
        const segments = target.name.split('-');
        const last = segments[segments.length - 1];
        const previous = segments[segments.length - 2];

        if (
          STATE_SUFFIXES.has(last) &&
          segments.length > 1 &&
          !(last === 'state' && PLACEHOLDER_QUALIFIERS.has(previous))
        ) {
          context.report({
            node: target.node,
            messageId: 'stateSubTarget',
            data: {
              target: target.name,
              state: last,
              base: segments.slice(0, -1).join('-'),
            },
          });
          continue;
        }

        if (!onComponent) {
          continue;
        }

        // `{parent}-{position}-{component}` — the trailing segments that name
        // the component may themselves be hyphenated (`…-multi-selector`).
        const namesComponent = [...slots].some(
          (slot) =>
            target.name === slot ||
            target.name.endsWith(`-${slot}`),
        );
        const expected = [...slots][0];

        if (!namesComponent) {
          context.report({
            node: target.node,
            messageId: 'appearanceInComponentSlot',
            data: {
              target: target.name,
              component: componentName,
              slot: last,
              expected,
            },
          });
          continue;
        }

        const slotSegments = expected.split('-').length;
        if (segments.length - slotSegments < 2) {
          context.report({
            node: target.node,
            messageId: 'missingPosition',
            data: {
              target: target.name,
              component: componentName,
              slot: expected,
            },
          });
        }
      }
    }

    return {
      ImportDeclaration: scanner.importDeclaration,
      VariableDeclarator: scanner.variableDeclarator,
      JSXElement(node) {
        elements.push(node);
      },
      'Program:exit'() {
        for (const node of elements) {
          checkElement(node);
        }
      },
    };
  },
};

export default rule;
