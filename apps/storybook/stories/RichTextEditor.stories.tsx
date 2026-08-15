// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  RichTextEditor,
  RichTextView,
  markdownToEditorStateJSON,
  editorStateJSONToMarkdown,
  RichTextEditorToolbar,
  RichTextEditorAutoLinkPlugin,
  type RichTextEditorRef,
} from '@astryxdesign/richtext';
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
    minHeight: {
      control: 'text',
      description:
        'Minimum height of the editable surface (number in pixels or CSS length).',
    },
    size: {control: 'select', options: ['sm', 'md', 'lg']},
    statusVariant: {
      control: 'select',
      options: ['attached', 'detached', 'tooltip'],
    },
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

export const WithToolbar: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Format with the toolbar above…',
    toolbar: <RichTextEditorToolbar />,
  },
};

export const ResponsiveToolbar: Story = {
  name: 'Responsive toolbar',
  render: args => (
    <div
      style={{
        width: 420,
        minWidth: 280,
        maxWidth: '100%',
        resize: 'horizontal',
        overflow: 'hidden',
      }}>
      <RichTextEditor {...args} />
    </div>
  ),
  args: {
    label: 'Notes',
    description: 'Resize the editor to test the horizontal toolbar scroll.',
    placeholder: 'Every formatting action stays directly available…',
    toolbar: <RichTextEditorToolbar />,
  },
};

export const ResponsiveToolbarStressTest: Story = {
  name: 'Responsive toolbar — stress test',
  render: args => {
    const [width, setWidth] = useState(420);

    return (
      <div style={{display: 'grid', gap: 16}}>
        <label
          style={{
            display: 'grid',
            gap: 8,
            maxWidth: 560,
            font: 'inherit',
          }}>
          <span>Editor width: {width}px</span>
          <input
            type="range"
            min={240}
            max={900}
            step={10}
            value={width}
            aria-label="Editor width"
            onChange={event => setWidth(event.currentTarget.valueAsNumber)}
          />
        </label>
        <div style={{width, maxWidth: '100%'}}>
          <RichTextEditor {...args} />
        </div>
      </div>
    );
  },
  args: {
    label: 'Responsive toolbar stress test',
    description:
      'Sweep from 240px to 900px to stress the horizontal toolbar scroll.',
    placeholder: 'Scroll the toolbar and toggle several formats…',
    toolbar: <RichTextEditorToolbar />,
  },
};

export const WithLinks: Story = {
  args: {
    label: 'Notes',
    placeholder:
      'Select text and press the Link button (or Cmd/Ctrl+K) to add a link…',
    // The toolbar's Link button creates new-tab links by default (target/rel
    // baked into the node). No extra plugin needed.
    toolbar: <RichTextEditorToolbar />,
  },
};

export const WithAutoLink: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Type a URL like https://astryx.dev and it auto-links…',
    toolbar: <RichTextEditorToolbar />,
    // Auto-linkify typed/pasted URLs + emails (open in a new tab).
    plugins: <RichTextEditorAutoLinkPlugin />,
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
    description:
      'A character counter appears below the editor when maxLength is set.',
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
    statusVariant: 'attached',
  },
};

export const DetachedStatus: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {type: 'warning', message: 'Review this content before saving.'},
    statusVariant: 'detached',
  },
};

export const TooltipStatus: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {type: 'error', message: 'This field is required.'},
    statusVariant: 'tooltip',
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
              setReadout(
                `getEditorState() text content: ${JSON.stringify(text)}`,
              );
            }}>
            getEditorState()
          </button>
          <button
            type="button"
            onClick={() => {
              const md = ref.current?.getMarkdown();
              setReadout(`getMarkdown():\n${md}`);
            }}>
            getMarkdown()
          </button>
          <button
            type="button"
            onClick={() => {
              const html = ref.current?.getHTML();
              setReadout(`getHTML():\n${html}`);
            }}>
            getHTML()
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

const SAMPLE_MARKDOWN = `# Release notes

Supports **bold**, _italic_, and lists:

- First item
- Second item

> A blockquote for good measure.`;

/**
 * Playground for the standalone Markdown <-> EditorState serializer helpers
 * (markdownToEditorStateJSON / editorStateJSONToMarkdown) added in #4544.
 *
 * These run headless — no mounted editor needed. Here we:
 *  1. Take Markdown text (left),
 *  2. Serialize it to an EditorState JSON string with `markdownToEditorStateJSON`,
 *  3. Feed that JSON straight into a live <RichTextEditor defaultValue={...} />
 *     AND a read-only <RichTextView />,
 *  4. Round-trip it back to Markdown with `editorStateJSONToMarkdown`
 *     so you can eyeball that Markdown -> JSON -> Markdown is stable.
 */
export const MarkdownSerializers = {
  render: () => {
    const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);

    const json = markdownToEditorStateJSON(markdown);
    const roundTripped = editorStateJSONToMarkdown(json);

    const boxStyle = {
      background: '#f5f5f5',
      padding: 12,
      borderRadius: 6,
      fontSize: 13,
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
      margin: 0,
    };

    return (
      <div style={{display: 'grid', gap: 24, maxWidth: 720}}>
        <div>
          <div style={{fontWeight: 600, marginBottom: 8}}>
            1. Input Markdown (edit me)
          </div>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: 13,
              padding: 12,
              borderRadius: 6,
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <div style={{fontWeight: 600, marginBottom: 8}}>
            2. markdownToEditorStateJSON(...) -&gt; live RichTextEditor
          </div>
          {/* key forces a remount when the serialized JSON changes, since
              defaultValue is only read on mount. */}
          <RichTextEditor
            key={json}
            label="Editor seeded from Markdown"
            defaultValue={json}
            placeholder="(serialized Markdown renders here)"
          />
        </div>

        <div>
          <div style={{fontWeight: 600, marginBottom: 8}}>
            3. Same JSON rendered read-only via RichTextView
          </div>
          <RichTextView value={json} />
        </div>

        <div>
          <div style={{fontWeight: 600, marginBottom: 8}}>
            4. editorStateJSONToMarkdown(json) -&gt; round-tripped Markdown
          </div>
          <pre style={boxStyle}>{roundTripped}</pre>
        </div>

        <details>
          <summary style={{cursor: 'pointer', fontWeight: 600}}>
            Serialized EditorState JSON (markdownToEditorStateJSON output)
          </summary>
          <pre style={{...boxStyle, marginTop: 8}}>{json}</pre>
        </details>
      </div>
    );
  },
};
