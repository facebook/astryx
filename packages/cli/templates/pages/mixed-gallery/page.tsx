'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSIcon} from '@xds/core/Icon';
import {XDSMediaTheme} from '@xds/core/theme';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────

const layoutStyles = stylex.create({
  fullHeight: {
    height: '100%',
  },
  minHeightZero: {
    minHeight: 0,
  },
  textCenter: {
    textAlign: 'center',
  },
  desktopOnly: {
    display: {
      default: 'flex',
      '@media (max-width: 767px)': 'none',
    },
  },
  mobileOnly: {
    display: {
      default: 'none',
      '@media (max-width: 767px)': 'flex',
    },
  },
  mobileGap: {
    gap: {
      default: null,
      '@media (max-width: 767px)': 'var(--spacing-3)',
    },
  },
});

const overlayStyles = stylex.create({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'clip',
    borderRadius: 'var(--radius-element)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--color-overlay)',
    opacity: {
      default: 0,
      ':hover': 1,
    },
    transition: 'opacity 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 'var(--spacing-6)',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  title: string;
  description: string;
}

const IMAGES: GalleryImage[] = [
  {
    // Column 1: illustrative-horizontal-1
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=b9DqIpmzyeAQ7kNvwEuVNYV&_nc_oc=Adqx7M8RaKihjC8dSQUH_YjYNSkC7dv34yH96ndekQT74zfo2M6_DMfY-HyXDGEgXYHKMGTPSBWROmTm7oSKCaPg&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=e6YHUehLaMQde9dotUaFJw&_nc_ss=7a30f&oh=00_Af2odB5hzmvCl0lYC5CdnJjHLVeooKOjOOPItWbo1K-2tg&oe=69E6FAAB',
    title: 'Going places',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // Column 1: light-home-horizontal-1
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683340_1522469159433922_7776167798061220106_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Qpd2UWP6VgEQ7kNvwE-OPni&_nc_oc=AdrBHciJphXt9BtYMnlljRItaFe9QR13GbHjolSlqWeoP37sfn-C414s177sJjM7dk8xymfEjEIkYoEd8bspGCMK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=Lt9qRH3XlVoT53AL30YKsA&_nc_ss=7a30f&oh=00_Af0tIOpEarNFMfXkSd3D5DVXSUqIKjx9toPEqC89IupM5A&oe=69E6E494',
    title: 'Making memories',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // Column 2: light-lifestyle-vertical-3
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/673630979_2366966167048970_507510466630095319_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=hayXnp1KwWwQ7kNvwE6OwnY&_nc_oc=AdrKqob4CUU2_FrICyqd-B1NVcZ_p6oN45HC6nOs4_NJs-zvYEaj0pRdsvm5oBgVXMMQ-QIYfYEdY7NPSlkmD0VF&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=wxPGUKGIf3ihSjnc_4pFdQ&_nc_ss=7a30f&oh=00_Af3cPR8RHrFZTUPXixsgg3N4iz7847JxcTfJUbK1nisSPg&oe=69E6EAD4',
    title: 'Seeing things',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // Column 3: light-lifestyle-vertical-1
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/669447541_4390219861306657_6002100073104319158_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=sXKFHmKfCccQ7kNvwGsGpL1&_nc_oc=Adqy06LYMJsViftx1OlQnquClJHettJcc9a0z0BO_mx-979b2VldT8nPRe6J3BwPheu3AlAk6N4LlItaO3vU9xg4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=H412Z-rQCOugLK-6ss0CDA&_nc_ss=7a30f&oh=00_Af0LKXjbNPwFyK0rA1mnGPK57ctb0rzjTS5jwzXB03oPBw&oe=69E6E58D',
    title: 'Sharing ideas',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // Column 3: light-lifestyle-horizontal-1
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/673173617_1842726693762408_2908608806392112143_n.png?_nc_cat=107&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=ipqP09C42_gQ7kNvwHwibG0&_nc_oc=Ado97zfee8ejAhB0dqWyWz4lhsi0K7kf9W9wFBfqvD7cm3mh9le59yGFgbdkzIWO255x4Oe7bwc_vnSh41GvAxTk&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=1ZhYNPWwWg8iLLqOsj0aUg&_nc_ss=7a30f&oh=00_Af340jh-0cJ2G-NDCnGJNrXd-RuAXXawyADjOqNP7tOD7Q&oe=69E712D6',
    title: 'Being free',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
];

const imgStyles = stylex.create({
  cover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    minHeight: 0,
  },
});

// ─── Gallery Card with Hover Overlay ────────────────────────────────────────

function GalleryCard({image}: {image: GalleryImage}) {
  return (
    <div {...stylex.props(overlayStyles.card)}>
      <img
        src={image.src}
        alt={image.title}
        {...stylex.props(imgStyles.cover)}
      />
      <div {...stylex.props(overlayStyles.overlay)}>
        <XDSMediaTheme mode="dark">
          <XDSVStack gap={3}>
            <XDSHeading level={2}>{image.title}</XDSHeading>
            <XDSText type="body">{image.description}</XDSText>
            <XDSButton
              label="Read more"
              variant="secondary"
              endContent={<XDSIcon icon={ArrowRightIcon} />}
            />
          </XDSVStack>
        </XDSMediaTheme>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  return (
    <XDSAppShell height="fill" contentPadding={6} variant="surface">
      <XDSCenter axis="horizontal" height="100%">
        <XDSSection
          variant="transparent"
          maxWidth={1400}
          width="100%"
          height="100%"
          padding={0}>
          <XDSVStack
            gap={6}
            xstyle={[layoutStyles.fullHeight, layoutStyles.mobileGap]}>
            {/* Header — capped with XDSSection maxWidth */}
            <XDSCenter axis="horizontal">
              <XDSSection variant="transparent" maxWidth={680}>
                <XDSVStack gap={2} xstyle={layoutStyles.textCenter}>
                  <XDSHeading level={1}>
                    Make every day a little more delightful, one detail at a
                    time.
                  </XDSHeading>
                  <XDSText type="body">
                    We believe the smallest details are the ones that matter
                    most. A little color, a thoughtful touch, a moment that
                    catches your eye and makes you pause; that's what turns an
                    ordinary day into something worth remembering.
                  </XDSText>
                </XDSVStack>
              </XDSSection>
            </XDSCenter>

            {/* Gallery — desktop: 3-col masonry, mobile: single column */}

            {/* Desktop layout (hidden on mobile) */}
            <XDSStackItem size="fill" xstyle={layoutStyles.desktopOnly}>
              <XDSGrid columns={3} gap={4} height="100%">
                <XDSVStack gap={4} xstyle={layoutStyles.minHeightZero}>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[0]} />
                  </XDSStackItem>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[1]} />
                  </XDSStackItem>
                </XDSVStack>

                <GalleryCard image={IMAGES[2]} />

                <XDSVStack gap={4} xstyle={layoutStyles.minHeightZero}>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[3]} />
                  </XDSStackItem>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[4]} />
                  </XDSStackItem>
                </XDSVStack>
              </XDSGrid>
            </XDSStackItem>

            {/* Mobile layout (hidden on desktop) */}
            <XDSVStack gap={4} xstyle={layoutStyles.mobileOnly}>
              {IMAGES.map((image, i) => (
                <XDSAspectRatio key={i} ratio={16 / 9}>
                  <GalleryCard image={image} />
                </XDSAspectRatio>
              ))}
            </XDSVStack>
          </XDSVStack>
        </XDSSection>
      </XDSCenter>
    </XDSAppShell>
  );
}
