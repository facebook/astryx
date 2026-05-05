'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHeading} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {FunnelIcon, PlusIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    width: 500,
  },
});

const SIZES = [
  {size: 'sm' as const, label: 'Small'},
  {size: 'md' as const, label: 'Medium'},
  {size: 'lg' as const, label: 'Large'},
];

export default function ToolbarSizes() {
  return (
    <XDSStack direction="vertical" gap={4} xstyle={styles.container}>
      {SIZES.map(({size, label}) => (
        <XDSCard key={size}>
          <XDSToolbar
            label={`${label} toolbar`}
            size={size}
            startContent={<XDSHeading level={4}>{label}</XDSHeading>}
            endContent={
              <>
                <XDSButton
                  label="Filter"
                  variant="ghost"
                  icon={<XDSIcon icon={FunnelIcon} />}
                  isIconOnly
                />
                <XDSButton label="Add" icon={<XDSIcon icon={PlusIcon} />} />
              </>
            }
          />
        </XDSCard>
      ))}
    </XDSStack>
  );
}
