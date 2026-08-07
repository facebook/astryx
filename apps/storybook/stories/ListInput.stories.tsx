// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {ListInput} from '@astryxdesign/lab';
import type {ListInputColumn} from '@astryxdesign/lab';
import type {InputStatus} from '@astryxdesign/core/Field';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';

const meta: Meta<typeof ListInput> = {
  title: 'Lab/ListInput',
  component: ListInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 640, maxWidth: '100%'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ListInput>;

type TagOption = {id: string; color: string; label: string};

const colorOptions = [
  {value: 'blue', label: 'Blue'},
  {value: 'green', label: 'Green'},
  {value: 'orange', label: 'Orange'},
  {value: 'purple', label: 'Purple'},
];

const columns: Array<ListInputColumn<TagOption>> = [
  {
    key: 'color',
    header: 'Color',
    width: 160,
    renderInput: ({item, updateItem, label, status, ...state}) => (
      <Selector
        label={label}
        isLabelHidden
        options={colorOptions}
        value={item.color}
        onChange={color => updateItem({...item, color})}
        status={status}
        {...state}
      />
    ),
    renderValue: ({item}) =>
      colorOptions.find(color => color.value === item.color)?.label ?? '',
  },
  {
    key: 'label',
    header: 'Label',
    renderInput: ({item, updateItem, label, status, ...state}) => (
      <TextInput
        label={label}
        isLabelHidden
        value={item.label}
        onChange={labelValue => updateItem({...item, label: labelValue})}
        status={status}
        {...state}
      />
    ),
  },
];

const initialTags: TagOption[] = [
  {id: 't1', color: 'blue', label: 'Bug'},
  {id: 't2', color: 'green', label: 'Feature'},
  {id: 't3', color: 'orange', label: 'Docs'},
];

let nextID = 4;

function TagOptionsEditor(props: {
  isReorderable?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  maxItems?: number;
  withValidation?: boolean;
}) {
  const {withValidation, ...rest} = props;
  const [tags, setTags] = useState(initialTags);

  const listStatus: InputStatus | undefined =
    withValidation && tags.length < 2
      ? {type: 'error', message: 'At least two tag options are required.'}
      : undefined;

  return (
    <ListInput
      label="Tag options"
      description="Choose a color and label for each option."
      itemName="tag"
      value={tags}
      onChange={setTags}
      getItemKey={tag => tag.id}
      createItem={() => ({id: `t${nextID++}`, color: 'blue', label: ''})}
      columns={columns}
      status={listStatus}
      getFieldStatus={
        withValidation
          ? (tag, columnKey) =>
              columnKey === 'label' && tag.label.trim() === ''
                ? {type: 'error', message: 'Label is required.'}
                : undefined
          : undefined
      }
      {...rest}
    />
  );
}

export const Showcase: Story = {
  render: () => <TagOptionsEditor isReorderable />,
};

export const Validation: Story = {
  render: () => <TagOptionsEditor withValidation maxItems={5} />,
};

export const ReadOnly: Story = {
  render: () => <TagOptionsEditor isReadOnly />,
};

export const Loading: Story = {
  render: () => <TagOptionsEditor isLoading />,
};
