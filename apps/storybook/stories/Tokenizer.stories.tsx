// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {Tokenizer, TokenizerTouchSurface} from '@astryxdesign/core/Tokenizer';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

// Sample data
const users: SearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
  {id: '6', label: 'Frank Miller'},
  {id: '7', label: 'Grace Lee'},
  {id: '8', label: 'Henry Davis'},
];

const userSource: SearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users.slice(0, 5),
};

// A longer list for the touch stories, where the sheet shows the whole source
// before anything is typed and a short one would not fill it.
const skills: SearchableItem[] = [
  {id: 'react', label: 'React'},
  {id: 'typescript', label: 'TypeScript'},
  {id: 'stylex', label: 'StyleX'},
  {id: 'node', label: 'Node'},
  {id: 'graphql', label: 'GraphQL'},
  {id: 'rust', label: 'Rust'},
  {id: 'go', label: 'Go'},
  {id: 'python', label: 'Python'},
  {id: 'swift', label: 'Swift'},
  {id: 'kotlin', label: 'Kotlin'},
  {id: 'figma', label: 'Figma'},
  {id: 'docker', label: 'Docker'},
];

const skillSource: SearchSource = {
  search: (query: string) =>
    skills.filter(s => s.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => skills,
};

const touchStyles = stylex.create({
  // A handset's width, so the touch stories read at the size they were
  // designed for even in a desktop browser.
  phone: {
    width: 390,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
});

const meta: Meta<typeof Tokenizer> = {
  title: 'Core/Tokenizer',
  component: Tokenizer,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    placeholder: {control: 'text'},
    isDisabled: {control: 'boolean'},
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip.',
    },
    isRequired: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxEntries: {control: 'number'},
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
  },
  decorators: [
    Story => (
      <div style={{width: 400}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tokenizer>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
      />
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...',
  },
};

export const WithPreselected: Story = {
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
      />
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
  },
  name: 'Pre-selected Items',
};

export const WithClear: Story = {
  ...Default,
  args: {
    ...Default.args,
    hasClear: true,
  },
  name: 'With Clear All Button',
};

export const MaxEntries: Story = {
  ...Default,
  args: {
    ...Default.args,
    maxEntries: 3,
  },
  name: 'Max 3 Entries',
};

export const Required: Story = {
  ...Default,
  args: {
    ...Default.args,
    isRequired: true,
  },
};

export const WithDescription: Story = {
  ...Default,
  args: {
    ...Default.args,
    description: 'Select up to 5 team members for this project',
  },
};

export const WithError: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'error', message: 'At least one member is required'},
  },
};

export const WithWarning: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'warning', message: 'Some members may not have access'},
  },
};

export const WithSuccess: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'success', message: 'Team is ready!'},
  },
};

export const Disabled: Story = {
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={() => {}}
      />
    );
  },
  args: {
    label: 'Team Members',
    isDisabled: true,
  },
};

export const WithStartIcon: Story = {
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon,
  },
  name: 'With Start Icon',
};

export const WithStartIconAndTokens: Story = {
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
      />
    );
  },
  args: {
    label: 'Team Members',
    startIcon: MagnifyingGlassIcon,
  },
  name: 'With Start Icon and Tokens',
};

export const WithEntriesOnFocus: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        hasEntriesOnFocus
      />
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Click to see suggestions...',
  },
  name: 'With Entries On Focus',
};

export const OverflowInline: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([
      users[0],
      users[1],
      users[2],
      users[3],
      users[4],
      users[5],
    ]);
    return (
      <div>
        <Tokenizer
          {...args}
          searchSource={userSource}
          value={value}
          onChange={items => setValue(items)}
          tokenOverflowBehavior="unfocusedInline"
        />
        <p style={{marginTop: 8}}>
          This text will shift down when the tokenizer expands on focus.
        </p>
      </div>
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
  },
  name: 'Overflow Inline',
};

export const OverflowLayer: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([
      users[0],
      users[1],
      users[2],
      users[3],
      users[4],
      users[5],
    ]);
    return (
      <div>
        <Tokenizer
          {...args}
          searchSource={userSource}
          value={value}
          onChange={items => setValue(items)}
          tokenOverflowBehavior="unfocusedLayer"
        />
        <p style={{marginTop: 8}}>
          This text should not shift when the tokenizer expands on focus.
        </p>
      </div>
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
  },
  name: 'Overflow Layer',
};

