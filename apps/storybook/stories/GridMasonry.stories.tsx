import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';
import {XDSMediaTheme} from '@xds/core/theme';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const meta: Meta = {
  title: 'Layout/XDSGrid/Masonry Gallery',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = stylex.create({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'clip',
    borderRadius: radiusVars['--radius-element'],
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: spacingVars['--spacing-5'],
    opacity: {
      default: 0,
      ':hover': 1,
    },
    transition: 'opacity 0.2s ease',
  },
  overlayAlwaysOn: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: spacingVars['--spacing-5'],
  },
  tag: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    left: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-accent-muted'],
    color: colorVars['--color-on-accent'],
    padding: `${spacingVars['--spacing-0-5']} ${spacingVars['--spacing-2']}`,
    borderRadius: radiusVars['--radius-element'],
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  title: string;
  category: string;
}

const IMAGES: GalleryImage[] = [
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=b9DqIpmzyeAQ7kNvwEuVNYV&_nc_oc=Adqx7M8RaKihjC8dSQUH_YjYNSkC7dv34yH96ndekQT74zfo2M6_DMfY-HyXDGEgXYHKMGTPSBWROmTm7oSKCaPg&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=e6YHUehLaMQde9dotUaFJw&_nc_ss=7a30f&oh=00_Af2odB5hzmvCl0lYC5CdnJjHLVeooKOjOOPItWbo1K-2tg&oe=69E6FAAB',
    title: 'Going places',
    category: 'Travel',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683340_1522469159433922_7776167798061220106_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Qpd2UWP6VgEQ7kNvwE-OPni&_nc_oc=AdrBHciJphXt9BtYMnlljRItaFe9QR13GbHjolSlqWeoP37sfn-C414s177sJjM7dk8xymfEjEIkYoEd8bspGCMK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=Lt9qRH3XlVoT53AL30YKsA&_nc_ss=7a30f&oh=00_Af0tIOpEarNFMfXkSd3D5DVXSUqIKjx9toPEqC89IupM5A&oe=69E6E494',
    title: 'Making memories',
    category: 'Home',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/673630979_2366966167048970_507510466630095319_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=hayXnp1KwWwQ7kNvwE6OwnY&_nc_oc=AdrKqob4CUU2_FrICyqd-B1NVcZ_p6oN45HC6nOs4_NJs-zvYEaj0pRdsvm5oBgVXMMQ-QIYfYEdY7NPSlkmD0VF&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=wxPGUKGIf3ihSjnc_4pFdQ&_nc_ss=7a30f&oh=00_Af3cPR8RHrFZTUPXixsgg3N4iz7847JxcTfJUbK1nisSPg&oe=69E6EAD4',
    title: 'Seeing things',
    category: 'Lifestyle',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/669447541_4390219861306657_6002100073104319158_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=sXKFHmKfCccQ7kNvwGsGpL1&_nc_oc=Adqy06LYMJsViftx1OlQnquClJHettJcc9a0z0BO_mx-979b2VldT8nPRe6J3BwPheu3AlAk6N4LlItaO3vU9xg4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=H412Z-rQCOugLK-6ss0CDA&_nc_ss=7a30f&oh=00_Af0LKXjbNPwFyK0rA1mnGPK57ctb0rzjTS5jwzXB03oPBw&oe=69E6E58D',
    title: 'Sharing ideas',
    category: 'Lifestyle',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/673173617_1842726693762408_2908608806392112143_n.png?_nc_cat=107&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=ipqP09C42_gQ7kNvwHwibG0&_nc_oc=Ado97zfee8ejAhB0dqWyWz4lhsi0K7kf9W9wFBfqvD7cm3mh9le59yGFgbdkzIWO255x4Oe7bwc_vnSh41GvAxTk&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=1ZhYNPWwWg8iLLqOsj0aUg&_nc_ss=7a30f&oh=00_Af340jh-0cJ2G-NDCnGJNrXd-RuAXXawyADjOqNP7tOD7Q&oe=69E712D6',
    title: 'Being free',
    category: 'Nature',
  },
];

// ─── Gallery Card ───────────────────────────────────────────────────────────

