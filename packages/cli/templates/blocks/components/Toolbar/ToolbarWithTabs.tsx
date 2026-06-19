// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Toolbar} from '@xds/core/Toolbar';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {TabList, Tab} from '@xds/core/TabList';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
import {PlusIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    width: '100%',
    maxWidth: 500,
    height: '100%',
    marginTop: 200,
  },
});

export default function ToolbarWithTabs() {
  const [tab, setTab] = useState('overview');
  return (
    <Card xstyle={styles.card}>
      <Toolbar
        label="Section navigation"
        dividers={['bottom']}
        startContent={
          <TabList value={tab} onChange={setTab}>
            <Tab value="overview" label="Overview" />
            <Tab value="analytics" label="Analytics" />
            <Tab value="settings" label="Settings" />
          </TabList>
        }
        endContent={
          <Button
            label="New item"
            icon={<Icon icon={PlusIcon} />}
            isIconOnly
          />
        }
      />
      <Section />
    </Card>
  );
}
