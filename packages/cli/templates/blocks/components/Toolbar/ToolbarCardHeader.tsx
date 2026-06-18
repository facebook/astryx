// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Toolbar} from '@xds/core/Toolbar';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Heading} from '@xds/core/Text';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
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
    <Card xstyle={styles.card}>
      <Toolbar
        label="User list actions"
        size="sm"
        dividers={['bottom']}
        startContent={<Heading level={4}>Card title</Heading>}
        endContent={
          <>
            <Button
              label="Filter"
              variant="ghost"
              icon={<Icon icon={FunnelIcon} />}
              isIconOnly
            />
            <Button
              label="Add user"
              icon={<Icon icon={PlusIcon} />}
              isIconOnly
            />
          </>
        }
      />
      <Section />
    </Card>
  );
}
