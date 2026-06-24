// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DesignEditor.tsx
 * @input The current code + the selected element (from preview targeting)
 * @output The left-panel "Design Editor" — edits the selected element's props
 *   or styles, or an empty state prompting the user to select one.
 * @position Playground left panel — the third view (Code / Design / Theme).
 *
 * This is the unified targeting editor moved out of the in-preview popover and
 * into the left panel. Selection flows from the preview iframe via postMessage
 * (see PlaygroundClient); this panel renders the Properties / Style editors
 * against the parent's `code` state. Hovering the Style apply buttons previews
 * which elements would change (single vs all) back in the preview.
 */

'use client';

import {useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Center} from '@astryxdesign/core/Center';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Crosshair, X} from 'lucide-react';
import {PropertyEditor} from '../propertyEditor/PropertyEditor';
import {
  StyleScopeEditor,
  type StyleApplyTarget,
} from '../styleOverride/StyleScopeEditor';
import {componentDisplayName} from '../themeEditor/componentThemeTargets';

type DesignScope = 'props' | 'style';

export interface DesignSelection {
  component: string;
  index: number;
}

const s = stylex.create({
  root: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  fullWidth: {width: '100%'},
  empty: {
    flex: 1,
    padding: 'var(--spacing-6)',
  },
});

interface DesignEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  /** The element selected via preview targeting, or null. */
  selection: DesignSelection | null;
  /** Bumps on each new selection — reseeds the Style draft. */
  seedKey: number;
  /** Whether the preview's select tool is currently armed. */
  isTargeting: boolean;
  /** Arm the select tool (used by the empty-state CTA). */
  onStartTargeting: () => void;
  /** Clear the current selection (and the preview overlay). */
  onDeselect: () => void;
  /** Preview which elements a Style apply target would affect (null clears). */
  onPreviewTarget: (target: StyleApplyTarget | null) => void;
}

export function DesignEditor({
  code,
  onCodeChange,
  selection,
  seedKey,
  isTargeting,
  onStartTargeting,
  onDeselect,
  onPreviewTarget,
}: DesignEditorProps) {
  const [scope, setScope] = useState<DesignScope>('props');
  // Reset to Properties whenever a new element is selected.
  useEffect(() => {
    setScope('props');
  }, [seedKey]);

  if (!selection) {
    return (
      <Center xstyle={s.empty}>
        <EmptyState
          title="Select an element to edit"
          description="Use the select tool, then click a component in the preview to edit its properties and styles."
          actions={
            <Button
              label={isTargeting ? 'Click an element…' : 'Select element'}
              variant="primary"
              icon={<Crosshair size={16} />}
              onClick={onStartTargeting}
            />
          }
        />
      </Center>
    );
  }

  const {component, index} = selection;
  const displayName = componentDisplayName(component);

  return (
    <VStack xstyle={s.root}>
      <VStack gap={2} xstyle={s.header}>
        <HStack vAlign="center" justify="between">
          <HStack gap={2} vAlign="center">
            <Crosshair size={16} />
            <Heading level={4}>{displayName}</Heading>
          </HStack>
          <Button
            label={`Deselect ${displayName}`}
            tooltip="Deselect"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<X size={16} />}
            onClick={onDeselect}
          />
        </HStack>
        <SegmentedControl
          label="Edit scope"
          size="sm"
          layout="fill"
          value={scope}
          onChange={v => setScope(v as DesignScope)}
          xstyle={s.fullWidth}>
          <SegmentedControlItem value="props" label="Properties" />
          <SegmentedControlItem value="style" label="Style" />
        </SegmentedControl>
      </VStack>

      <VStack xstyle={s.body}>
        {scope === 'props' ? (
          <PropertyEditor
            code={code}
            onCodeChange={onCodeChange}
            externalSelection={{component, instanceIndex: index}}
          />
        ) : (
          <StyleScopeEditor
            code={code}
            onCodeChange={onCodeChange}
            componentModule={component}
            instanceIndex={index}
            seedKey={String(seedKey)}
            onPreviewTarget={onPreviewTarget}
          />
        )}
      </VStack>
    </VStack>
  );
}
