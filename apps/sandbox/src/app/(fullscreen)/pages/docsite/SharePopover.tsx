'use client';

import React from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSList, XDSListItem} from '@xds/core/List';
import {ClaudeIcon, VSCodeIcon, CursorAIIcon} from './docsite-icons';

export function SharePopover({
  cliCommand,
  position,
  onClose,
}: {
  cliCommand: string;
  position: {top: number; left: number};
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed' as const,
        left: position.left,
        top: position.top,
        zIndex: 100,
        width: 340,
        backgroundColor: 'var(--color-background-card, #fff)',
        borderRadius: 12,
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        padding: 20,
      }}>
      <XDSHeading level={3}>Add to your project</XDSHeading>
      <div style={{marginTop: 8}}>
        <XDSText type="body" color="secondary">
          Copy this snippet and paste it in your terminal to get started.
        </XDSText>
      </div>

      <div style={{marginTop: 12}}>
        <XDSCodeBlock code={cliCommand} language="bash" />
      </div>

      <div
        style={{
          height: 1,
          backgroundColor: 'var(--color-divider, #e0e0e0)',
          margin: '16px 0',
        }}
      />

      <div style={{marginBottom: 8}}>
        <XDSText type="supporting" weight="semibold" color="secondary">
          Open in...
        </XDSText>
      </div>
      <XDSList>
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
    </div>
  );
}
