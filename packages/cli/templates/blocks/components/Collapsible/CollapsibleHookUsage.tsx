// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useId} from 'react';
import {useXDSCollapsible} from '@xds/core/Collapsible';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function CollapsibleHookUsage() {
  const detailsId = useId();
  const disclosure = useXDSCollapsible({
    isCollapsible: {defaultIsOpen: true},
    value: 'release-notes',
  });

  return (
    <XDSCard width={360} padding={4}>
      <XDSVStack gap={3}>
        <XDSText type="body" weight="bold">
          Release checklist
        </XDSText>
        <XDSButton
          label={disclosure.isOpen ? 'Hide details' : 'Show details'}
          variant="secondary"
          aria-controls={detailsId}
          aria-expanded={disclosure.isOpen}
          onClick={disclosure.toggle}
        />
        {disclosure.isOpen && (
          <div
            id={detailsId}
            role="region"
            aria-label="Release checklist details">
            <XDSText type="body" color="secondary">
              Review docs, run visual checks, and confirm keyboard behavior
              before shipping the component update.
            </XDSText>
          </div>
        )}
      </XDSVStack>
    </XDSCard>
  );
}