function GalleryCard({
  image,
  showOverlay = false,
}: {
  image: GalleryImage;
  showOverlay?: boolean;
}) {
  return (
    <div {...stylex.props(styles.card)}>
      <img src={image.src} alt={image.title} {...stylex.props(styles.img)} />
      <span {...stylex.props(styles.tag)}>{image.category}</span>
      <div
        {...stylex.props(
          showOverlay ? styles.overlayAlwaysOn : styles.overlay,
        )}>
        <XDSMediaTheme mode="dark">
          <XDSVStack gap={1}>
            <XDSText type="label">{image.title}</XDSText>
          </XDSVStack>
        </XDSMediaTheme>
      </div>
    </div>
  );
}

// ─── Stories ────────────────────────────────────────────────────────────────

/**
 * A Pinterest-style masonry gallery using XDSGrid with row spans.
 *
 * The key technique: define explicit row tracks with `gridTemplateRows`,
 * then use `XDSGridSpan` with different `rows` values to create items of
 * varying heights. This produces the characteristic staggered masonry layout
 * without any JavaScript height calculation.
 */
export const MasonryGallery: Story = {
  render: () => (
    <XDSSection variant="wash" padding={6}>
      <XDSVStack gap={5}>
        <XDSVStack gap={2}>
          <XDSHeading level={2}>Mixed Gallery</XDSHeading>
          <XDSText type="body">
            A masonry-style gallery using CSS Grid row spans. Each item spans a
            different number of rows to create a staggered, Pinterest-like
            layout.
          </XDSText>
        </XDSVStack>

        <XDSGrid columns={3} rowHeight={80} gap={3}>
          {/* Column 1: 4 + 2 = 6 rows */}
          <XDSGridSpan rows={4}>
            <GalleryCard image={IMAGES[0]} />
          </XDSGridSpan>
          <XDSGridSpan rows={2}>
            <GalleryCard image={IMAGES[1]} />
          </XDSGridSpan>

          {/* Column 2: 2 + 4 = 6 rows */}
          <XDSGridSpan rows={2}>
            <GalleryCard image={IMAGES[2]} />
          </XDSGridSpan>
          <XDSGridSpan rows={4}>
            <GalleryCard image={IMAGES[3]} />
          </XDSGridSpan>

          {/* Column 3: 3 + 3 = 6 rows */}
          <XDSGridSpan rows={3}>
            <GalleryCard image={IMAGES[4]} />
          </XDSGridSpan>
          <XDSGridSpan rows={3}>
            <GalleryCard image={IMAGES[0]} />
          </XDSGridSpan>
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  ),
};

/**
 * A denser masonry layout with a 4-column grid and smaller row tracks.
 * Uses `rowHeight={60}` for unlimited content.
 */
export const DenseMasonry: Story = {
  render: () => {
    return (
      <XDSSection variant="wash" padding={6}>
        <XDSVStack gap={5}>
          <XDSVStack gap={2}>
            <XDSHeading level={2}>Dense Masonry</XDSHeading>
            <XDSText type="body">
              A 4-column layout with <code>rowHeight={60}</code>. Each item gets
              a different row span for natural visual rhythm.
            </XDSText>
          </XDSVStack>

          <XDSGrid columns={4} rowHeight={60} gap={3}>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[2]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={5}>
              <GalleryCard image={IMAGES[3]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={2}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[2]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[3]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={5}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
          </XDSGrid>
        </XDSVStack>
      </XDSSection>
    );
  },
};

/**
 * A featured masonry layout combining column and row spans.
 * The hero image spans 2 columns and 4 rows, with smaller items
 * arranged around it.
 */
export const FeaturedMasonry: Story = {
  render: () => {
    return (
      <XDSSection variant="wash" padding={6}>
        <XDSVStack gap={5}>
          <XDSVStack gap={2}>
            <XDSHeading level={2}>Featured Masonry</XDSHeading>
            <XDSText type="body">
              Combines column spans and row spans for a featured hero layout.
              The primary image spans 2 columns × 5 rows.
            </XDSText>
          </XDSVStack>

          <XDSGrid columns={3} rowHeight={70} gap={3}>
            {/* Hero — 2 cols × 5 rows */}
            <XDSGridSpan columns={2} rows={5}>
              <GalleryCard image={IMAGES[2]} showOverlay />
            </XDSGridSpan>

            {/* Sidebar items */}
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={2}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>

            {/* Bottom row */}
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[3]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>
          </XDSGrid>
        </XDSVStack>
      </XDSSection>
    );
  },
};
