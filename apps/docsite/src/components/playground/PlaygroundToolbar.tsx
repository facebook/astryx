// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSSelector} from '@xds/core/Selector';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSBadge} from '@xds/core/Badge';
import type {ContentType} from './contentTypeDetector';

const s = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    paddingBlock: 6,
    flexShrink: 0,
  },
});

const THEME_OPTIONS = [
  {value: 'default', label: 'Default'},
  {value: 'neutral', label: 'Neutral'},
  {value: 'daily', label: 'Daily'},
  {value: 'matcha', label: 'Matcha'},
];

const TYPE_LABELS: Record<ContentType, string> = {
  component: 'Component',
  template: 'Template',
  theme: 'Theme',
};

interface PlaygroundToolbarProps {
  previewReady: boolean;
  previewError: string | null;
  theme: string;
  onThemeChange: (theme: string) => void;
  onReset: () => void;
  onShare: () => void;
  contentType: ContentType;
}

export function PlaygroundToolbar({
  previewReady,
  previewError,
  theme,
  onThemeChange,
  onReset,
  onShare,
  contentType,
}: PlaygroundToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    onShare();
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [onShare]);

  return (
    <div {...stylex.props(s.root)}>
      <XDSHStack gap={8} align="center">
        <XDSStatusDot
          variant={
            previewError ? 'error' : previewReady ? 'success' : 'warning'
          }
          label={previewError ? 'Error' : previewReady ? 'Ready' : 'Loading'}
        />
        <XDSText color="secondary" type="supporting">
          {previewError ? 'Error' : previewReady ? 'Ready' : 'Loading\u2026'}
        </XDSText>
        <XDSBadge variant="neutral" label={TYPE_LABELS[contentType]} />
      </XDSHStack>
      <XDSHStack gap={4} align="center">
        <XDSSelector
          label="Theme"
          isLabelHidden
          options={THEME_OPTIONS}
          value={theme}
          onChange={onThemeChange}
          size="sm"
        />
        <XDSButton label="Reset" variant="ghost" size="sm" onClick={onReset} />
        <XDSButton
          label={copied ? '\u2713 Copied!' : 'Copy Link'}
          variant={copied ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleShare}
        />
      </XDSHStack>
    </div>
  );
}
