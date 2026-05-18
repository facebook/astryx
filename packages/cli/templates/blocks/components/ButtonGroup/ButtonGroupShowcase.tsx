// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSButtonGroup} from '@xds/core/ButtonGroup';
import {XDSButton} from '@xds/core/Button';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSIcon} from '@xds/core/Icon';
import {
  ClipboardDocumentIcon,
  ScissorsIcon,
  ClipboardIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function ButtonGroupShowcase() {
  return (
    <XDSStack direction="horizontal" gap={6} vAlign="center">
      <XDSButtonGroup label="Clipboard actions">
        <XDSButton
          label="Copy"
          icon={<XDSIcon icon={ClipboardDocumentIcon} />}
        />
        <XDSButton label="Cut" icon={<XDSIcon icon={ScissorsIcon} />} />
        <XDSButton label="Paste" icon={<XDSIcon icon={ClipboardIcon} />} />
      </XDSButtonGroup>
      <XDSButtonGroup label="Save options">
        <XDSButton label="Save" variant="primary" />
        <XDSIconButton
          label="Save options"
          variant="primary"
          icon={<XDSIcon icon={ChevronDownIcon} />}
        />
      </XDSButtonGroup>
    </XDSStack>
  );
}
