'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';

function Logo() {
  return <div style={{padding: 8}}>Logo</div>;
}

function Navigation() {
  return <div style={{padding: 8}}>Navigation</div>;
}

function UserMenu() {
  return <div style={{padding: 8}}>UserMenu</div>;
}

export default function StackHeaderLayout() {
  return (
    <XDSHStack element="header" gap={2}>
      <XDSStackItem size="static">
        <Logo />
      </XDSStackItem>
      <XDSStackItem size="fill">
        <Navigation />
      </XDSStackItem>
      <XDSStackItem size="static">
        <UserMenu />
      </XDSStackItem>
    </XDSHStack>
  );
}
