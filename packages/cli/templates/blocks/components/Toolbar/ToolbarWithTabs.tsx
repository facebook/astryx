'use client';

import {useState} from 'react';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
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
    <XDSCard xstyle={styles.card}>
      <XDSToolbar
        label="Section navigation"
        dividers={['bottom']}
        startContent={
          <XDSTabList value={tab} onChange={setTab}>
            <XDSTab value="overview" label="Overview" />
            <XDSTab value="analytics" label="Analytics" />
            <XDSTab value="settings" label="Settings" />
          </XDSTabList>
        }
        endContent={
          <XDSButton
            label="New item"
            icon={<XDSIcon icon={PlusIcon} />}
            isIconOnly
          />
        }
      />
      <XDSSection />
    </XDSCard>
  );
}
