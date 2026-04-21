'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorWithSections() {
  const [value, setValue] = useState<string | undefined>();
  return (
    <div style={{width: 250}}>
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
          {
            type: 'section',
            title: 'Citrus',
            options: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
              {value: 'lime', label: 'Lime'},
            ],
          },
          {
            type: 'section',
            title: 'Tropical',
            options: [
              {value: 'mango', label: 'Mango'},
              {value: 'pineapple', label: 'Pineapple'},
            ],
          },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Select a fruit..."
      />
    </div>
  );
}
