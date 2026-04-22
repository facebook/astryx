'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCenter} from '@xds/core/Center';

export default function SelectorWithSections() {
  const [value, setValue] = useState<string | undefined>();
  return (
    <XDSCenter width={250}>
      <XDSSelector
        label="Office"
        options={[
          {
            type: 'section',
            title: 'North America',
            options: [
              {value: 'nyc', label: 'New York'},
              {value: 'sf', label: 'San Francisco'},
              {value: 'sea', label: 'Seattle'},
            ],
          },
          {
            type: 'section',
            title: 'Europe',
            options: [
              {value: 'ldn', label: 'London'},
              {value: 'ber', label: 'Berlin'},
            ],
          },
          {
            type: 'section',
            title: 'Asia Pacific',
            options: [
              {value: 'tyo', label: 'Tokyo'},
              {value: 'sgp', label: 'Singapore'},
            ],
          },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Choose an office..."
      />
    </XDSCenter>
  );
}
