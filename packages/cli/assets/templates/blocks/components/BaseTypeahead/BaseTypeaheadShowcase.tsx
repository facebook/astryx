// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BaseTypeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {
  borderVars,
  colorVars,
  focusVars,
  radiusVars,
  sizeVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const frameworks: SearchableItem[] = [
  {id: 'react', label: 'React'},
  {id: 'vue', label: 'Vue'},
  {id: 'svelte', label: 'Svelte'},
  {id: 'next', label: 'Next.js'},
];
const source = createStaticSource(frameworks);

const styles = stylex.create({
  root: {width: 360},
  field: {
    alignItems: 'center',
    backgroundColor: colorVars['--color-background-surface'],
    borderColor: colorVars['--color-border-emphasized'],
    borderRadius: radiusVars['--radius-element'],
    borderStyle: 'solid',
    borderWidth: borderVars['--border-width'],
    display: 'flex',
    minHeight: sizeVars['--size-element-md'],
    paddingInline: spacingVars['--spacing-2'],
    outlineColor: {
      default: 'transparent',
      ':has(input:focus-visible)': focusVars['--focus-outline-color'],
    },
    outlineOffset: focusVars['--focus-outline-offset'],
    outlineStyle: 'solid',
    outlineWidth: {
      default: '0',
      ':has(input:focus-visible)': focusVars['--focus-outline-width'],
    },
  },
});

export default function BaseTypeaheadShowcase() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <VStack gap={3} xstyle={styles.root}>
      <Text type="label">Framework</Text>
      <div ref={anchorRef} {...stylex.props(styles.field)}>
        <BaseTypeahead
          aria-label="Framework"
          anchorRef={anchorRef}
          debounceMs={0}
          hasEntriesOnFocus
          onChange={setValue}
          placeholder="Search frameworks…"
          searchSource={source}
          value={value}
        />
      </div>
      <Text type="supporting" color="secondary">
        {value == null ? 'Choose a framework' : `Selected: ${value.label}`}
      </Text>
    </VStack>
  );
}
