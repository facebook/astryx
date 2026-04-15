'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaBasic() {
  const [description, setDescription] = useState('');

  return (
    <XDSTextArea label="Description" value={description} onChange={setDescription} />
  );
}
