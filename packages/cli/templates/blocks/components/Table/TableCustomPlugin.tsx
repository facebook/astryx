'use client';

import {XDSTable} from '@xds/core/Table';

type User = {name: string; isActive: boolean};
type TablePlugin<T> = {transformBodyRow: (props: any, item: T) => any};
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
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTable data={users} plugins={{highlight: highlightPlugin}} />
  );
}
