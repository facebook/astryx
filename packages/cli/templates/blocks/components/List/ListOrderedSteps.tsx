// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {List, ListItem} from '@xds/core/List';

export default function ListOrderedSteps() {
  return (
    <List listStyle="decimal">
      <ListItem
        label="Install the package"
        description="npm install @xds/core"
      />
      <ListItem
        label="Import components"
        description="import { List } from '@xds/core'"
      />
      <ListItem
        label="Start building"
        description="Use components in your app"
      />
    </List>
  );
}
