// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {List, ListItem} from '@xds/core/List';

export default function ListBulletedFeatures() {
  return (
    <List listStyle="disc">
      <ListItem label="Accessible by default" />
      <ListItem label="Themeable with StyleX" />
      <ListItem label="Composable and extensible" />
    </List>
  );
}
