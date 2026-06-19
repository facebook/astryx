// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatComposerInput,
} from '@xds/core/Chat';
import {Token} from '@xds/core/Token';
import {Button} from '@xds/core/Button';
import {DropdownMenu} from '@xds/core/DropdownMenu';
import {Icon} from '@xds/core/Icon';
import {ProgressBar} from '@xds/core/ProgressBar';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {
  AtSymbolIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
  PaperClipIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function ChatComposerFullFeatured() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <Stack
      direction="vertical"
      gap={4}
      style={{width: '100%', maxWidth: 450}}>
      <Text type="supporting" color="secondary">
        All slots populated
      </Text>
      <ChatComposer
        onSubmit={value => {
          console.log('Sent:', value);
          setIsStreaming(true);
          setTimeout(() => setIsStreaming(false), 3000);
        }}
        isStopShown={isStreaming}
        onStop={() => setIsStreaming(false)}
        placeholder="Ask me anything..."
        input={<ChatComposerInput style={{minHeight: 44}} />}
        drawer={
          <ChatComposerDrawer count={5}>
            <Token label="design-spec.pdf" onRemove={() => {}} />
            <Token label="requirements.docx" onRemove={() => {}} />
            <Token label="wireframes.fig" onRemove={() => {}} />
            <Token label="api-spec.yaml" onRemove={() => {}} />
            <Token label="user-research.csv" onRemove={() => {}} />
          </ChatComposerDrawer>
        }
        headerActions={
          <>
            <Button
              label="Mention"
              variant="ghost"
              size="sm"
              icon={<Icon icon={AtSymbolIcon} />}
              isIconOnly
            />
            <Button
              label="Attach file"
              variant="ghost"
              size="sm"
              icon={<Icon icon={PaperClipIcon} />}
              isIconOnly
            />
          </>
        }
        headerContext={
          <ProgressBar label="Context window" value={50} isLabelHidden />
        }
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
  );
}
