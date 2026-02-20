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
// Pressed icon color — semantic coloring
// =============================================================================

export const PressedIconColor: Story = {
  name: 'Pressed Icon Color — Semantic',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
      }}>
      <div style={{fontSize: 12, color: '#4E606F', marginBottom: 4}}>
        Icons change to semantic colors when pressed — yellow star, pink heart,
        blue bookmark. The color only affects the icon, not the label text.
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <ToggleButtonDemo
          label="Favorite"
          icon={<StarIcon style={{width: 16, height: 16}} />}
          pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#F2C00B"
        />
        <ToggleButtonDemo
          label="Like"
          icon={<HeartIcon style={{width: 16, height: 16}} />}
          pressedIcon={<HeartIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#E91E63"
        />
        <ToggleButtonDemo
          label="Bookmark"
          icon={<BookmarkIcon style={{width: 16, height: 16}} />}
          pressedIcon={<BookmarkIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#0064E0"
        />
        <ToggleButtonDemo
          label="Notifications"
          icon={<BellIcon style={{width: 16, height: 16}} />}
          pressedIcon={<BellIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#0D8626"
        />
      </div>
      <div style={{fontSize: 12, color: '#4E606F', marginTop: 4}}>
        With visible labels — icon gets color, text stays default:
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <ToggleButtonDemo
          label="Favorite"
          icon={<StarIcon style={{width: 16, height: 16}} />}
          pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#F2C00B"
          defaultPressed>
          Favorite
        </ToggleButtonDemo>
        <ToggleButtonDemo
          label="Like"
          icon={<HeartIcon style={{width: 16, height: 16}} />}
          pressedIcon={<HeartIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#E91E63">
          Like
        </ToggleButtonDemo>
      </div>
    </div>
  ),
};

// =============================================================================
// Read-only state
// =============================================================================

export const ReadOnly: Story = {
  name: 'Read-Only State',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
      }}>
      <div style={{fontSize: 12, color: '#4E606F', marginBottom: 4}}>
        Read-only buttons show state but can&apos;t be toggled. No opacity
        reduction (unlike disabled), no hover/active effects. Useful for viewing
        someone else&apos;s favorites.
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <ToggleButtonDemo
          label="Favorited by user"
          icon={<StarIcon style={{width: 16, height: 16}} />}
          pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
          pressedIconColor="#F2C00B"
          isReadOnly
          defaultPressed
        />
        <ToggleButtonDemo
          label="Not bookmarked"
          icon={<BookmarkIcon style={{width: 16, height: 16}} />}
          pressedIcon={<BookmarkIconSolid style={{width: 16, height: 16}} />}
          isReadOnly
        />
        <ToggleButtonDemo
          label="Active"
          variant="outline"
          isReadOnly
          defaultPressed>
          Active
        </ToggleButtonDemo>
        <ToggleButtonDemo label="Archived" variant="outline" isReadOnly>
          Archived
        </ToggleButtonDemo>
      </div>
      <div style={{fontSize: 12, color: '#4E606F'}}>
        Compare: disabled (50% opacity) vs read-only (full opacity, no
        interaction)
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <ToggleButtonDemo
          label="Disabled"
          icon={<StarIcon style={{width: 16, height: 16}} />}
          pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
          isDisabled
          defaultPressed
        />
        <ToggleButtonDemo
          label="Read-only"
          icon={<StarIcon style={{width: 16, height: 16}} />}
          pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
          isReadOnly
          defaultPressed
        />
      </div>
    </div>
  ),
};

// =============================================================================
// Async action
// =============================================================================

export const AsyncAction: Story = {
  name: 'Async Action — API Toggle',
  render: () => {
    function AsyncToggleDemo() {
      const [isFavorited, setIsFavorited] = useState(false);
      const [isBookmarked, setIsBookmarked] = useState(true);

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '600px',
          }}>
          <div style={{fontSize: 12, color: '#4E606F', marginBottom: 4}}>
            These buttons simulate an API call with a 1.5s delay. The button
            shows a loading spinner during the transition. Try clicking rapidly
            — the button is disabled while pending.
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <XDSToggleButton
              label="Favorite"
              icon={<StarIcon style={{width: 16, height: 16}} />}
              pressedIcon={<StarIconSolid style={{width: 16, height: 16}} />}
              pressedIconColor="#F2C00B"
              isPressed={isFavorited}
              onPressedChange={setIsFavorited}
              onPressedChangeAction={async () => {
                await new Promise(r => setTimeout(r, 1500));
              }}
            />
            <XDSToggleButton
              label="Bookmark"
              icon={<BookmarkIcon style={{width: 16, height: 16}} />}
              pressedIcon={
                <BookmarkIconSolid style={{width: 16, height: 16}} />
              }
              pressedIconColor="#0064E0"
              isPressed={isBookmarked}
              onPressedChange={setIsBookmarked}
              onPressedChangeAction={async () => {
                await new Promise(r => setTimeout(r, 1500));
              }}>
              Bookmark
            </XDSToggleButton>
          </div>
        </div>
      );
    }
    return <AsyncToggleDemo />;
  },
};

// =============================================================================
// Emphasized text — font-weight shift on press
// =============================================================================

export const EmphasizedText: Story = {
  name: 'Emphasized Text — No Layout Shift',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
      }}>
      <div
        style={{
          fontSize: 12,
          color: '#4E606F',
          marginBottom: 4,
        }}>
        Toggle these buttons — the text goes semibold when pressed, but the
        button width stays constant (no layout shift). A hidden pseudo-element
        reserves the semibold width at all times.
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <ToggleButtonDemo label="Notifications" variant="ghost" />
        <ToggleButtonDemo label="Following" variant="ghost" defaultPressed />
        <ToggleButtonDemo label="Mentions" variant="ghost" />
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <ToggleButtonDemo label="Active" variant="secondary" defaultPressed />
        <ToggleButtonDemo label="Pending" variant="secondary" />
        <ToggleButtonDemo label="Archived" variant="secondary" />
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <ToggleButtonDemo label="All" variant="outline" />
        <ToggleButtonDemo label="Published" variant="outline" defaultPressed />
        <ToggleButtonDemo label="Drafts" variant="outline" />
        <ToggleButtonDemo label="Scheduled" variant="outline" />
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#4E606F',
          marginTop: 8,
        }}>
        Icon + label combo with both icon swap and emphasized text:
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <ToggleButtonDemo
          label="Favorite"
          variant="ghost"
          icon={<HeartIcon style={{width: 16, height: 16}} />}
          pressedIcon={<HeartIconSolid style={{width: 16, height: 16}} />}>
          Favorite
        </ToggleButtonDemo>
        <ToggleButtonDemo
          label="Bookmark"
          variant="ghost"
          icon={<BookmarkIcon style={{width: 16, height: 16}} />}
          pressedIcon={<BookmarkIconSolid style={{width: 16, height: 16}} />}
          defaultPressed>
          Bookmark
        </ToggleButtonDemo>
        <ToggleButtonDemo
          label="Watch"
          variant="outline"
          icon={<EyeIcon style={{width: 16, height: 16}} />}
          pressedIcon={<EyeIconSolid style={{width: 16, height: 16}} />}>
          Watch
        </ToggleButtonDemo>
      </div>
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
