import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Bars3BottomLeftIcon,
  ListBulletIcon,
  NumberedListIcon,
  FunnelIcon,
  StarIcon,
  BookmarkIcon,
  HeartIcon,
  BellIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  BoldIcon as BoldIconSolid,
  ItalicIcon as ItalicIconSolid,
  UnderlineIcon as UnderlineIconSolid,
  StarIcon as StarIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid,
  BellIcon as BellIconSolid,
  EyeIcon as EyeIconSolid,
} from '@heroicons/react/24/solid';

const meta: Meta<typeof XDSToggleButton> = {
  title: 'Core/XDSToggleButton',
  component: XDSToggleButton,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (required)',
    },
    variant: {
      control: 'select',
      options: ['ghost', 'secondary', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    isPressed: {
      control: 'boolean',
      description: 'Whether the button is pressed',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSToggleButton>;

// =============================================================================
// Interactive wrapper for stateful stories
// =============================================================================

function ToggleButtonDemo(
  props: Omit<
    React.ComponentProps<typeof XDSToggleButton>,
    'isPressed' | 'onPressedChange'
  > & {defaultPressed?: boolean},
) {
  const {defaultPressed = false, ...rest} = props;
  const [isPressed, setIsPressed] = useState(defaultPressed);
  return (
    <XDSToggleButton
      {...rest}
      isPressed={isPressed}
      onPressedChange={setIsPressed}
    />
  );
}

// =============================================================================
// Basic stories
// =============================================================================

export const Default: Story = {
  args: {
    label: 'Toggle',
    isPressed: false,
  },
  render: args => {
    const [isPressed, setIsPressed] = useState(args.isPressed);
    return (
      <XDSToggleButton
        {...args}
        isPressed={isPressed}
        onPressedChange={setIsPressed}
      />
    );
  },
};

export const Ghost: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo label="Unpressed" variant="ghost" />
      <ToggleButtonDemo label="Pressed" variant="ghost" defaultPressed />
    </div>
  ),
};

export const Secondary: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo label="Unpressed" variant="secondary" />
      <ToggleButtonDemo label="Pressed" variant="secondary" defaultPressed />
    </div>
  ),
};

export const Outline: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo label="Unpressed" variant="outline" />
      <ToggleButtonDemo label="Pressed" variant="outline" defaultPressed />
    </div>
  ),
};

// =============================================================================
// Icon-only
// =============================================================================

export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <ToggleButtonDemo
        label="Bold"
        icon={<BoldIcon style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Italic"
        icon={<ItalicIcon style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Underline"
        icon={<UnderlineIcon style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

export const IconOnlyPressed: Story = {
  name: 'Icon Only (Pressed)',
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <ToggleButtonDemo
        label="Bold"
        icon={<BoldIcon style={{width: 16, height: 16}} />}
        defaultPressed
      />
      <ToggleButtonDemo
        label="Italic"
        icon={<ItalicIcon style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Underline"
        icon={<UnderlineIcon style={{width: 16, height: 16}} />}
        defaultPressed
      />
    </div>
  ),
};

// =============================================================================
// Icon + Label
// =============================================================================

export const IconWithLabel: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo
        label="Bookmark"
        icon={<BookmarkIcon style={{width: 16, height: 16}} />}>
        Bookmark
      </ToggleButtonDemo>
      <ToggleButtonDemo
        label="Favorite"
        icon={<HeartIcon style={{width: 16, height: 16}} />}
        defaultPressed>
        Favorite
      </ToggleButtonDemo>
    </div>
  ),
};

// =============================================================================
// Sizes
// =============================================================================

export const SizeVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo
        label="Small"
        size="sm"
        icon={<StarIcon style={{width: 14, height: 14}} />}
      />
      <ToggleButtonDemo
        label="Medium"
        size="md"
        icon={<StarIcon style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Large"
        size="lg"
        icon={<StarIcon style={{width: 20, height: 20}} />}
      />
    </div>
  ),
};

// =============================================================================
// States
// =============================================================================

export const Disabled: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo label="Disabled unpressed" isDisabled />
      <ToggleButtonDemo label="Disabled pressed" isDisabled defaultPressed />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo label="Loading" isLoading />
      <ToggleButtonDemo
        label="Loading"
        isLoading
        icon={<BellIcon style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

// =============================================================================
// Outline variant showcase
// =============================================================================

export const OutlineFilters: Story = {
  name: 'Outline — Filter Chips',
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <ToggleButtonDemo
        label="Active"
        variant="outline"
        icon={<FunnelIcon style={{width: 16, height: 16}} />}
        defaultPressed>
        Active
      </ToggleButtonDemo>
      <ToggleButtonDemo label="Starred" variant="outline">
        Starred
      </ToggleButtonDemo>
      <ToggleButtonDemo label="Unread" variant="outline">
        Unread
      </ToggleButtonDemo>
      <ToggleButtonDemo label="Archived" variant="outline">
        Archived
      </ToggleButtonDemo>
    </div>
  ),
};

