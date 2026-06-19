// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Toolbar} from '@xds/core/Toolbar';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Heading} from '@xds/core/Text';
import {Stack} from '@xds/core/Layout';
import {Card} from '@xds/core/Card';
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
    <Stack direction="vertical" gap={4} xstyle={styles.container}>
      {SIZES.map(({size, label}) => (
        <Card key={size}>
          <Toolbar
            label={`${label} toolbar`}
            size={size}
            startContent={<Heading level={4}>{label}</Heading>}
            endContent={
              <>
                <Button
                  label="Filter"
                  variant="ghost"
                  icon={<Icon icon={FunnelIcon} />}
                  isIconOnly
                />
                <Button label="Add" icon={<Icon icon={PlusIcon} />} />
              </>
            }
          />
        </Card>
      ))}
    </Stack>
  );
}
