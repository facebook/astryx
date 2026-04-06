import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {XDSToggleButtonGroup} from '@xds/core/ToggleButton';
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
    pressedIconColor: {
      control: 'select',
      options: [
        undefined,
        'accent',
        'blue',
        'green',
        'yellow',
        'pink',
        'red',
        'orange',
        'purple',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSToggleButton>;

// =============================================================================
// Standalone
// =============================================================================

/** Interactive standalone toggle — click to toggle. */
function StandaloneDemo() {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <XDSToggleButton
      label="Bold"
      icon={<BoldIcon />}
      isPressed={isPressed}
      onPressedChange={setIsPressed}
    />
  );
}

export const Standalone: Story = {
  render: () => <StandaloneDemo />,
};

/** Icon-only toggles with label text and icon swap. */
function IconSwapDemo() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(true);
  return (
    <div style={{display: 'flex', gap: 8}}>
      <XDSToggleButton
        label="Favorite"
        icon={<StarIcon />}
        pressedIcon={<StarIconSolid />}
        pressedIconColor="yellow"
        isPressed={isFavorited}
        onPressedChange={setIsFavorited}
      />
      <XDSToggleButton
        label="Bookmark"
        icon={<BookmarkIcon />}
        pressedIcon={<BookmarkIconSolid />}
        pressedIconColor="accent"
        isPressed={isBookmarked}
        onPressedChange={setIsBookmarked}
      />
    </div>
  );
}

export const IconSwap: Story = {
  render: () => <IconSwapDemo />,
};

/** Toggle with visible label text — shows font weight shift. */
function LabelDemo() {
  const [isActive, setIsActive] = useState(false);
  return (
    <XDSToggleButton
      label="Active"
      isPressed={isActive}
      onPressedChange={setIsActive}>
      Active
    </XDSToggleButton>
  );
}

export const WithLabel: Story = {
  render: () => <LabelDemo />,
};

/** Disabled state. */
export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
    isPressed: false,
    isDisabled: true,
    icon: <BoldIcon />,
  },
};

/** Loading state. */
export const Loading: Story = {
  args: {
    label: 'Loading toggle',
    isPressed: true,
    isLoading: true,
    icon: <StarIcon />,
  },
};

/** All sizes side by side. */
function SizesDemo() {
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const toggle = (key: string) =>
    setPressed(prev => ({...prev, [key]: !prev[key]}));

  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSToggleButton
        label="Small"
        size="sm"
        icon={<BoldIcon />}
        isPressed={!!pressed.sm}
        onPressedChange={() => toggle('sm')}
      />
      <XDSToggleButton
        label="Medium"
        size="md"
        icon={<BoldIcon />}
        isPressed={!!pressed.md}
        onPressedChange={() => toggle('md')}
      />
      <XDSToggleButton
        label="Large"
        size="lg"
        icon={<BoldIcon />}
        isPressed={!!pressed.lg}
        onPressedChange={() => toggle('lg')}
      />
    </div>
  );
}

export const Sizes: Story = {
  render: () => <SizesDemo />,
};

// =============================================================================
// Groups
// =============================================================================

/** Single-select group — view mode switcher. Click active to deselect. */
function SingleGroupDemo() {
  const [view, setView] = useState<string | null>('list');
  return (
    <XDSToggleButtonGroup value={view} onChange={setView} label="View mode">
      <XDSToggleButton
        value="list"
        label="List view"
        icon={<ListBulletIcon />}
      />
      <XDSToggleButton
        value="grid"
        label="Grid view"
        icon={<Squares2X2Icon />}
      />
    </XDSToggleButtonGroup>
  );
}

export const GroupSingle: Story = {
  render: () => <SingleGroupDemo />,
};

/** Multi-select group — text formatting toolbar. */
function MultiGroupDemo() {
  const [formats, setFormats] = useState<string[]>([]);
  return (
    <XDSToggleButtonGroup
      type="multiple"
      value={formats}
      onChange={setFormats}
      label="Text formatting">
      <XDSToggleButton value="bold" label="Bold" icon={<BoldIcon />} />
      <XDSToggleButton value="italic" label="Italic" icon={<ItalicIcon />} />
      <XDSToggleButton
        value="underline"
        label="Underline"
        icon={<UnderlineIcon />}
      />
    </XDSToggleButtonGroup>
  );
}

export const GroupMultiple: Story = {
  render: () => <MultiGroupDemo />,
};

/** Notification toggle — icon swap between bell and bell-slash. */
function NotificationDemo() {
  const [isMuted, setIsMuted] = useState(false);
  return (
    <XDSToggleButton
      label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
      icon={<BellIcon />}
      pressedIcon={<BellSlashIcon />}
      isPressed={isMuted}
      onPressedChange={setIsMuted}
    />
  );
}

export const NotificationToggle: Story = {
  render: () => <NotificationDemo />,
};

/** Icon color palette — all available pressedIconColor values. */
function ColorPaletteDemo() {
  const colors = [
    'accent',
    'blue',
    'cyan',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'yellow',
  ] as const;

  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      {colors.map(color => (
        <XDSToggleButton
          key={color}
          label={color}
          icon={<StarIcon />}
          pressedIcon={<StarIconSolid />}
          pressedIconColor={color}
          isPressed={true}
          onPressedChange={() => {}}>
          {color}
        </XDSToggleButton>
      ))}
    </div>
  );
}

export const PressedIconColors: Story = {
  render: () => <ColorPaletteDemo />,
};
