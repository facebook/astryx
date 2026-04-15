'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';

const fruits = [
  {label: 'Apple', value: 'apple'},
  {label: 'Banana', value: 'banana'},
  {label: 'Cherry', value: 'cherry'},
];

export default function TypeaheadBasicTypeahead() {
  const [selected, setSelected] = useState(null);

  const source = {
    // @ts-expect-error migrated example
    search: query => fruits.filter(f => f.label.includes(query)),
    bootstrap: () => fruits.slice(0, 5),
  };
  

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTypeahead
      label="Fruit"
      // @ts-expect-error migrated example
      searchSource={source}
      value={selected}
      // @ts-expect-error migrated example
      onChange={setSelected}
      placeholder="Search fruits..."
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TypeaheadBasicTypeahead,
};
