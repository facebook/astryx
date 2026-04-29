'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {PaperClipIcon} from '@heroicons/react/24/outline';

export default function ChatComposerComposerWithAttachments() {
  return (
    <XDSStack direction="vertical" gap={4} style={{width: '100%', maxWidth: 450}}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          File tokens with a context progress bar
        </XDSText>
        <XDSChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          drawer={
            <XDSChatComposerDrawer>
              <XDSToken label="quarterly-report.pdf" onRemove={() => {}} />
              <XDSToken label="revenue-data.csv" onRemove={() => {}} />
            </XDSChatComposerDrawer>
          }
          headerActions={
            <XDSButton
              label="Attach file"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon={PaperClipIcon} />}
              isIconOnly
            />
          }
          headerContext={
            <XDSProgressBar label="Context window" value={3} isLabelHidden />
          }
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Many attachments — drawer collapses automatically
        </XDSText>
        <XDSChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          drawer={
            <XDSChatComposerDrawer count={6}>
              <XDSToken label="feature-prd.docx" onRemove={() => {}} />
              <XDSToken label="2026-roadmap.pdf" onRemove={() => {}} />
              <XDSToken label="user-flow.fig" onRemove={() => {}} />
              <XDSToken label="launch-plan.docx" onRemove={() => {}} />
              <XDSToken label="user-feedback.csv" onRemove={() => {}} />
              <XDSToken label="analytics-kpis.csv" onRemove={() => {}} />
            </XDSChatComposerDrawer>
          }
        />
      </XDSStack>
    </XDSStack>
  );
}
