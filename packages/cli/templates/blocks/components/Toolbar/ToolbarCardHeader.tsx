'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {FunnelIcon, PlusIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    width: 500,
    height: '100%',
    marginTop: 260,
  },
});

export default function ToolbarCardHeader() {
  return (
    <XDSCard xstyle={styles.card}>
      <XDSToolbar
        label="User list actions"
        size="sm"
        dividers={['bottom']}
        startContent={<XDSHeading level={4}>Card title</XDSHeading>}
        endContent={
          <>
            <XDSButton
              label="Filter"
              variant="ghost"
              icon={<XDSIcon icon={FunnelIcon} />}
              isIconOnly
            />
            <XDSButton
              label="Add user"
              icon={<XDSIcon icon={PlusIcon} />}
              isIconOnly
            />
          </>
        }
      />
      <XDSSection />
    </XDSCard>
  );
}