// =============================================================================
// Toolbar example
// =============================================================================

export const FormattingToolbar: Story = {
  name: 'Example — Formatting Toolbar',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        padding: '4px',
        borderRadius: '8px',
        backgroundColor: 'var(--xds-color-wash, #F1F4F7)',
      }}>
      <ToggleButtonDemo
        label="Bold"
        icon={<BoldIcon style={{width: 16, height: 16}} />}
        pressedIcon={<BoldIconSolid style={{width: 16, height: 16}} />}
        defaultPressed
      />
      <ToggleButtonDemo
        label="Italic"
        icon={<ItalicIcon style={{width: 16, height: 16}} />}
        pressedIcon={<ItalicIconSolid style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Underline"
        icon={<UnderlineIcon style={{width: 16, height: 16}} />}
        pressedIcon={<UnderlineIconSolid style={{width: 16, height: 16}} />}
      />
      <div
        style={{
          width: 1,
          height: 20,
          backgroundColor: 'var(--xds-color-divider, #05365919)',
          margin: '0 4px',
        }}
      />
      <ToggleButtonDemo
        label="Align left"
        icon={<Bars3BottomLeftIcon style={{width: 16, height: 16}} />}
        defaultPressed
      />
      <ToggleButtonDemo
        label="Bulleted list"
        icon={<ListBulletIcon style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Numbered list"
        icon={<NumberedListIcon style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

// =============================================================================
// Icon swap — outline to filled
// =============================================================================

export const IconSwap: Story = {
  name: 'Icon Swap — Outline to Filled',
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <ToggleButtonDemo
        label="Favorite"
        icon={<HeartIcon style={{width: 16, height: 16}} />}
        pressedIcon={<HeartIconSolid style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Bookmark"
        icon={<BookmarkIcon style={{width: 16, height: 16}} />}
        pressedIcon={<BookmarkIconSolid style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Star"
        icon={<StarIcon style={{width: 16, height: 16}} />}
        pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Notifications"
        icon={<BellIcon style={{width: 16, height: 16}} />}
        pressedIcon={<BellIconSolid style={{width: 16, height: 16}} />}
      />
      <ToggleButtonDemo
        label="Watching"
        icon={<EyeIcon style={{width: 16, height: 16}} />}
        pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

// =============================================================================
// All variants matrix
// =============================================================================

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '700px',
      }}>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
            color: '#4E606F',
          }}>
          Ghost
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <ToggleButtonDemo label="Default" variant="ghost" />
          <ToggleButtonDemo label="Pressed" variant="ghost" defaultPressed />
          <ToggleButtonDemo label="Disabled" variant="ghost" isDisabled />
          <ToggleButtonDemo
            label="Icon"
            variant="ghost"
            icon={<EyeIcon style={{width: 16, height: 16}} />}
            pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
          />
          <ToggleButtonDemo
            label="Icon pressed"
            variant="ghost"
            icon={<EyeIcon style={{width: 16, height: 16}} />}
            pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
            defaultPressed
          />
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
            color: '#4E606F',
          }}>
          Secondary
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <ToggleButtonDemo label="Default" variant="secondary" />
          <ToggleButtonDemo
            label="Pressed"
            variant="secondary"
            defaultPressed
          />
          <ToggleButtonDemo label="Disabled" variant="secondary" isDisabled />
          <ToggleButtonDemo
            label="Icon"
            variant="secondary"
            icon={<EyeIcon style={{width: 16, height: 16}} />}
            pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
          />
          <ToggleButtonDemo
            label="Icon pressed"
            variant="secondary"
            icon={<EyeIcon style={{width: 16, height: 16}} />}
            pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
            defaultPressed
          />
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
            color: '#4E606F',
          }}>
          Outline
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <ToggleButtonDemo label="Default" variant="outline" />
          <ToggleButtonDemo label="Pressed" variant="outline" defaultPressed />
          <ToggleButtonDemo label="Disabled" variant="outline" isDisabled />
          <ToggleButtonDemo
            label="Icon"
            variant="outline"
            icon={<EyeIcon style={{width: 16, height: 16}} />}
            pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
          />
          <ToggleButtonDemo
            label="Icon pressed"
            variant="outline"
            icon={<EyeIcon style={{width: 16, height: 16}} />}
            pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}
            defaultPressed
          />
        </div>
      </div>
    </div>
  ),
};
