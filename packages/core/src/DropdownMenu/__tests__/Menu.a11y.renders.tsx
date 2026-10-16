// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Menu.a11y.renders.tsx
 * @input One menu binding state from Menu.a11y.states.ts
 * @output The React tree every lane renders for that state (the jsdom test directly, the story through Storybook)
 * @position Shared fixture for the DropdownMenu menu-surface binding
 */

import type {ReactElement} from 'react';
import {DropdownMenu} from '../DropdownMenu';
import {DropdownMenuItem} from '../DropdownMenuItem';
import {DropdownMenuCheckboxItem} from '../DropdownMenuCheckboxItem';
import {DropdownMenuRadioGroup} from '../DropdownMenuRadioGroup';
import {DropdownMenuRadioItem} from '../DropdownMenuRadioItem';
import {MENU_ACTION_ITEMS, type MenuBindingState} from './Menu.a11y.states';

const actionItems = MENU_ACTION_ITEMS.map(item => ({...item}));
const ignore = () => {};

export function renderMenuState(
  state: Pick<MenuBindingState, 'content' | 'label'>,
): ReactElement {
  const menu =
    state.content === 'actions' ? (
      <DropdownMenu
        button={{label: state.label}}
        items={actionItems}
        presentation="popover"
      />
    ) : (
      <DropdownMenu button={{label: state.label}} presentation="popover">
        <DropdownMenuItem label="Edit" onClick={ignore} />
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={true}
          onChange={ignore}
        />
        <DropdownMenuRadioGroup
          value="newest"
          onChange={ignore}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>
    );
  return (
    <div>
      {menu}
      <button type="button">After the menu</button>
    </div>
  );
}
