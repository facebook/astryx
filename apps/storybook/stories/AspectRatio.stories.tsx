import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSGrid} from '@xds/core/Grid';
import {XDSText} from '@xds/core/Text';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  container: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-surface'],
    maxWidth: 600,
  },
  wideContainer: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-surface'],
    maxWidth: 1000,
  },
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  sectionLabel: {
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: radiusVars['--radius-element'],
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colorVars['--color-wash'],
    borderRadius: radiusVars['--radius-element'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: radiusVars['--radius-element'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  gridItem: {
    overflow: 'hidden',
  },
  smallContainer: {
    maxWidth: 300,
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-surface'],
  },
});

const meta: Meta<typeof XDSAspectRatio> = {
  title: 'Layout/XDSAspectRatio',
  component: XDSAspectRatio,
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'number',
      description: 'The aspect ratio as width/height (e.g., 16/9 = 1.777...)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAspectRatio>;

// Placeholder image URLs
const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/600';
const PLACEHOLDER_SQUARE = 'https://picsum.photos/400/400';

export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: args => (
    <div sx={styles.container}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        16:9 Aspect Ratio (Default)
      </XDSText>
      <XDSAspectRatio {...args}>
        <img sx={styles.image} src={PLACEHOLDER_IMAGE} alt="16:9 placeholder" />
      </XDSAspectRatio>
    </div>
  ),
};

export const Widescreen16x9: Story = {
  render: () => (
    <div sx={styles.container}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        16:9 - Standard widescreen (YouTube, TV)
      </XDSText>
      <XDSAspectRatio ratio={16 / 9}>
        <img sx={styles.image} src={PLACEHOLDER_IMAGE} alt="16:9 widescreen" />
      </XDSAspectRatio>
    </div>
  ),
};

export const Classic4x3: Story = {
  render: () => (
    <div sx={styles.container}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        4:3 - Classic TV and photography
      </XDSText>
      <XDSAspectRatio ratio={4 / 3}>
        <img sx={styles.image} src={PLACEHOLDER_IMAGE} alt="4:3 classic" />
      </XDSAspectRatio>
    </div>
  ),
};

export const Square1x1: Story = {
  render: () => (
    <div sx={styles.smallContainer}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        1:1 - Square (Instagram, avatars)
      </XDSText>
      <XDSAspectRatio ratio={1}>
        <img sx={styles.image} src={PLACEHOLDER_SQUARE} alt="1:1 square" />
      </XDSAspectRatio>
    </div>
  ),
};

export const Ultrawide21x9: Story = {
  render: () => (
    <div sx={styles.wideContainer}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        21:9 - Ultrawide cinematic
      </XDSText>
      <XDSAspectRatio ratio={21 / 9}>
        <div sx={styles.gradientPlaceholder}>
          <XDSText type="label">Ultrawide 21:9</XDSText>
        </div>
      </XDSAspectRatio>
    </div>
  ),
};

export const WithPlaceholderSkeleton: Story = {
  render: () => (
    <div sx={styles.storyWrapper}>
      <div sx={styles.container}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          16:9 with loading skeleton
        </XDSText>
        <XDSAspectRatio ratio={16 / 9}>
          <XDSSkeleton width="100%" height="100%" />
        </XDSAspectRatio>
      </div>
      <div sx={styles.smallContainer}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          1:1 with loading skeleton
        </XDSText>
        <XDSAspectRatio ratio={1}>
          <XDSSkeleton width="100%" height="100%" />
        </XDSAspectRatio>
      </div>
    </div>
  ),
};

export const ResponsiveGrid: Story = {
  render: () => (
    <div sx={styles.wideContainer}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Responsive grid of aspect ratio boxes
      </XDSText>
      <XDSGrid minChildWidth={200} gap="space4">
        {[
          {ratio: 16 / 9, label: '16:9'},
          {ratio: 4 / 3, label: '4:3'},
          {ratio: 1, label: '1:1'},
          {ratio: 3 / 2, label: '3:2'},
          {ratio: 21 / 9, label: '21:9'},
          {ratio: 2 / 3, label: '2:3 Portrait'},
        ].map(({ratio, label}) => (
          <div key={label} sx={styles.gridItem}>
            <XDSAspectRatio ratio={ratio}>
              <div sx={styles.placeholder}>
                <XDSText type="label">{label}</XDSText>
              </div>
            </XDSAspectRatio>
          </div>
        ))}
      </XDSGrid>
    </div>
  ),
};

export const AllRatiosComparison: Story = {
  render: () => (
    <div sx={styles.storyWrapper}>
      <div sx={styles.container}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          16:9 (1.778) - Widescreen HD
        </XDSText>
        <XDSAspectRatio ratio={16 / 9}>
          <div sx={styles.placeholder}>
            <XDSText type="body">16:9</XDSText>
          </div>
        </XDSAspectRatio>
      </div>
      <div sx={styles.container}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          4:3 (1.333) - Classic TV
        </XDSText>
        <XDSAspectRatio ratio={4 / 3}>
          <div sx={styles.placeholder}>
            <XDSText type="body">4:3</XDSText>
          </div>
        </XDSAspectRatio>
      </div>
      <div sx={styles.smallContainer}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          1:1 (1.0) - Square
        </XDSText>
        <XDSAspectRatio ratio={1}>
          <div sx={styles.placeholder}>
            <XDSText type="body">1:1</XDSText>
          </div>
        </XDSAspectRatio>
      </div>
      <div sx={styles.container}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          3:2 (1.5) - Classic 35mm Film
        </XDSText>
        <XDSAspectRatio ratio={3 / 2}>
          <div sx={styles.placeholder}>
            <XDSText type="body">3:2</XDSText>
          </div>
        </XDSAspectRatio>
      </div>
      <div sx={styles.wideContainer}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          21:9 (2.333) - Ultrawide Cinematic
        </XDSText>
        <XDSAspectRatio ratio={21 / 9}>
          <div sx={styles.placeholder}>
            <XDSText type="body">21:9</XDSText>
          </div>
        </XDSAspectRatio>
      </div>
    </div>
  ),
};

export const ImageGallery: Story = {
  render: () => (
    <div sx={styles.wideContainer}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Image gallery with consistent aspect ratios
      </XDSText>
      <XDSGrid columns={3} gap="space4">
        {Array.from({length: 6}, (_, i) => (
          <XDSAspectRatio key={i} ratio={4 / 3}>
            <img
              sx={styles.image}
              src={`https://picsum.photos/seed/${i + 1}/400/300`}
              alt={`Gallery image ${i + 1}`} />
          </XDSAspectRatio>
        ))}
      </XDSGrid>
    </div>
  ),
};
