'use client';

/**
 * @file XDSPowerSearchFilterEditor.tsx
 * @input PowerSearchEditorProps
 * @output Default editor popover content for PowerSearch filters
 * @position Public component; used internally by XDSPowerSearch and available for consumer composition
 */

import React from 'react';
import {PowerSearchEditPopover} from './PowerSearchEditPopover';
import {useInternalConfig} from './useInternalConfig';
import type {PowerSearchEditorProps} from './types';

/**
 * Default filter editor for PowerSearch.
 *
 * Renders the full editing experience: field selector, operator selector,
 * value editor, and save/cancel buttons. This is the built-in implementation
 * used by XDSPowerSearch — exported so consumers can use it as a base when
 * providing custom `components.Editor` overrides.
 */
export function XDSPowerSearchFilterEditor({
  config: configProp,
  filter,
  mode,
  onSave,
  onCancel,
  saveButtonLabel,
  isReadOnly,
}: PowerSearchEditorProps) {
  const config = useInternalConfig(configProp);

  return (
    <PowerSearchEditPopover
      config={config}
      filter={filter}
      mode={mode}
      onSave={onSave}
      onCancel={onCancel}
      saveButtonLabel={saveButtonLabel}
      isReadOnly={isReadOnly}
    />
  );
}

XDSPowerSearchFilterEditor.displayName = 'XDSPowerSearchFilterEditor';
