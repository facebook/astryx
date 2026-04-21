'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function ButtonWithIcon() {
  return (
    <XDSStack direction="horizontal" gap={3} vAlign="center">
      <XDSButton
        label="New item"
        variant="primary"
        icon={<XDSIcon icon={PlusIcon} />}
      />
      <XDSButton
        label="Edit"
        variant="secondary"
        icon={<XDSIcon icon={PencilSquareIcon} />}
      />
      <XDSButton
        label="Download"
        variant="ghost"
        icon={<XDSIcon icon={ArrowDownTrayIcon} />}
      />
      <XDSButton
        label="Delete"
        variant="destructive"
        icon={<XDSIcon icon={TrashIcon} />}
      />
    </XDSStack>
  );
}
