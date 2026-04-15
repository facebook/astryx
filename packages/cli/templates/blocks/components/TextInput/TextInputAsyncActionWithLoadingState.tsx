'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

const checkAvailability = async (_value: string) => true;

export default function TextInputAsyncActionWithLoadingState() {
  const [username, setUsername] = useState('');

  return (
    <XDSTextInput
      label="Username"
      value={username}
      onChange={setUsername}
      onChangeAction={async (value) => {
        await checkAvailability(value);
      }}
    />
  );
}
