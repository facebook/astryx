// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Toolbar.a11y.renders.tsx
 * @input One toolbar binding state from Toolbar.a11y.states.ts
 * @output The React tree every lane renders for that state (the jsdom test directly, the story through Storybook): a page button before the Toolbar, the Toolbar, and a page button after it
 * @position Shared fixture for the Toolbar binding
 */

import type {ReactElement} from 'react';
import {Button} from '../../Button/Button';
import {Toolbar} from '../Toolbar';
import type {ToolbarBindingState, ToolbarControl} from './Toolbar.a11y.states';

function controls(
  list: ReadonlyArray<ToolbarControl>,
): ReactElement | undefined {
  if (list.length === 0) {
    return undefined;
  }
  return (
    <>
      {list.map(control => (
        <Button
          key={control.label}
          label={control.label}
          variant="ghost"
          isDisabled={control.isDisabled}
        />
      ))}
    </>
  );
}

export function renderToolbarState(
  state: Pick<
    ToolbarBindingState,
    'label' | 'startControls' | 'endControls' | 'facts'
  >,
): ReactElement {
  return (
    <div dir={state.facts.direction} style={{padding: 24, maxWidth: 640}}>
      <button type="button">Before the toolbar</button>
      <Toolbar
        label={state.label}
        orientation={state.facts.orientation}
        startContent={controls(state.startControls)}
        endContent={controls(state.endControls)}
      />
      <button type="button">After the toolbar</button>
    </div>
  );
}
