'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSIcon} from '@xds/core/Icon';
import {FolderPlusIcon} from '@heroicons/react/24/outline';

export default function EmptyStateContainer() {
  return (
    <XDSCard>
      <XDSEmptyState
        icon={<XDSIcon icon={FolderPlusIcon} size="lg" />}
        title="No projects yet"
        description="Create your first project to start organizing your work. You can invite team members after."
        actions={
          <>
            <XDSButton label="Import" variant="secondary" />
            <XDSButton label="Create project" variant="primary" />
          </>
        }
      />
    </XDSCard>
  );
}
