// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StyleScopeEditor.tsx
 * @input The current playground code + the targeted instance (component + index)
 * @output A single style editor whose values can be committed to EITHER this
 *   one element (a one-off xstyle) OR every instance of the type (the theme).
 * @position Playground in-preview popover — the "Style" scope of the unified
 *   targeting popover.
 *
 * The style inputs are identical regardless of where they land, so we show one
 * draft grid (StyleOverrideFields) seeded from the element's effective style
 * (theme base + this element's one-off, the one-off winning), then offer two
 * apply targets: "this instance" (writes an xstyle via instanceStyleSource) or
 * "all <Component>s" (writes the theme via setComponentBase). Hovering an apply
 * button previews which elements it affects (single vs every instance).
 */

'use client';

import {useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Layout, LayoutContent, LayoutFooter} from '@astryxdesign/core/Layout';
import {HStack, StackItem} from '@astryxdesign/core/Stack';
import {Button} from '@astryxdesign/core/Button';
import {readComponentBase, setComponentBase} from '../themeSource';
import {
  themeKeyForComponent,
  componentDisplayName,
} from '../themeEditor/componentThemeTargets';
import {readInstanceStyle, writeInstanceStyle} from './instanceStyleSource';
import {StyleOverrideFields} from './StyleOverrideFields';

/** Which elements an apply target affects — drives the hover preview. */
export type StyleApplyTarget = 'instance' | 'all';

const s = stylex.create({
  contentScroll: {overflowY: 'auto'},
  footer: {gap: 'var(--spacing-2)'},
  col: {flex: 1, minWidth: 0},
  fullWidth: {width: '100%'},
});

interface StyleScopeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  /** Targeted component module name, e.g. `Button`. */
  componentModule: string;
  /** Which instance of that type (source order). */
  instanceIndex: number;
  /** Selection nonce — reseeds the draft when a new element is targeted. */
  seedKey: string;
  /** Called after an apply commits (e.g. to close the popover). */
  onApplied?: () => void;
  /** Preview which elements an apply target would affect (null clears). */
  onPreviewTarget?: (target: StyleApplyTarget | null) => void;
}

export function StyleScopeEditor({
  code,
  onCodeChange,
  componentModule,
  instanceIndex,
  seedKey,
  onApplied,
  onPreviewTarget,
}: StyleScopeEditorProps) {
  const key = themeKeyForComponent(componentModule);
  const displayName = componentDisplayName(componentModule);

  const instanceRead = readInstanceStyle(code, componentModule, instanceIndex);
  const themeBase = readComponentBase(code, key);

  // Draft = the element's effective style (theme base overlaid with its one-off).
  // Reseeded only when a new element is targeted (seedKey), so typing isn't lost
  // when the code re-renders after an apply.
  const [draft, setDraft] = useState<Record<string, string>>(() => ({
    ...themeBase,
    ...instanceRead.props,
  }));
  // Reseed on selection change only; themeBase/instanceRead read at that time.
  useEffect(() => {
    setDraft({...themeBase, ...instanceRead.props});
  }, [seedKey]);

  const setProp = (prop: string, value: string) => {
    setDraft(prev => {
      const next = {...prev};
      if (value.trim() === '') {
        delete next[prop];
      } else {
        next[prop] = value;
      }
      return next;
    });
  };

  const applyTo = (target: StyleApplyTarget) => {
    onPreviewTarget?.(null);
    if (target === 'instance') {
      onCodeChange(
        writeInstanceStyle(code, componentModule, instanceIndex, draft),
      );
    } else {
      onCodeChange(setComponentBase(code, key, draft));
    }
    onApplied?.();
  };

  const isEmpty = Object.keys(draft).length === 0;

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={3} xstyle={s.contentScroll}>
          <StyleOverrideFields
            componentKey={key}
            value={draft}
            onChange={setProp}
          />
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider padding={3}>
          <HStack xstyle={s.footer}>
            <StackItem size="fill" xstyle={s.col}>
              <div
                {...stylex.props(s.fullWidth)}
                onMouseEnter={() => onPreviewTarget?.('instance')}
                onMouseLeave={() => onPreviewTarget?.(null)}>
                <Button
                  label="Apply Locally"
                  tooltip="Styles just this element with xstyle (StyleX)"
                  variant="primary"
                  isDisabled={isEmpty || !instanceRead.editable}
                  onClick={() => applyTo('instance')}
                  xstyle={s.fullWidth}
                />
              </div>
            </StackItem>
            <StackItem size="fill" xstyle={s.col}>
              <div
                {...stylex.props(s.fullWidth)}
                onMouseEnter={() => onPreviewTarget?.('all')}
                onMouseLeave={() => onPreviewTarget?.(null)}>
                <Button
                  label="Apply Globally"
                  tooltip={`Restyles all ${displayName}s via theme overrides`}
                  variant="primary"
                  isDisabled={isEmpty}
                  onClick={() => applyTo('all')}
                  xstyle={s.fullWidth}
                />
              </div>
            </StackItem>
          </HStack>
        </LayoutFooter>
      }
    />
  );
}
