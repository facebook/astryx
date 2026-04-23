'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
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
    <XDSCard width="100%" height="100%" xstyle={styles.card}>
      <XDSToolbar
        label="Project actions"
        size="sm"
        dividers={['bottom']}
        startContent={
          <XDSButton
            label="Back"
            variant="ghost"
            icon={<XDSIcon icon={ArrowLeftIcon} />}
            isIconOnly
          />
        }
        centerContent={<XDSHeading level={5}>Title</XDSHeading>}
        endContent={
          <>
            <div {...stylex.props(styles.moreMenuWrapper)}>
              <XDSMoreMenu
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
            <XDSButton label="Discard" variant="secondary" size="sm" />
            <XDSButton label="Save" variant="primary" size="sm" />
          </>
        }
      />
      <XDSSection />
    </XDSCard>
  );
}
