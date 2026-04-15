'use client';

import {XDSTable, type TablePlugin} from '@xds/core/Table';

type User = {name: string; isActive: boolean};
const activeRowStyle = {};
const users: User[] = [
  {name: 'Alice', isActive: true},
  {name: 'Bob', isActive: false},
];

export default function TableCustomPlugin() {
  const highlightPlugin: TablePlugin<User> = {
    transformBodyRow(props, item) {
      if (item.isActive) {
        return {...props, styles: [...props.styles, activeRowStyle]};
      }
      return props;
    },
  };

  return (
    <XDSTable data={users} plugins={{highlight: highlightPlugin}} />
  );
}
