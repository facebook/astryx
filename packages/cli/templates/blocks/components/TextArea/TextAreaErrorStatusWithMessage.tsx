'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaErrorStatusWithMessage() {
  const [feedback, setFeedback] = useState('');

  return (
    <XDSTextArea
      label="Feedback"
      isRequired
      value={feedback}
      onChange={setFeedback}
      status={{type: 'error', message: 'Feedback is required'}}
    />
  );
}
