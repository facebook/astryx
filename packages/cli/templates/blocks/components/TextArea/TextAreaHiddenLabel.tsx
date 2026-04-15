'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaHiddenLabel() {
  const [comments, setComments] = useState('');

  return (
    <XDSTextArea label="Comments" isLabelHidden value={comments} onChange={setComments} placeholder="Add a comment..." />
  );
}
