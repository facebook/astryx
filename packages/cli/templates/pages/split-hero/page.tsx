'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

const IMAGE_URL =
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/670440654_2425466027902111_441009769495615664_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=KAne1WvHbZcQ7kNvwHo-Qoh&_nc_oc=AdpN15TFwJA5HEWlmPDTsKsGnQYqaIv1daYiDhGyc2qNC0YqI3GoWNekmCRYk2hvCZQU0iDpsrUeVzQgQOUEDgE4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=n8xlNXX6bfRWCIiKKNQpQA&_nc_ss=7a30f&oh=00_Af1EmpQZFgbNTw9QWUv6jsOVUpd9Vc-0LLlt3pyiLVFeug&oe=69EC1677';

const styles = stylex.create({
  titleResponsive: {
    fontSize: {
      default: 'var(--text-display-2-size)',
      '@media (max-width: 640px)': 'var(--text-display-3-size)',
    },
  },
  topSpacing: {
    paddingTop: 'var(--spacing-12)',
  },
  splitContainer: {
    paddingInline: 'var(--spacing-6)',
  },
  flex1: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageClip: {
    overflow: 'hidden',
    borderRadius: 'var(--radius-container)',
  },
});

export default function SplitHero() {
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
      <XDSHStack
        gap={10}
        vAlign="center"
        xstyle={[styles.topSpacing, styles.splitContainer]}>
        <XDSVStack gap={6} xstyle={styles.flex1}>
          <XDSVStack gap={3}>
            <XDSText
              type="display-2"
              as="h1"
              weight="bold"
              textWrap="balance"
              xstyle={styles.titleResponsive}>
              Little joys, everywhere you go
            </XDSText>
            <XDSText type="body" color="secondary" textWrap="balance">
              Sometimes all it takes is one small thing to turn your whole day
              around.
            </XDSText>
          </XDSVStack>
          <XDSHStack gap={3}>
            <XDSButton
              label="Get started"
              variant="primary"
              endContent={
                <XDSIcon icon={ArrowRightIcon} size="sm" color="inherit" />
              }
            />
            <XDSButton label="Learn more" variant="secondary" />
          </XDSHStack>
        </XDSVStack>
        <XDSAspectRatio ratio={4 / 5} xstyle={[styles.flex1, styles.imageClip]}>
          <img
            {...stylex.props(styles.heroImage)}
            src={IMAGE_URL}
            alt="Illustrative vertical artwork with vibrant colors"
          />
        </XDSAspectRatio>
      </XDSHStack>
    </XDSAppShell>
  );
}
