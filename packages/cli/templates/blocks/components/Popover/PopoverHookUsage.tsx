// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {usePopover} from '@xds/core/Popover';
import {Button} from '@xds/core/Button';
import {Card} from '@xds/core/Card';
import {Center} from '@xds/core/Center';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function PopoverHookUsage() {
  const popover = usePopover({dialogLabel: 'Quick actions'});

  return (
    <Center height={240}>
      <Button
        label="Open actions"
        ref={popover.triggerRef}
        onClick={popover.toggle}
        {...popover.triggerProps}
      />
      {popover.render(
        <Card width={220} padding={3} variant="transparent">
          <VStack gap={2}>
            <Text type="body" weight="bold">
              Quick actions
            </Text>
            <Button label="Create task" size="sm" />
            <Button label="Share report" variant="secondary" size="sm" />
          </VStack>
        </Card>,
        {placement: 'below', alignment: 'center'},
      )}
    </Center>
  );
}
