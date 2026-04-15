'use client';

import {XDSStackItem, XDSVStack} from '@xds/core/Layout';

function PageHeader() {
  return <div style={{padding: 8}}>PageHeader</div>;
}

function PageContent() {
  return <div style={{padding: 8}}>PageContent</div>;
}

function PageFooter() {
  return <div style={{padding: 8}}>PageFooter</div>;
}

export default function StackPageLayout() {
  return (
    <XDSVStack element="main" gap={6}>
      <XDSStackItem size="static">
        <PageHeader />
      </XDSStackItem>
      <XDSStackItem size="fill">
        <PageContent />
      </XDSStackItem>
      <XDSStackItem size="static">
        <PageFooter />
      </XDSStackItem>
    </XDSVStack>
  );
}
