'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';
import {PencilSquareIcon} from '@heroicons/react/24/outline';

export default function TextAreaWithIcon() {
  const [value, setValue] = useState('');

  return (
    <div style={{width: 400}}>
      <XDSTextArea
        label="Meeting notes"
        description="Capture key decisions and action items."
        value={value}
        onChange={setValue}
        placeholder="What was discussed?"
        startIcon={PencilSquareIcon}
      />
    </div>
  );
}
