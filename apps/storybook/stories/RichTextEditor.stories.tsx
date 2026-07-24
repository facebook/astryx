// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {RichTextEditor, RichTextView} from '@astryxdesign/lab';
import type {EditorState} from 'lexical';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Lab/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text', description: 'Label text (required)'},
    isLabelHidden: {control: 'boolean'},
    description: {control: 'text'},
    placeholder: {control: 'text'},
    isReadOnly: {control: 'boolean'},
    isDisabled: {control: 'boolean'},
    isRequired: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    hasMarkdownShortcuts: {control: 'boolean'},
    hasAutoFocus: {control: 'boolean'},
    size: {control: 'select', options: ['sm', 'md', 'lg']},
  },
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Release notes',
    description: 'Supports **bold**, _italic_, lists, quotes and links.',
    placeholder: 'Describe what changed…',
  },
};

export const Required: Story = {
  args: {
    label: 'Summary',
    isRequired: true,
    placeholder: 'Required field',
  },
};

export const ErrorStatus: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {type: 'error', message: 'This field is required.'},
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Notes',
    isReadOnly: true,
  },
};

const SEED = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'The quick brown fox jumps over the lazy dog.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

export const WithInitialValue: Story = {
  args: {
    label: 'Notes',
    defaultValue: SEED,
  },
};

/**
 * Serialize on change and render the same content read-only with RichTextView.
 */
export const ControlledPersistence = {
  render: () => {
    const [json, setJson] = useState<string>(SEED);
    return (
      <div style={{display: 'grid', gap: 24, maxWidth: 560}}>
        <RichTextEditor
          label="Editor"
          defaultValue={SEED}
          placeholder="Type here…"
          onChange={(state: EditorState) =>
            setJson(JSON.stringify(state.toJSON()))
          }
        />
        <div>
          <div style={{fontWeight: 600, marginBottom: 8}}>
            RichTextView (read-only render of the same content)
          </div>
          <RichTextView value={json} />
        </div>
      </div>
    );
  },
};
