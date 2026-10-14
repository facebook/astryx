// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const ACTIONS = [
  {label: 'Edit project', icon: PencilIcon},
  {label: 'Duplicate project', icon: DocumentDuplicateIcon},
  {label: 'Share project', icon: ShareIcon},
  {label: 'Archive project', icon: ArchiveBoxIcon},
] as const;

export default function DropdownMenuBottomSheet() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <VStack gap={3}>
      {/* The default adaptive presentation opens a bottom sheet on compact
          touch screens and an anchored popover everywhere else. */}
      <DropdownMenu
        button={{label: 'Project actions'}}
        items={ACTIONS.map(({label, icon}) => ({
          label,
          icon,
          onClick: () => setLastAction(label),
        }))}
      />
      {lastAction && (
        <Text type="supporting" color="secondary">
          Last action: {lastAction}
        </Text>
      )}
    </VStack>
  );
}
