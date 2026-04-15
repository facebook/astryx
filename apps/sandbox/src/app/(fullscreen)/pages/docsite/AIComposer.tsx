'use client';

import React, {useState} from 'react';
import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';

export function AIComposer() {
  const [prompt, setPrompt] = useState('');

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background:
            'linear-gradient(to bottom, transparent, var(--color-background-surface, white))',
          pointerEvents: 'none',
          zIndex: 99,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 680,
          maxWidth: 'calc(100% - 48px)',
          zIndex: 100,
        }}>
        <XDSChatComposer
          onSubmit={() => setPrompt('')}
          value={prompt}
          onChange={setPrompt}
          placeholder="What should we build?"
          input={<XDSChatComposerInput placeholder="What should we build?" />}
        />
      </div>
    </>
  );
}
