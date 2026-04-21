'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaWithValidation() {
  const [value, setValue] = useState('');
  return (
    <div style={{maxWidth: 400}}>
      <XDSTextArea
        label="Description"
        description="Provide a comprehensive description of your project"
        value={value}
        onChange={setValue}
        placeholder="Enter description..."
        isRequired
        status={
          value.length > 0 && value.length < 20
            ? {type: 'warning', message: 'Consider adding more detail'}
            : value.length >= 20
              ? {type: 'success', message: 'Description looks good!'}
              : undefined
        }
      />
    </div>
  );
}
