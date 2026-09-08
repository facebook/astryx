// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Checkbox.a11y.renders.tsx
 * @input Uses every current checkbox-bearing Astryx component and the state-id
 *   union from Checkbox.a11y.states.ts
 * @output CHECKBOX_STATE_RENDERS — one consumer-realistic rendering per inventory
 *   row, shared by jsdom and checked-in Storybook stories.
 * @position Binding fixture layer. Component-specific callbacks and form behavior
 *   remain in their local suites.
 */

import {useState, type ReactElement, type ReactNode} from 'react';
import {CheckboxInput} from '../CheckboxInput';
import {CheckboxList, CheckboxListItem} from '../../CheckboxList';
import {DropdownMenu, DropdownMenuCheckboxItem} from '../../DropdownMenu';
import {List} from '../../List';
import {SelectableCard} from '../../SelectableCard';
import type {CheckboxStateId} from './Checkbox.a11y.states';

function VisibleLabel({children}: {children: ReactNode}) {
  return <span data-a11y-visible-label>{children}</span>;
}

function ControlledInput({
  initial,
  ...props
}: {
  initial: boolean | 'indeterminate';
  label: string;
  description?: string;
  isLabelHidden?: boolean;
  isDisabled?: boolean;
  disabledMessage?: string;
  isLoading?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  status?: {type: 'error' | 'warning' | 'success'; message: string};
}) {
  const [value, setValue] = useState<boolean | 'indeterminate'>(initial);
  return <CheckboxInput {...props} value={value} onChange={setValue} />;
}

function StandaloneListItem({
  initial,
  label,
  description,
  isDisabled,
  isLoading,
  isReadOnly = false,
}: {
  initial: boolean | 'indeterminate';
  label: string;
  description?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  isReadOnly?: boolean;
}) {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(initial);
  return (
    <List>
      <CheckboxListItem
        label={<VisibleLabel>{label}</VisibleLabel>}
        aria-label={label}
        description={description}
        isChecked={checked}
        onCheck={isReadOnly ? undefined : setChecked}
        isDisabled={isDisabled}
        isLoading={isLoading}
      />
    </List>
  );
}

function CollectionListItem({initial}: {initial: boolean}) {
  const [value, setValue] = useState<string[]>(initial ? ['email'] : []);
  return (
    <CheckboxList
      label="Notification methods"
      value={value}
      onChange={setValue}>
      <CheckboxListItem
        label={<VisibleLabel>Email</VisibleLabel>}
        aria-label="Email"
        value="email"
      />
    </CheckboxList>
  );
}

function GroupDisabledListItem() {
  return (
    <CheckboxList
      label="Notification methods"
      value={['email']}
      onChange={() => {}}
      isDisabled
      disabledMessage="Managed by your administrator">
      <CheckboxListItem
        label={<VisibleLabel>Email</VisibleLabel>}
        aria-label="Email"
        value="email"
      />
    </CheckboxList>
  );
}

function MenuCheckbox({
  initial,
  isDisabled = false,
  description,
}: {
  initial: boolean;
  isDisabled?: boolean;
  description?: ReactNode;
}) {
  const [value, setValue] = useState(initial);
  return (
    <DropdownMenu button={{label: 'View options'}}>
      <DropdownMenuCheckboxItem
        label="Show archived"
        description={description}
        value={value}
        onChange={setValue}
        isDisabled={isDisabled}
      />
    </DropdownMenu>
  );
}

function ControlledCard({
  initial,
  isDisabled = false,
}: {
  initial: boolean;
  isDisabled?: boolean;
}) {
  const [selected, setSelected] = useState(initial);
  return (
    <SelectableCard
      data-a11y-pointer-target
      label="Analytics"
      isSelected={selected}
      onChange={setSelected}
      isDisabled={isDisabled}>
      <VisibleLabel>Analytics</VisibleLabel>
    </SelectableCard>
  );
}

export type CheckboxStateRender = () => ReactElement;

export const CHECKBOX_STATE_RENDERS: Record<
  CheckboxStateId,
  CheckboxStateRender
> = {
  'input-unchecked': () => (
    <ControlledInput initial={false} label="Email notifications" />
  ),
  'input-checked': () => (
    <ControlledInput initial={true} label="Email notifications" />
  ),
  'input-mixed': () => (
    <ControlledInput initial="indeterminate" label="Select all notifications" />
  ),
  'input-described': () => (
    <ControlledInput
      initial={false}
      label="Share usage data"
      description="Help improve the product"
    />
  ),
  'input-hidden-label': () => (
    <ControlledInput initial={false} label="Select row" isLabelHidden />
  ),
  'input-disabled': () => (
    <ControlledInput initial={false} label="Managed setting" isDisabled />
  ),
  'input-disabled-with-message': () => (
    <ControlledInput
      initial={false}
      label="Managed setting"
      isDisabled
      disabledMessage="Managed by your administrator"
    />
  ),
  'input-loading': () => (
    <ControlledInput initial={false} label="Email notifications" isLoading />
  ),
  'input-read-only': () => (
    <ControlledInput initial={true} label="Policy acknowledged" isReadOnly />
  ),
  'input-required': () => (
    <ControlledInput initial={false} label="Accept terms" isRequired />
  ),
  'input-invalid': () => (
    <ControlledInput
      initial={false}
      label="Accept terms"
      status={{type: 'error', message: 'You must accept the terms'}}
    />
  ),

  'list-item-unchecked': () => (
    <StandaloneListItem initial={false} label="Email" />
  ),
  'list-item-checked': () => <CollectionListItem initial />,
  'list-item-mixed': () => (
    <StandaloneListItem initial="indeterminate" label="Select all" />
  ),
  'list-item-described': () => (
    <StandaloneListItem
      initial={false}
      label="Email"
      description="Receive notifications by email"
    />
  ),
  'list-item-disabled': () => (
    <StandaloneListItem initial={false} label="SMS" isDisabled />
  ),
  'list-item-loading': () => (
    <StandaloneListItem initial={false} label="Push notifications" isLoading />
  ),
  'list-item-read-only': () => (
    <StandaloneListItem initial label="Email" isReadOnly />
  ),
  'list-item-group-disabled-with-message': () => <GroupDisabledListItem />,

  'menu-item-unchecked': () => <MenuCheckbox initial={false} />,
  'menu-item-checked': () => <MenuCheckbox initial />,
  'menu-item-described': () => (
    <MenuCheckbox initial={false} description="Include unpublished items" />
  ),
  'menu-item-disabled': () => <MenuCheckbox initial={false} isDisabled />,

  'card-unchecked': () => <ControlledCard initial={false} />,
  'card-checked': () => <ControlledCard initial />,
  'card-disabled': () => <ControlledCard initial={false} isDisabled />,
};
