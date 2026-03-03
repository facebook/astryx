'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core';
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';

const styles = stylex.create({
  container: {
    maxWidth: 960,
  },
  navWrapper: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

type Alignment = 'start' | 'center' | 'end';

/**
 * Navigation exploration page.
 *
 * Demonstrates XDSTopNav with nav items aligned to start (left),
 * center, or end (right) using the slot-based API.
 */
export default function NavigationPage() {
  const [alignment, setAlignment] = useState<Alignment>('start');

  return (
    <div {...stylex.props(styles.container)}>
      <XDSStack direction="vertical" gap="space6">
        <XDSStack direction="vertical" gap="space2">
          <XDSHeading level={1}>Navigation Alignment</XDSHeading>
          <XDSText type="body" color="secondary">
            Explore how nav items can be positioned left, center, or right using
            XDSTopNav&apos;s slot-based API.
          </XDSText>
        </XDSStack>

        {/* Alignment picker */}
        <XDSStack direction="horizontal" gap="space3" vAlign="center">
          <XDSText type="body" weight="bold">
            Alignment:
          </XDSText>
          <XDSButton
            label="Left"
            variant={alignment === 'start' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAlignment('start')}
          />
          <XDSButton
            label="Center"
            variant={alignment === 'center' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAlignment('center')}
          />
          <XDSButton
            label="Right"
            variant={alignment === 'end' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAlignment('end')}
          />
        </XDSStack>

        <XDSDivider />

        {/* Live preview */}
        <XDSStack direction="vertical" gap="space3">
          <XDSHeading level={2}>Preview</XDSHeading>
          <div {...stylex.props(styles.navWrapper)}>
            <NavPreview alignment={alignment} />
          </div>
        </XDSStack>

        <XDSDivider />

        {/* All three side by side */}
        <XDSStack direction="vertical" gap="space4">
          <XDSHeading level={2}>All Alignments</XDSHeading>

          <XDSStack direction="vertical" gap="space2">
            <XDSText type="supporting" weight="bold">
              Left-aligned (startContent)
            </XDSText>
            <div {...stylex.props(styles.navWrapper)}>
              <NavPreview alignment="start" />
            </div>
          </XDSStack>

          <XDSStack direction="vertical" gap="space2">
            <XDSText type="supporting" weight="bold">
              Center-aligned (centerContent)
            </XDSText>
            <div {...stylex.props(styles.navWrapper)}>
              <NavPreview alignment="center" />
            </div>
          </XDSStack>

          <XDSStack direction="vertical" gap="space2">
            <XDSText type="supporting" weight="bold">
              Right-aligned (endContent)
            </XDSText>
            <div {...stylex.props(styles.navWrapper)}>
              <NavPreview alignment="end" />
            </div>
          </XDSStack>
        </XDSStack>
      </XDSStack>
    </div>
  );
}

const navItems = (
  <>
    <XDSTopNavItem label="Home" href="#" isSelected />
    <XDSTopNavItem label="Products" href="#" />
    <XDSTopNavItem label="About" href="#" />
  </>
);

function NavPreview({alignment}: {alignment: Alignment}) {
  return (
    <XDSTopNav
      label={`${alignment}-aligned navigation`}
      title={<XDSTopNavTitle title="My App" />}
      startContent={alignment === 'start' ? navItems : undefined}
      centerContent={alignment === 'center' ? navItems : undefined}
      endContent={alignment === 'end' ? navItems : undefined}
    />
  );
}
