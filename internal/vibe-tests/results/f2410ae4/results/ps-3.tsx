// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Layout} from '@astryxdesign/core/Layout';
import {LayoutHeader} from '@astryxdesign/core/Layout';
import {LayoutContent} from '@astryxdesign/core/Layout';
import {LayoutPanel} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

const NAV_ITEMS = ['Dashboard', 'Users', 'Products', 'Orders', 'Settings'];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px'}}>
            <Button
              label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              variant="ghost"
              isIconOnly
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <Heading level={4}>Admin Panel</Heading>
          </div>
        </LayoutHeader>
      }
      start={sidebarOpen ? (
        <LayoutPanel width={240} hasDivider>
          <VStack gap={1}>
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                style={{
                  padding: '8px 16px', textAlign: 'left', border: 'none', borderRadius: 6,
                  backgroundColor: activeItem === item ? '#f0f0ff' : 'transparent',
                  cursor: 'pointer', width: '100%', fontSize: 14,
                }}
              >
                {item}
              </button>
            ))}
          </VStack>
        </LayoutPanel>
      ) : undefined}
      content={
        <LayoutContent padding={4}>
          <VStack gap={3}>
            <Heading level={2}>{activeItem}</Heading>
            <Text type="supporting">Content for the {activeItem.toLowerCase()} section goes here.</Text>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
