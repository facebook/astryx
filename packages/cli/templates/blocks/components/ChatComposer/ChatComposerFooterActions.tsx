'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {MicrophoneIcon} from '@heroicons/react/24/outline';

export default function ChatComposerFooterActions() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Model selector and mic button
        </XDSText>
        <XDSChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          footerActions={
            <>
              <XDSButton label="GPT-4o" variant="ghost" size="md" />
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
    </XDSStack>
  );
}
