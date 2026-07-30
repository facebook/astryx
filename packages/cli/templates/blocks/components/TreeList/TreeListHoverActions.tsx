// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@astryxdesign/core/TreeList';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {TrashIcon} from '@heroicons/react/24/outline';

const noop = () => {};

/**
 * `endContentReveal="hover"` keeps secondary row actions out of sight until a
 * row is hovered or focused — so the tree reads clean at rest, and the delete
 * action is still reachable by keyboard (it reveals on focus) and on touch
 * (it stays visible there).
 */
export default function TreeListHoverActions() {
  const deleteButton = (name: string) => (
    <Button
      label={`Delete ${name}`}
      variant="ghost"
      size="sm"
      icon={<Icon icon={TrashIcon} />}
      isIconOnly
      onClick={noop}
    />
  );

  return (
    <TreeList
      endContentReveal="hover"
      items={[
        {
          id: 'documents',
          label: 'Documents',
          isExpanded: true,
          children: [
            {
              id: 'report',
              label: 'report.pdf',
              onClick: noop,
              endContent: deleteButton('report.pdf'),
            },
            {
              id: 'notes',
              label: 'notes.txt',
              onClick: noop,
              endContent: deleteButton('notes.txt'),
            },
          ],
        },
        {
          id: 'archive',
          label: 'archive.zip',
          onClick: noop,
          endContent: deleteButton('archive.zip'),
        },
      ]}
    />
  );
}
