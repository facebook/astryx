// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function PopoverHookUsage() {
  const popover = useXDSPopover({dialogLabel: 'Quick actions'});

  return (
    <XDSCenter height={240}>
      <XDSButton
        label="Open actions"
        ref={popover.triggerRef}
        onClick={popover.toggle}
        {...popover.triggerProps}
      />
      {popover.render(
        <XDSCard width={220} padding={3} variant="transparent">
          <XDSVStack gap={2}>
            <XDSText type="body" weight="bold">
              Quick actions
            </XDSText>
            <XDSButton label="Create task" size="sm" />
            <XDSButton label="Share report" variant="secondary" size="sm" />
          </XDSVStack>
        </XDSCard>,
        {placement: 'below', alignment: 'center'},
      )}
    </XDSCenter>
  );
}
