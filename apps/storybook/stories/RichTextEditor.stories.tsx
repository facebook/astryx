// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  RichTextEditor,
  RichTextView,
  type RichTextEditorRef,
} from '@astryxdesign/lab';
import type {EditorState} from 'lexical';
import {BOLD_STAR, ITALIC_STAR, UNORDERED_LIST} from '@lexical/markdown';
import {$getRoot} from 'lexical';

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
    maxLength: {control: 'number'},
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

export const WithCharacterLimit: Story = {
  args: {
    label: 'Bio',
    maxLength: 80,
    description: 'A character counter appears below the editor when maxLength is set.',
    placeholder: 'Type past 80 characters to see the counter turn red…',
  },
};

export const CustomTransformers: Story = {
  args: {
    label: 'Comment',
    description:
      'Restricted markdown: only `*bold*`, `_italic_` and `- ` unordered lists (no headings, quotes or code).',
    placeholder: 'Try typing "# " — it will not become a heading…',
    transformers: [BOLD_STAR, ITALIC_STAR, UNORDERED_LIST],
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

export const ImperativeRef = {
  render: () => {
    const ref = useRef<RichTextEditorRef>(null);
    const [readout, setReadout] = useState<string>('(nothing read yet)');
    return (
      <div style={{display: 'grid', gap: 16, maxWidth: 560}}>
        <RichTextEditor
          ref={ref}
          label="Editor with imperative ref"
          defaultValue={SEED}
          placeholder="Type here, then use the buttons below…"
        />
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <button type="button" onClick={() => ref.current?.focus()}>
            focus()
          </button>
          <button type="button" onClick={() => ref.current?.clear()}>
            clear()
          </button>
          <button
            type="button"
            onClick={() => {
              const state = ref.current?.getEditorState();
              const text = state?.read(() => $getRoot().getTextContent());
              setReadout(`getEditorState() text content: ${JSON.stringify(text)}`);
            }}>
            getEditorState()
          </button>
          <button
            type="button"
            onClick={() => {
              const editor = ref.current?.getEditor();
              setReadout(
                `getEditor() -> ${editor ? 'LexicalEditor instance ✓' : 'null'}`,
              );
            }}>
            getEditor()
          </button>
        </div>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            fontSize: 13,
            whiteSpace: 'pre-wrap',
          }}>
          {readout}
        </pre>
      </div>
    );
  },
};
