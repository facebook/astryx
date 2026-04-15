'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';

export default function TypeaheadBasicTypeahead() {
  const [selected, setSelected] = useState(null);

  const source = {
    search: query => fruits.filter(f => f.label.includes(query)),
    bootstrap: () => fruits.slice(0, 5),
  };
  

  return (
    <XDSTypeahead
      label="Fruit"
      searchSource={source}
      value={selected}
      onChange={setSelected}
      placeholder="Search fruits..."
    />
  );
}
