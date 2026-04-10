import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  LinkIcon,
  ListBulletIcon,
  Squares2X2Icon,
  StarIcon,
  BookmarkIcon,
  BellIcon,
  BellSlashIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid,
  BoldIcon as BoldIconSolid,
  ItalicIcon as ItalicIconSolid,
  UnderlineIcon as UnderlineIconSolid,
} from '@heroicons/react/24/solid';
import {XDSIcon} from '@xds/core/Icon';

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
        isIconOnly
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
          isIconOnly
        />
        <XDSToggleButton
          label="Bookmark"
          icon={<BookmarkIcon style={iconSize} />}
          pressedIcon={<BookmarkIconSolid style={iconSize} />}
          isPressed={isBookmarked}
          onPressedChange={setIsBookmarked}
          isIconOnly
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
          isIconOnly
        />
        <XDSToggleButton
          label="Medium"
          size="md"
          icon={<BoldIcon style={iconSize} />}
          isPressed={!!pressed.md}
          onPressedChange={() => toggle('md')}
          isIconOnly
        />
        <XDSToggleButton
          label="Large"
          size="lg"
          icon={<BoldIcon style={{width: 20, height: 20}} />}
          isPressed={!!pressed.lg}
          onPressedChange={() => toggle('lg')}
          isIconOnly
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
          isIconOnly
        />
        <XDSToggleButton
          value="grid"
          label="Grid view"
          icon={<Squares2X2Icon style={iconSize} />}
          isIconOnly
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
          isIconOnly
        />
        <XDSToggleButton
          value="italic"
          label="Italic"
          icon={<ItalicIcon style={iconSize} />}
          isIconOnly
        />
        <XDSToggleButton
          value="underline"
          label="Underline"
          icon={<UnderlineIcon style={iconSize} />}
          isIconOnly
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
        isIconOnly
      />
    );
  },
};

// =============================================================================
// Colored icons in pressed state
// =============================================================================

/**
 * Formatting toolbar with colored icons — icon shifts to accent color when pressed.
 * Uses outline → solid icon swap + XDSIcon color prop to reinforce state.
 */
export const ColoredIconToolbar: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({
      bold: true,
      italic: false,
      underline: true,
      strikethrough: false,
      link: false,
    });
    const toggle = (key: string) => setPressed(p => ({...p, [key]: !p[key]}));
    return (
      <div style={{display: 'flex', gap: 4}}>
        <XDSToggleButton
          label="Bold"
          icon={<XDSIcon icon={BoldIcon} size="sm" color="secondary" />}
          pressedIcon={
            <XDSIcon icon={BoldIconSolid} size="sm" color="accent" />
          }
          isPressed={pressed.bold}
          onPressedChange={() => toggle('bold')}
          isIconOnly
        />
        <XDSToggleButton
          label="Italic"
          icon={<XDSIcon icon={ItalicIcon} size="sm" color="secondary" />}
          pressedIcon={
            <XDSIcon icon={ItalicIconSolid} size="sm" color="accent" />
          }
          isPressed={pressed.italic}
          onPressedChange={() => toggle('italic')}
          isIconOnly
        />
        <XDSToggleButton
          label="Underline"
          icon={<XDSIcon icon={UnderlineIcon} size="sm" color="secondary" />}
          pressedIcon={
            <XDSIcon icon={UnderlineIconSolid} size="sm" color="accent" />
          }
          isPressed={pressed.underline}
          onPressedChange={() => toggle('underline')}
          isIconOnly
        />
        <XDSToggleButton
          label="Strikethrough"
          icon={
            <XDSIcon icon={StrikethroughIcon} size="sm" color="secondary" />
          }
          pressedIcon={
            <XDSIcon icon={StrikethroughIcon} size="sm" color="accent" />
          }
          isPressed={pressed.strikethrough}
          onPressedChange={() => toggle('strikethrough')}
          isIconOnly
        />
        <XDSToggleButton
          label="Link"
          icon={<XDSIcon icon={LinkIcon} size="sm" color="secondary" />}
          pressedIcon={<XDSIcon icon={LinkIcon} size="sm" color="positive" />}
          isPressed={pressed.link}
          onPressedChange={() => toggle('link')}
          isIconOnly
        />
      </div>
    );
  },
};

/**
 * Reaction buttons — semantic icon colors (yellow star, red heart, blue bookmark).
 * Shows icon swap (outline → solid) paired with color to reinforce the pressed state.
 */
export const ColoredIconReactions: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({
      star: false,
      heart: false,
      bookmark: true,
      bell: false,
    });
    const toggle = (key: string) => setPressed(p => ({...p, [key]: !p[key]}));
    return (
      <div style={{display: 'flex', gap: 8}}>
        <XDSToggleButton
          label="Star"
          icon={<XDSIcon icon={StarIcon} size="sm" color="secondary" />}
          pressedIcon={
            <XDSIcon icon={StarIconSolid} size="sm" color="yellow" />
          }
          isPressed={pressed.star}
          onPressedChange={() => toggle('star')}
          isIconOnly
        />
        <XDSToggleButton
          label="Like"
          icon={<XDSIcon icon={HeartIcon} size="sm" color="secondary" />}
          pressedIcon={<XDSIcon icon={HeartIconSolid} size="sm" color="red" />}
          isPressed={pressed.heart}
          onPressedChange={() => toggle('heart')}
          isIconOnly
        />
        <XDSToggleButton
          label="Save"
          icon={<XDSIcon icon={BookmarkIcon} size="sm" color="secondary" />}
          pressedIcon={
            <XDSIcon icon={BookmarkIconSolid} size="sm" color="blue" />
          }
          isPressed={pressed.bookmark}
          onPressedChange={() => toggle('bookmark')}
          isIconOnly
        />
        <XDSToggleButton
          label="Follow"
          icon={<XDSIcon icon={BellIcon} size="sm" color="secondary" />}
          pressedIcon={<XDSIcon icon={BellIcon} size="sm" color="accent" />}
          isPressed={pressed.bell}
          onPressedChange={() => toggle('bell')}
          isIconOnly
        />
      </div>
    );
  },
};