export const WithEndContent: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[2]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        endContent={<Button label="Apply" variant="primary" size="sm" />}
      />
    );
  },
  args: {
    label: 'Team Members',
  },
  name: 'With End Content',
};

// Empty source for free-text-only tokenizers
const emptySource: SearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export const Creatable: Story = {
  render: args => {
    const [tags, setTags] = useState<SearchableItem[]>([]);
    return (
      <div>
        <Tokenizer
          {...args}
          searchSource={emptySource}
          value={tags}
          onChange={(items, _change) => {
            setTags(items);
          }}
          hasCreate
          placeholder="Type a tag and press Enter..."
        />
        <p style={{marginTop: 8, fontSize: 14, color: '#666'}}>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} added
        </p>
      </div>
    );
  },
  args: {
    label: 'Tags',
  },
  name: 'Creatable (Free Text)',
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState<SearchableItem[]>([]);
    const [md, setMd] = useState<SearchableItem[]>([users[0], users[2]]);
    const [lg, setLg] = useState<SearchableItem[]>([]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <Tokenizer
          label="Small (28px)"
          searchSource={userSource}
          value={sm}
          onChange={items => setSm(items)}
          placeholder="Small size"
          size="sm"
          hasClear
        />
        <Tokenizer
          label="Medium (32px)"
          searchSource={userSource}
          value={md}
          onChange={items => setMd(items)}
          placeholder="Medium size (default)"
          size="md"
          hasClear
        />
        <Tokenizer
          label="Large (36px)"
          searchSource={userSource}
          value={lg}
          onChange={items => setLg(items)}
          placeholder="Large size"
          size="lg"
          hasClear
        />
      </div>
    );
  },
};

export const CreatableWithSearch: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={(items, _change) => {
          setValue(items);
        }}
        hasCreate
        hasEntriesOnFocus
        placeholder="Search or type a new name..."
      />
    );
  },
  args: {
    label: 'Team Members',
  },
  name: 'Creatable + Search',
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the input to see
// why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the input stays focusable (input is still blocked). Use
// disabledMessage instead of wrapping a disabled Tokenizer in Tooltip: disabled
// controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={() => {}}
      />
    );
  },
  args: {
    label: 'Team Members',
    isDisabled: true,
    disabledMessage: 'You need edit access to change members',
  },
};

export const StatusVariantComparison: Story = {
  render: () => {
    const [a, setA] = useState<SearchableItem[]>([]);
    const [b, setB] = useState<SearchableItem[]>([]);
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 24, width: 320}}>
        <Tokenizer
          label="Attached (default)"
          searchSource={userSource}
          value={a}
          onChange={items => setA(items)}
          status={{type: 'error', message: 'Select at least one member'}}
        />
        <Tokenizer
          label="Detached"
          searchSource={userSource}
          value={b}
          onChange={items => setB(items)}
          status={{type: 'error', message: 'Select at least one member'}}
          statusVariant="detached"
        />
      </div>
    );
  },
};

// ============================================================
// TOUCH SURFACE
//
// Tokenizer fits the pointer it is used with. With a mouse it is everything
// above: chips that wrap around an inline text input, suggestions in a
// popover. Where the primary pointer is a finger (`pointer: coarse`) the same
// component renders a surface built for one — chips on a single
// sideways-scrolling line so the form never reflows, and an Add button that
// opens a pinned-tall sheet whose search field sits above the keyboard.
//
// Same props, same values, no new import. `TouchResponsive` is the component
// as you would actually use it; every story after it renders
// `TokenizerTouchSurface`, the touch half with the pointer test skipped, so
// they are reviewable on a laptop.
// ============================================================

