'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorWithStatus() {
  const [value1, setValue1] = useState<string | undefined>();
  const [value2, setValue2] = useState<string | undefined>('banana');
  const [value3, setValue3] = useState<string | undefined>('apple');
  return (
    <div
      style={{display: 'flex', flexDirection: 'column', gap: 16, width: 250}}>
      <XDSSelector
        label="Error status"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
        ]}
        value={value1}
        onChange={setValue1}
        placeholder="Select a fruit..."
        status={{type: 'error', message: 'Please select a fruit'}}
      />
      <XDSSelector
        label="Warning status"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
        ]}
        value={value2}
        onChange={setValue2}
        status={{type: 'warning', message: 'Banana is out of season'}}
      />
      <XDSSelector
        label="Success status"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
        ]}
        value={value3}
        onChange={setValue3}
        status={{type: 'success'}}
      />
    </div>
  );
}
