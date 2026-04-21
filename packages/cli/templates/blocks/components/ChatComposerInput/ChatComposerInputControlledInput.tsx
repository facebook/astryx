'use client';

import {useState} from 'react';
import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';

export default function ChatComposerInputControlledInput() {
  const [value, setValue] = useState('');
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <XDSChatComposer
        onSubmit={() => setValue('')}
        value={value}
        onChange={setValue}
        input={
          <XDSChatComposerInput
            value={value}
            onChange={setValue}
            placeholder="Type a message..."
          />
        }
      />
      <div style={{fontSize: 12, fontFamily: 'monospace', color: '#888'}}>
        Value: {JSON.stringify(value)}
      </div>
    </div>
  );
}
