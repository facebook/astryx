'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatComposerAttachments() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          File attachments with context bar
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          drawer={
            <XDSChatComposerDrawer>
              <XDSToken label="report.pdf" onRemove={() => {}} />
              <XDSToken label="data.csv" onRemove={() => {}} />
            </XDSChatComposerDrawer>
          }
          headerContext={
            <XDSProgressBar label="Context window" value={3} isLabelHidden />
          }
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Many attachments with collapse
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          drawer={
            <XDSChatComposerDrawer count={6}>
              <XDSToken label="new_feature_prd.docx" onRemove={() => {}} />
              <XDSToken label="2026_roadmap.docx" onRemove={() => {}} />
              <XDSToken label="user_flow.pdf" onRemove={() => {}} />
              <XDSToken label="launch_plan.docx" onRemove={() => {}} />
              <XDSToken label="user_feedback.csv" onRemove={() => {}} />
              <XDSToken label="kpis.csv" onRemove={() => {}} />
            </XDSChatComposerDrawer>
          }
        />
      </XDSStack>
    </XDSStack>
  );
}
