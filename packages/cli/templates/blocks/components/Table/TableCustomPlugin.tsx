'use client';

import {XDSTable} from '@xds/core/Table';

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
