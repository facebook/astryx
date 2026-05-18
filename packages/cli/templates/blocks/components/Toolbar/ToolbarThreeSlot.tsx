// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {ArrowLeftIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    width: 600,
    height: '100%',
    marginTop: 260,
  },
});

export default function ToolbarThreeSlot() {
  return (
    <XDSCard xstyle={styles.card}>
      <XDSToolbar
        label="Document toolbar"
        dividers={['bottom']}
        startContent={
          <XDSButton
            label="Back"
            variant="ghost"
            icon={<XDSIcon icon={ArrowLeftIcon} />}
            isIconOnly
          />
        }
        centerContent={<XDSHeading level={4}>Title</XDSHeading>}
        endContent={
          <>
            <XDSButton label="Discard" variant="secondary" />
            <XDSButton label="Save" variant="primary" />
          </>
        }
      />
      <XDSSection />
    </XDSCard>
  );
}
