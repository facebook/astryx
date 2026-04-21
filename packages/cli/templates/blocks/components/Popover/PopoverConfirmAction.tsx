'use client';

import {useState} from 'react';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function PopoverConfirmAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSPopover
      placement="below"
      label="Confirm deletion"
      width={300}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      content={
        <XDSVStack gap={3}>
          <XDSHeading level={4}>
            Delete project?
          </XDSHeading>
          <XDSText type="body">
            This will permanently delete the project and all its data. This
            action cannot be undone.
          </XDSText>
          <XDSHStack gap={2} hAlign="end">
            <XDSButton
              label="Delete"
              variant="destructive"
              onClick={() => setIsOpen(false)}>
              Delete
            </XDSButton>
            <XDSButton
              label="Cancel"
              variant="ghost"
              onClick={() => setIsOpen(false)}>
              Cancel
            </XDSButton>
          </XDSHStack>
        </XDSVStack>
      }>
      <XDSButton label="Delete project" variant="destructive">
        Delete project
      </XDSButton>
    </XDSPopover>
  );
}
