'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputBasic() {
  const [name, setName] = useState('');

  return (
    <XDSTextInput label="Name" value={name} onChange={setName} />
  );
}
