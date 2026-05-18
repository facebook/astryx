// Copyright (c) Meta Platforms, Inc. and affiliates.

import {XDSDialog} from '@xds/core/Dialog';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import './report.css';

interface CodeModalProps {
  isOpen: boolean;
  onHide: () => void;
  promptId: string;
  target: 'xds' | 'baseline' | 'html';
  code: string;
}

export function CodeModal({
  isOpen,
  onHide,
  promptId,
  target,
  code,
}: CodeModalProps) {
  const targetLabel =
    target === 'xds' ? 'XDS' : target === 'baseline' ? 'Baseline' : 'HTML';
  const lineCount = code.split('\n').length;

  return (
    <XDSDialog
      isOpen={isOpen}
      onHide={onHide}
      purpose="info"
      width={800}
      aria-label={`${targetLabel} code for ${promptId}`}>
      <div className="report-codeModal-header">
        <XDSVStack gap={1}>
          <XDSHeading level={3}>
            {promptId} — {targetLabel}
          </XDSHeading>
          <XDSText type="supporting">{lineCount} lines</XDSText>
        </XDSVStack>
        <XDSButton
          variant="ghost"
          label="Close"
          tooltip="Close"
          icon={<XDSIcon icon="close" color="inherit" />}
          onClick={onHide}
        />
      </div>
      <div className="report-codeModal-content">
        <div className="report-codeModal-codeBlock">{code}</div>
      </div>
    </XDSDialog>
  );
}