export const TouchResponsive: Story = {
  name: 'Touch: the surface for your pointer',
  parameters: {
    docs: {
      description: {
        story:
          'On a desktop browser this is the pointer surface. Open it on a ' +
          'phone, or in a device-emulated tab that reports a coarse pointer, ' +
          'and the same markup becomes a scrolling chip row with an Add ' +
          'button. Nothing at the call site changes.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([
      skills[0],
      skills[1],
    ]);
    // Report the surface actually on screen, rather than assuming a desktop.
    const isTouch = useMediaQuery('(pointer: coarse)');
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <Banner
          status={isTouch ? 'success' : 'info'}
          title={
            isTouch
              ? 'Coarse pointer: the touch surface'
              : 'Fine pointer: the pointer surface'
          }
        />
        <Tokenizer
          label="Skills"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search skills"
          width="100%"
        />
      </div>
    );
  },
};

export const TouchDefault: Story = {
  name: 'Touch: default',
  parameters: {
    docs: {
      description: {
        story:
          'Three chips and the Add button. Tap Add to open the suggestion ' +
          'sheet; tapping a row adds that token and leaves the sheet up for ' +
          'the next one.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([
      skills[0],
      skills[1],
      skills[2],
    ]);
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <TokenizerTouchSurface
          label="Skills"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search skills"
          width="100%"
        />
      </div>
    );
  },
};

export const TouchManyTokens: Story = {
  name: 'Touch: more tokens than fit',
  parameters: {
    docs: {
      description: {
        story:
          'The chips scroll sideways within the field. The field stays ' +
          'exactly one line tall however many there are, so adding and ' +
          'removing never reflows the form below it, and Add stays put at ' +
          'the trailing edge rather than scrolling away with the chips.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>(skills.slice(0, 8));
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <TokenizerTouchSurface
          label="Skills"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search skills"
          hasClear
          width="100%"
        />
      </div>
    );
  },
};

export const TouchEmpty: Story = {
  name: 'Touch: nothing selected',
  parameters: {
    docs: {
      description: {
        story:
          'With no tokens the placeholder holds the line. It doubles as the ' +
          "sheet's search placeholder, so write it as a search hint.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <TokenizerTouchSurface
          label="Skills"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search skills"
          width="100%"
        />
      </div>
    );
  },
};

export const TouchCreatable: Story = {
  name: 'Touch: free-text tags',
  parameters: {
    docs: {
      description: {
        story:
          'With `hasCreate`, typing something the source does not have puts ' +
          'a Create row at the end of the list. The keyboard\u2019s return ' +
          'key commits it too.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <TokenizerTouchSurface
          label="Tags"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search or add a tag"
          hasCreate
          width="100%"
        />
      </div>
    );
  },
};

export const TouchBounded: Story = {
  name: 'Touch: capped at maxEntries',
  parameters: {
    docs: {
      description: {
        story:
          'Add is disabled once the cap is reached, and the token that ' +
          'reaches it closes the sheet: there is nothing left to offer.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([skills[0]]);
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <TokenizerTouchSurface
          label="Skills"
          description="Up to 3"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search skills"
          maxEntries={3}
          width="100%"
        />
      </div>
    );
  },
};

export const TouchStatus: Story = {
  name: 'Touch: validation status',
  parameters: {
    docs: {
      description: {
        story:
          'Status, description, and required treatment come from the same ' +
          'Field wrapper the pointer surface uses, so they look and behave ' +
          'identically on both.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <div {...stylex.props(touchStyles.phone)}>
        <TokenizerTouchSurface
          label="Skills"
          searchSource={skillSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Search skills"
          isRequired
          status={{type: 'error', message: 'Pick at least one skill'}}
          width="100%"
        />
      </div>
    );
  },
};

export const TouchDisabled: Story = {
  name: 'Touch: disabled, with a reason',
  parameters: {
    docs: {
      description: {
        story:
          'With `disabledMessage` the Add button stays focusable under ' +
          '`aria-disabled` so the reason is reachable by keyboard and by ' +
          'tap, while the sheet stays shut.',
      },
    },
  },
  render: () => (
    <div {...stylex.props(touchStyles.phone)}>
      <TokenizerTouchSurface
        label="Skills"
        searchSource={skillSource}
        value={[skills[0], skills[1]]}
        onChange={() => {}}
        placeholder="Search skills"
        isDisabled
        disabledMessage="Ask an admin to unlock this field"
        width="100%"
      />
    </div>
  ),
};
