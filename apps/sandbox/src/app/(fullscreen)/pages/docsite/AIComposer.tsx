'use client';

import React, {useState} from 'react';
import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {GridIcon, PaletteIcon} from './docsite-icons';

export type ComposerMode = 'template' | 'theme';

const PLACEHOLDER: Record<ComposerMode, string> = {
  template: 'What should we build?',
  theme: 'Describe your brand or style...',
};

const MODE_ICON: Record<ComposerMode, React.ReactNode> = {
  template: <GridIcon width={16} height={16} />,
  theme: <PaletteIcon width={16} height={16} />,
};

export function AIComposer({
  mode,
  onModeChange,
  onThemeMode,
}: {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  onThemeMode?: () => void;
}) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (mode === 'theme' && onThemeMode) {
      onThemeMode();
    }
    setPrompt('');
  };

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
          onSubmit={handleSubmit}
          value={prompt}
          onChange={setPrompt}
          placeholder={PLACEHOLDER[mode]}
          footerActions={
            <XDSDropdownMenu
              button={{
                label: mode === 'template' ? 'Template' : 'Theme',
                icon: MODE_ICON[mode],
                variant: 'ghost',
                size: 'sm',
              }}
              items={[
                {
                  label: 'Template',
                  icon: GridIcon,
                  onClick: () => onModeChange('template'),
                },
                {
                  label: 'Theme',
                  icon: PaletteIcon,
                  onClick: () => onModeChange('theme'),
                },
              ]}
            />
          }
          input={<XDSChatComposerInput placeholder={PLACEHOLDER[mode]} />}
        />
      </div>
    </>
  );
}
