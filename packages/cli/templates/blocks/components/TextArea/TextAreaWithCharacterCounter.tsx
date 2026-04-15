'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaWithCharacterCounter() {
  const [summary, setSummary] = useState('');

  return (
    <XDSTextArea label="Summary" maxLength={280} value={summary} onChange={setSummary} />
  );
}
