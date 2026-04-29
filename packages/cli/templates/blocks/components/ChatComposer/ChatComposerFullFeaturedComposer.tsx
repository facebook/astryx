'use client';

import {useState} from 'react';
import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  AtSymbolIcon,
  MicrophoneIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

export default function ChatComposerFullFeaturedComposer() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <XDSStack direction="vertical" gap={4}>
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
        drawer={
          <XDSChatComposerDrawer>
            <XDSToken label="design-spec.pdf" onRemove={() => {}} />
            <XDSToken label="requirements.docx" onRemove={() => {}} />
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
          <XDSProgressBar label="Context window" value={3} isLabelHidden />
        }
        footerActions={
          <>
            <XDSButton label="Auto" variant="ghost" size="md" />
            <XDSButton label="Settings" variant="ghost" size="md" />
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
