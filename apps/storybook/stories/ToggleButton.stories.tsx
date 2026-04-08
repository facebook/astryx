import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  Squares2X2Icon,
  StarIcon,
  BookmarkIcon,
  BellIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';

const iconSize = {width: 16, height: 16} as const;

const meta: Meta<typeof XDSToggleButton> = {
  title: 'Core/XDSToggleButton',
  component: XDSToggleButton,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    isPressed: {control: 'boolean'},
    size: {control: 'select', options: ['sm', 'md', 'lg']},
    isDisabled: {control: 'boolean'},
    isLoading: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSToggleButton>;

// =============================================================================
// Standalone
// =============================================================================

/** Interactive standalone toggle — click to toggle. */
export const Standalone: Story = {
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return (
      <XDSToggleButton
        label="Bold"
        icon={<BoldIcon style={iconSize} />}
        isPressed={isPressed}
        onPressedChange={setIsPressed}
      />
    );
  },
};

/** Icon-only toggles with icon swap. */
export const IconSwap: Story = {
  render: function Render() {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(true);
    return (
      <div style={{display: 'flex', gap: 8}}>
        <XDSToggleButton
          label="Favorite"
          icon={<StarIcon style={iconSize} />}
          pressedIcon={<StarIconSolid style={iconSize} />}
          isPressed={isFavorited}
          onPressedChange={setIsFavorited}
        />
        <XDSToggleButton
          label="Bookmark"
          icon={<BookmarkIcon style={iconSize} />}
          pressedIcon={<BookmarkIconSolid style={iconSize} />}
          isPressed={isBookmarked}
          onPressedChange={setIsBookmarked}
        />
      </div>
    );
  },
};

/** Toggle with visible label text — shows font weight shift on press. */
export const WithLabel: Story = {
  render: function Render() {
    const [isActive, setIsActive] = useState(false);
    return (
      <XDSToggleButton
        label="Active"
        isPressed={isActive}
        onPressedChange={setIsActive}>
        Active
      </XDSToggleButton>
    );
  },
};

/** Disabled state. */
export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
    isPressed: false,
    isDisabled: true,
    icon: <BoldIcon style={iconSize} />,
  },
};

/** Loading state. */
export const Loading: Story = {
  args: {
    label: 'Loading toggle',
    isPressed: true,
    isLoading: true,
    icon: <StarIcon style={iconSize} />,
  },
};

/** All sizes side by side. */
export const Sizes: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({});
    const toggle = (key: string) =>
      setPressed(prev => ({...prev, [key]: !prev[key]}));
    return (
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <XDSToggleButton
          label="Small"
          size="sm"
          icon={<BoldIcon style={iconSize} />}
          isPressed={!!pressed.sm}
          onPressedChange={() => toggle('sm')}
        />
        <XDSToggleButton
          label="Medium"
          size="md"
          icon={<BoldIcon style={iconSize} />}
          isPressed={!!pressed.md}
          onPressedChange={() => toggle('md')}
        />
        <XDSToggleButton
          label="Large"
          size="lg"
          icon={<BoldIcon style={{width: 20, height: 20}} />}
          isPressed={!!pressed.lg}
          onPressedChange={() => toggle('lg')}
        />
      </div>
    );
  },
};

// =============================================================================
// Groups
// =============================================================================

/** Single-select group — view mode switcher. Click active to deselect. */
export const GroupSingle: Story = {
  render: function Render() {
    const [view, setView] = useState<string | null>('list');
    return (
      <XDSToggleButtonGroup value={view} onChange={setView} label="View mode">
        <XDSToggleButton
          value="list"
          label="List view"
          icon={<ListBulletIcon style={iconSize} />}
        />
        <XDSToggleButton
          value="grid"
          label="Grid view"
          icon={<Squares2X2Icon style={iconSize} />}
        />
      </XDSToggleButtonGroup>
    );
  },
};

/** Multi-select group — text formatting toolbar. */
export const GroupMultiple: Story = {
  render: function Render() {
    const [formats, setFormats] = useState<string[]>([]);
    return (
      <XDSToggleButtonGroup
        type="multiple"
        value={formats}
        onChange={setFormats}
        label="Text formatting">
        <XDSToggleButton
          value="bold"
          label="Bold"
          icon={<BoldIcon style={iconSize} />}
        />
        <XDSToggleButton
          value="italic"
          label="Italic"
          icon={<ItalicIcon style={iconSize} />}
        />
        <XDSToggleButton
          value="underline"
          label="Underline"
          icon={<UnderlineIcon style={iconSize} />}
        />
      </XDSToggleButtonGroup>
    );
  },
};

/** Notification toggle — icon swap between bell and bell-slash. */
export const NotificationToggle: Story = {
  render: function Render() {
    const [isMuted, setIsMuted] = useState(false);
    return (
      <XDSToggleButton
        label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
        icon={<BellIcon style={iconSize} />}
        pressedIcon={<BellSlashIcon style={iconSize} />}
        isPressed={isMuted}
        onPressedChange={setIsMuted}
      />
    );
  },
};
