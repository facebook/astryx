// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  Cog6ToothIcon,
  MicrophoneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function ChatComposerFooterActions() {
  return (
    <XDSStack direction="vertical" gap={4} style={{width: '100%', maxWidth: 450}}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Model selector and settings dropdowns
        </XDSText>
        <XDSChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          footerActions={
            <>
              <XDSDropdownMenu
                button={{
                  label: 'Auto',
                  variant: 'ghost',
                  size: 'md',
                  icon: <XDSIcon icon={SparklesIcon} size="sm" />,
                  children: 'Auto',
                }}
                menuWidth={200}
                items={[
                  {label: 'Auto', onClick: () => {}},
                  {label: 'Model A', onClick: () => {}},
                  {label: 'Model B', onClick: () => {}},
                  {label: 'Model C', onClick: () => {}},
                ]}
              />
              <XDSDropdownMenu
                button={{
                  label: 'Settings',
                  variant: 'ghost',
                  size: 'md',
                  icon: <XDSIcon icon={Cog6ToothIcon} size="sm" />,
                  children: 'Settings',
                }}
                menuWidth={200}
                items={[
                  {label: 'Preferences', onClick: () => {}},
                  {label: 'Keyboard shortcuts', onClick: () => {}},
                  {label: 'About', onClick: () => {}},
                ]}
              />
            </>
          }
          sendActions={
            <XDSButton
              label="Microphone"
              variant="ghost"
              size="md"
              icon={<XDSIcon icon={MicrophoneIcon} />}
              isIconOnly
            />
          }
        />
      </XDSStack>
    </XDSStack>
  );
}
