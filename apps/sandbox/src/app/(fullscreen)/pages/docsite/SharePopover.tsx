'use client';

import React from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSStack} from '@xds/core/Layout';
import {ClaudeIcon, VSCodeIcon, CursorAIIcon} from './docsite-icons';

export function SharePopoverContent({
  cliCommand,
  onClose,
}: {
  cliCommand: string;
  onClose: () => void;
}) {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={0}>
        <XDSHeading level={3}>Add to your project</XDSHeading>
        <XDSText type="body" color="secondary">
          Copy this snippet and paste it in your terminal to get started.
        </XDSText>
      </XDSStack>

      <XDSCard padding={0}>
        <XDSCodeBlock code={cliCommand} language="bash" />
      </XDSCard>

      <XDSText type="label" color="secondary">
        Or open in
      </XDSText>
      <XDSList style={{margin: '-8px'}}>
        <XDSListItem
          label="Claude Code"
          startContent={
            <ClaudeIcon style={{width: 18, height: 18, flexShrink: 0}} />
          }
          onClick={onClose}
        />
        <XDSListItem
          label="VSCode"
          startContent={
            <VSCodeIcon style={{width: 18, height: 18, flexShrink: 0}} />
          }
          onClick={onClose}
        />
        <XDSListItem
          label="Cursor"
          startContent={
            <CursorAIIcon style={{width: 18, height: 18, flexShrink: 0}} />
          }
          onClick={onClose}
        />
      </XDSList>
    </XDSStack>
  );
}
