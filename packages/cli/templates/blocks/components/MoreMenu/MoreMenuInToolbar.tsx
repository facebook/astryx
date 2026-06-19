// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {MoreMenu} from '@xds/core/MoreMenu';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Toolbar} from '@xds/core/Toolbar';
import {Heading} from '@xds/core/Text';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    marginTop: 100,
  },
  moreMenuWrapper: {
    marginInlineEnd: 8,
  },
});

export default function MoreMenuInToolbar() {
  return (
    <Card width="100%" height="100%" xstyle={styles.card}>
      <Toolbar
        label="Project actions"
        size="sm"
        dividers={['bottom']}
        startContent={
          <Button
            label="Back"
            variant="ghost"
            icon={<Icon icon={ArrowLeftIcon} />}
            isIconOnly
          />
        }
        centerContent={<Heading level={5}>Title</Heading>}
        endContent={
          <>
            <div {...stylex.props(styles.moreMenuWrapper)}>
              <MoreMenu
                label="More actions"
                size="sm"
                items={[
                  {label: 'Export', icon: ArrowDownTrayIcon, onClick: () => {}},
                  {label: 'Share', icon: ShareIcon, onClick: () => {}},
                  {type: 'divider'},
                  {label: 'Delete', icon: TrashIcon, onClick: () => {}},
                ]}
              />
            </div>
            <Button label="Discard" variant="secondary" size="sm" />
            <Button label="Save" variant="primary" size="sm" />
          </>
        }
      />
      <Section />
    </Card>
  );
}
