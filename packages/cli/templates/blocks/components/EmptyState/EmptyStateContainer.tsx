// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {FolderPlusIcon} from '@heroicons/react/24/outline';

export default function EmptyStateContainer() {
  return (
    <Card>
      <EmptyState
        icon={<Icon icon={FolderPlusIcon} size="lg" />}
        title="No projects yet"
        description="Create your first project to start organizing your work. You can invite team members after."
        actions={
          <>
            <Button label="Import" variant="secondary" />
            <Button label="Create project" variant="primary" />
          </>
        }
      />
    </Card>
  );
}
