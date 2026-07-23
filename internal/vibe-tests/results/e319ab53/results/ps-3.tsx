// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Layout} from '@astryxdesign/core/Layout';
import {LayoutHeader} from '@astryxdesign/core/Layout';
import {LayoutContent} from '@astryxdesign/core/Layout';
import {LayoutPanel} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const NAV_ITEMS = ['Dashboard', 'Users', 'Products', 'Orders', 'Settings'];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <div className="flex items-center gap-3 px-4">
            <Button label={sidebarOpen ? 'Collapse' : 'Expand'} variant="ghost" isIconOnly onClick={() => setSidebarOpen(!sidebarOpen)} />
            <Heading level={4}>Admin Panel</Heading>
          </div>
        </LayoutHeader>
      }
      start={sidebarOpen ? (
        <LayoutPanel width={240} hasDivider>
          <div className="flex flex-col gap-1 p-2">
            {NAV_ITEMS.map(item => (
              <button key={item} onClick={() => setActiveItem(item)} className={`text-left px-4 py-2 rounded text-sm border-0 cursor-pointer ${activeItem === item ? 'bg-blue-50 font-medium' : 'bg-transparent hover:bg-gray-50'}`}>
                {item}
              </button>
            ))}
          </div>
        </LayoutPanel>
      ) : undefined}
      content={
        <LayoutContent padding={4}>
          <div className="flex flex-col gap-3">
            <Heading level={2}>{activeItem}</Heading>
            <Text type="supporting">Content for the {activeItem.toLowerCase()} section.</Text>
          </div>
        </LayoutContent>
      }
    />
  );
}
