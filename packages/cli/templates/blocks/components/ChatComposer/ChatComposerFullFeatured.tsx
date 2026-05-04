'use client';

import {useState} from 'react';
import {
  XDSChatComposer,
  XDSChatComposerDrawer,
  XDSChatComposerInput,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSIcon} from '@xds/core/Icon';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
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
    <XDSStack
      direction="vertical"
      gap={4}
      style={{width: '100%', maxWidth: 450}}>
      <XDSText type="supporting" color="secondary">
        All slots populated
      </XDSText>
      <XDSChatComposer
        onSubmit={value => {
          console.log('Sent:', value);
          setIsStreaming(true);
          setTimeout(() => setIsStreaming(false), 3000);
        }}
        isStreaming={isStreaming}
        onStop={() => setIsStreaming(false)}
        placeholder="Ask me anything..."
        input={<XDSChatComposerInput style={{minHeight: 44}} />}
        drawer={
          <XDSChatComposerDrawer count={5}>
            <XDSToken label="design-spec.pdf" onRemove={() => {}} />
            <XDSToken label="requirements.docx" onRemove={() => {}} />
            <XDSToken label="wireframes.fig" onRemove={() => {}} />
            <XDSToken label="api-spec.yaml" onRemove={() => {}} />
            <XDSToken label="user-research.csv" onRemove={() => {}} />
          </XDSChatComposerDrawer>
        }
        headerActions={
          <>
            <XDSButton
              label="Mention"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon={AtSymbolIcon} />}
              isIconOnly
            />
            <XDSButton
              label="Attach file"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon={PaperClipIcon} />}
              isIconOnly
            />
          </>
        }
        headerContext={
          <XDSProgressBar label="Context window" value={50} isLabelHidden />
        }
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
  );
}
