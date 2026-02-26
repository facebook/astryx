import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSScrollableArea} from '@xds/core/ScrollableArea';
import {XDSVStack} from '@xds/core/Layout';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
  },
  item: {
    padding: spacingVars['--spacing-3'],
    fontFamily: typographyVars['--font-body'],
    color: colorVars['--color-text-primary'],
  },
  wideContent: {
    display: 'flex',
    gap: spacingVars['--spacing-3'],
    whiteSpace: 'nowrap',
  },
  cell: {
    minWidth: '200px',
    padding: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-surface'],
    borderRadius: '6px',
    fontFamily: typographyVars['--font-body'],
    color: colorVars['--color-text-primary'],
  },
  card: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: '8px',
    padding: spacingVars['--spacing-4'],
  },
});

const meta: Meta<typeof XDSScrollableArea> = {
  title: 'Core/XDSScrollableArea',
  component: XDSScrollableArea,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
      description: 'Which axes are scrollable',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Scrollbar track size',
    },
    isAlwaysVisible: {
      control: 'boolean',
      description: 'Always show scrollbar',
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum height (px)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSScrollableArea>;

const generateItems = (count: number) =>
  Array.from({length: count}, (_, i) => `Item ${i + 1}`);

export const Default: Story = {
  render: function Default() {
    return (
      <div {...stylex.props(styles.card)}>
        <XDSScrollableArea maxHeight={200}>
          <XDSVStack>
            {generateItems(20).map(item => (
              <div key={item} {...stylex.props(styles.item)}>
                {item}
              </div>
            ))}
          </XDSVStack>
        </XDSScrollableArea>
      </div>
    );
  },
};

export const Horizontal: Story = {
  render: function Horizontal() {
    return (
      <div {...stylex.props(styles.card)}>
        <XDSScrollableArea orientation="horizontal" maxWidth={500}>
          <div {...stylex.props(styles.wideContent)}>
            {generateItems(10).map(item => (
              <div key={item} {...stylex.props(styles.cell)}>
                {item}
              </div>
            ))}
          </div>
        </XDSScrollableArea>
      </div>
    );
  },
};

export const BothAxes: Story = {
  render: function BothAxes() {
    return (
      <div {...stylex.props(styles.card)}>
        <XDSScrollableArea orientation="both" maxHeight={200} maxWidth={400}>
          <div style={{width: 800}}>
            <XDSVStack>
              {generateItems(20).map(item => (
                <div key={item} {...stylex.props(styles.item)}>
                  {item} — with extra content that makes the row wider than the
                  container
                </div>
              ))}
            </XDSVStack>
          </div>
        </XDSScrollableArea>
      </div>
    );
  },
};

export const ThinScrollbar: Story = {
  render: function ThinScrollbar() {
    return (
      <div {...stylex.props(styles.card)}>
        <XDSScrollableArea
          size="sm"
          isAlwaysVisible
          maxHeight={200}
          label="Compact list">
          <XDSVStack>
            {generateItems(20).map(item => (
              <div key={item} {...stylex.props(styles.item)}>
                {item}
              </div>
            ))}
          </XDSVStack>
        </XDSScrollableArea>
      </div>
    );
  },
};

export const AlwaysVisible: Story = {
  render: function AlwaysVisible() {
    return (
      <div {...stylex.props(styles.card)}>
        <XDSScrollableArea isAlwaysVisible maxHeight={200}>
          <XDSVStack>
            {generateItems(20).map(item => (
              <div key={item} {...stylex.props(styles.item)}>
                {item}
              </div>
            ))}
          </XDSVStack>
        </XDSScrollableArea>
      </div>
    );
  },
};
