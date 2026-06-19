// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer} from '@xds/core/Chat';
import {Button} from '@xds/core/Button';
import {DropdownMenu} from '@xds/core/DropdownMenu';
import {Icon} from '@xds/core/Icon';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {
  Cog6ToothIcon,
  MicrophoneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function ChatComposerFooterActions() {
  return (
    <Stack direction="vertical" gap={4} style={{width: '100%', maxWidth: 450}}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Model selector and settings dropdowns
        </Text>
        <ChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          footerActions={
            <>
              <DropdownMenu
                button={{
                  label: 'Auto',
                  variant: 'ghost',
                  size: 'md',
                  icon: <Icon icon={SparklesIcon} size="sm" />,
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
              <DropdownMenu
                button={{
                  label: 'Settings',
                  variant: 'ghost',
                  size: 'md',
                  icon: <Icon icon={Cog6ToothIcon} size="sm" />,
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
            <Button
              label="Microphone"
              variant="ghost"
              size="md"
              icon={<Icon icon={MicrophoneIcon} />}
              isIconOnly
            />
          }
        />
      </Stack>
    </Stack>
  );
}
