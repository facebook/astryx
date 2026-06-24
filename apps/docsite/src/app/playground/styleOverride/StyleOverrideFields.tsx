// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StyleOverrideFields.tsx
 * @input A component key + the current style props + an onChange writer
 * @output Curated style controls (radius/padding) + a freeform "custom
 *   overrides" grid with a CSS-property typeahead
 * @position Playground — shared between the Theme-override editor (writes the
 *   theme literal) and the one-off instance editor (writes an xstyle block).
 *
 * Scope-agnostic: it only knows "here are the current props, call onChange to
 * set/clear one". The caller decides where the props live (theme components vs
 * an instance's stylex.create block).
 */

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VStack, HStack, StackItem} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Plus} from 'lucide-react';
import {Typeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {curatedControlsForKey} from '../themeEditor/componentThemeTargets';
import {resolveOptionLabel} from '../themeEditor/constants';
import {ALL_TOKEN_DEFAULTS} from '../themeSource';

// Common CSS properties an override might set, in the camelCase form the
// theme/xstyle pipelines expect. Not exhaustive — the typeahead still accepts
// any free-typed property via its query.
const CSS_PROPERTIES = [
  'borderRadius',
  'borderWidth',
  'borderColor',
  'borderStyle',
  'border',
  'padding',
  'paddingBlock',
  'paddingInline',
  'margin',
  'marginBlock',
  'marginInline',
  'backgroundColor',
  'background',
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'textAlign',
  'textDecoration',
  'boxShadow',
  'opacity',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'gap',
  'outlineColor',
  'outlineWidth',
  'outlineOffset',
  'transition',
  'transitionDuration',
  'cursor',
];

const CSS_PROPERTY_SOURCE = createStaticSource(
  CSS_PROPERTIES.map(name => ({id: name, label: name})),
);

const s = stylex.create({
  fullWidthField: {width: '100%'},
  inputControl: {flexShrink: 0, width: 170},
  row: {paddingBlock: 4, gap: 10},
  rowLabel: {minWidth: 0},
  addForm: {paddingTop: 'var(--spacing-1)'},
});

interface StyleOverrideFieldsProps {
  /** Theme/component key (e.g. `button`) used to pick curated controls. */
  componentKey: string;
  /** Current style props (CSS-property -> value). */
  value: Record<string, string>;
  /** Set a prop (empty string clears it). */
  onChange: (prop: string, value: string) => void;
  /** Tokens used to annotate curated option labels (e.g. radius previews). */
  labelTokens?: Record<string, string>;
}

export function StyleOverrideFields({
  componentKey,
  value,
  onChange,
  labelTokens,
}: StyleOverrideFieldsProps) {
  const curated = curatedControlsForKey(componentKey);
  const tokens = labelTokens ?? ALL_TOKEN_DEFAULTS;

  // Curated props are surfaced as dedicated rows, so the freeform list omits
  // them to avoid duplicate editors for the same property.
  const curatedProps = new Set(curated.map(c => c.cssProperty));
  const freeformEntries = Object.entries(value).filter(
    ([prop]) => !curatedProps.has(prop),
  );

  return (
    <VStack gap={3}>
      {curated.length > 0 && (
        <VStack gap={1}>
          {curated.map(control => {
            const current = value[control.cssProperty] ?? '';
            const isPreset =
              current === '' || control.options.some(o => o.value === current);
            return (
              <HStack
                key={control.cssProperty}
                vAlign="center"
                justify="between"
                xstyle={s.row}>
                <StackItem size="fill" xstyle={s.rowLabel}>
                  <Text type="label" color="secondary" maxLines={1}>
                    {control.description}
                  </Text>
                </StackItem>
                <StackItem xstyle={s.inputControl}>
                  {isPreset ? (
                    <Selector
                      label={control.description}
                      isLabelHidden
                      size="sm"
                      xstyle={s.fullWidthField}
                      value={current}
                      options={[
                        {value: '', label: 'Default'},
                        ...control.options.map(o => ({
                          value: o.value,
                          label: resolveOptionLabel(o, tokens),
                        })),
                        {value: '__custom__', label: 'Custom…'},
                      ]}
                      onChange={(val: string) => {
                        if (val === '__custom__') {
                          onChange(control.cssProperty, ' ');
                        } else {
                          onChange(control.cssProperty, val);
                        }
                      }}
                    />
                  ) : (
                    <TextInput
                      label={control.description}
                      isLabelHidden
                      size="sm"
                      value={current.trim()}
                      placeholder="value"
                      onChange={(val: string) =>
                        onChange(control.cssProperty, val)
                      }
                    />
                  )}
                </StackItem>
              </HStack>
            );
          })}
        </VStack>
      )}

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Custom overrides
        </Text>
        {freeformEntries.map(([prop, val]) => (
          <HStack key={prop} vAlign="center" justify="between" xstyle={s.row}>
            <StackItem size="fill" xstyle={s.rowLabel}>
              <Text type="label" color="secondary" maxLines={1}>
                {prop}
              </Text>
            </StackItem>
            <StackItem xstyle={s.inputControl}>
              <HStack gap={1} vAlign="center">
                <StackItem size="fill">
                  <TextInput
                    label={prop}
                    isLabelHidden
                    size="sm"
                    value={val}
                    onChange={(v: string) => onChange(prop, v)}
                    xstyle={s.fullWidthField}
                  />
                </StackItem>
                <Button
                  label="Remove"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<span aria-hidden>×</span>}
                  onClick={() => onChange(prop, '')}
                />
              </HStack>
            </StackItem>
          </HStack>
        ))}
        <AddOverrideForm
          existing={value}
          onAdd={(prop, val) => onChange(prop, val)}
        />
      </VStack>
    </VStack>
  );
}

function AddOverrideForm({
  existing,
  onAdd,
}: {
  existing: Record<string, string>;
  onAdd: (prop: string, value: string) => void;
}) {
  const [propItem, setPropItem] = useState<SearchableItem | null>(null);
  const [value, setValue] = useState('');
  const prop = propItem?.id ?? '';
  const canAdd = prop !== '' && value.trim() !== '';
  const addOverride = () => {
    onAdd(prop, value.trim());
    setPropItem(null);
    setValue('');
  };
  return (
    <HStack vAlign="center" justify="between" xstyle={[s.row, s.addForm]}>
      <StackItem size="fill" xstyle={s.rowLabel}>
        <Typeahead
          label="CSS property (camelCase)"
          isLabelHidden
          size="sm"
          placeholder="CSS property"
          searchSource={CSS_PROPERTY_SOURCE}
          value={propItem}
          onChange={setPropItem}
          hasEntriesOnFocus
          debounceMs={0}
          maxMenuItems={8}
          xstyle={s.fullWidthField}
        />
      </StackItem>
      <StackItem xstyle={s.inputControl}>
        <HStack gap={1} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="Value"
              isLabelHidden
              size="sm"
              value={value}
              placeholder="value"
              onChange={setValue}
              xstyle={s.fullWidthField}
            />
          </StackItem>
          <Button
            label="Add override"
            tooltip="Add override"
            variant="secondary"
            size="sm"
            isIconOnly
            icon={<Plus size={16} />}
            isDisabled={!canAdd || prop in existing}
            onClick={addOverride}
          />
        </HStack>
      </StackItem>
    </HStack>
  );
}
