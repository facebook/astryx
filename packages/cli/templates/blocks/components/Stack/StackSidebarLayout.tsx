'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';

function Sidebar() {
  return <div style={{padding: 8}}>Sidebar</div>;
}

function MainContent() {
  return <div style={{padding: 8}}>MainContent</div>;
}

export default function StackSidebarLayout() {
  return (
    <XDSHStack gap={4}>
      <XDSStackItem size="static">
        <Sidebar />
      </XDSStackItem>
      <XDSStackItem size="fill">
        <MainContent />
      </XDSStackItem>
    </XDSHStack>
  );
}
