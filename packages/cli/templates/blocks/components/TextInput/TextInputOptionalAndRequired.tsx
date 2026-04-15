'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputOptionalAndRequired() {
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');

  return (
    <>
      <XDSTextInput label="Nickname" isOptional value={nickname} onChange={setNickname} />
      <XDSTextInput label="Username" isRequired value={username} onChange={setUsername} />
    </>
  );
}
