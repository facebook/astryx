'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaWithPlaceholderAndCustomRows() {
  const [notes, setNotes] = useState('');

  return (
    <XDSTextArea label="Notes" rows={5} value={notes} onChange={setNotes} placeholder="Enter your notes..." />
  );
}
