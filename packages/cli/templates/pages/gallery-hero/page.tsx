'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSection} from '@xds/core/Section';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

const IMAGES = [
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670260643_4371306203125531_1093895092404715068_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=8DNDqYQ-HlAQ7kNvwFixzqd&_nc_oc=AdqWUbYPtoQiiTtUkVvRaqCz1Vb8xpArrNiG9wrvYQeGn1_ZoIwBbbnDsVy5W06HmMJ33Jw5Zi-v-0jxpETqCObL&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=5qc5alnBasgOfCv0qggnCQ&_nc_ss=7a30f&oh=00_Af3UnG6pajsU4ngTWofPYySbruvxaxKAupExLHtjA0GRaw&oe=69E9886B',
    alt: 'Colorful home interior with vibrant decor',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670422313_1309114328024296_2325112857517486215_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=UcKaimmopFkQ7kNvwG5cFp3&_nc_oc=AdrU7QvF-jKlYmG-Lfo9IvCucGfOpeRGaLeWPNgkhGtvMbcXnepY-eRF18hQmyWprjg8MJ3PX48peAKEsOs6oYOE&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=hWd-diGpmNdwV7EQs9TH4g&_nc_ss=7a30f&oh=00_Af14lXSPHUE34ePZGZkbZhSOYmIaLxrbclohokIfGF947g&oe=69E99A02',
    alt: 'Colorful lifestyle portrait with natural lighting',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670480937_2502078110200666_6842204180822201520_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=CkjsPqmDibQQ7kNvwHkqI35&_nc_oc=AdqCBagwocUt6pKl8FbB6mA-pmWSnum8-IQw1wk74AP-3vg7MxyzT9i0Gi8RSPeFDr1hFOJr19eqJAwwb4Evq_Az&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=irTVHgrA3MGqSILwcAjgfA&_nc_ss=7a30f&oh=00_Af3X_3VEp3lYvRpCV3S2jRGKstnQiL2MOac3lwcs2Y2y0g&oe=69E9A474',
    alt: 'Colorful lifestyle scene with warm tones',
  },
];

const styles = stylex.create({
  textCenter: {
    textAlign: 'center',
  },
  titleResponsive: {
    fontSize: {
      default: 'var(--text-display-2-size)',
      '@media (max-width: 640px)': 'var(--text-display-3-size)',
    },
  },
  topSpacing: {
    paddingTop: 'var(--spacing-12)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  galleryImageClip: {
    borderRadius: 'var(--radius-container)',
  },
});

export default function GalleryHero() {
  return (
    <XDSAppShell
      variant="surface"
      topNav={
        <XDSTopNav
          label="Main navigation"
          heading={<XDSTopNavHeading heading="DAIILY" />}
          endContent={
            <>
              <XDSTopNavItem label="Products" href="#" />
              <XDSTopNavItem label="Solutions" href="#" />
              <XDSTopNavItem label="Pricing" href="#" />
              <XDSTopNavItem label="About" href="#" />
            </>
          }
        />
      }
      contentPadding={0}>
      <XDSVStack gap={10}>
        <XDSVStack gap={6} hAlign="center" xstyle={styles.topSpacing}>
          <XDSVStack gap={3} hAlign="center">
            <XDSText
              type="display-2"
              as="h1"
              weight="bold"
              textWrap="balance"
              xstyle={[styles.textCenter, styles.titleResponsive]}>
              Little joys, everywhere you go
            </XDSText>
            <XDSText
              type="body"
              color="secondary"
              textWrap="balance"
              xstyle={styles.textCenter}>
              Sometimes all it takes is one small thing to turn your whole day
              around.
            </XDSText>
          </XDSVStack>
          <XDSHStack gap={3}>
            <XDSButton
              label="Get started"
              variant="secondary"
              endContent={
                <XDSIcon icon={ArrowRightIcon} size="sm" color="inherit" />
              }
            />
            <XDSButton label="Learn more" variant="ghost" />
          </XDSHStack>
        </XDSVStack>
        <XDSSection variant="transparent" padding={6}>
          <XDSGrid columns={3} gap={4}>
            {IMAGES.map((image, i) => (
              <XDSAspectRatio
                key={i}
                ratio={4 / 5}
                xstyle={styles.galleryImageClip}>
                <img
                  {...stylex.props(styles.galleryImage)}
                  src={image.src}
                  alt={image.alt}
                />
              </XDSAspectRatio>
            ))}
          </XDSGrid>
        </XDSSection>
      </XDSVStack>
    </XDSAppShell>
  );
}
