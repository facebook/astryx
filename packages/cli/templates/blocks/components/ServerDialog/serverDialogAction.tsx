// Copyright (c) Meta Platforms, Inc. and affiliates.

'use server';

import {XDSDialogServer, XDSDialogCloseButton} from '@xds/core/ServerDialog';
import type {ClientProp} from '@xds/core/ServerDialog';
import {XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type UserDialogProps = {
  userId: string;
  onOpenChange: ClientProp<(isOpen: boolean) => void>;
};

export async function fetchUserDialog(props: UserDialogProps) {
  await new Promise(resolve => setTimeout(resolve, 800));

  const user = {
    name: `User ${props.userId}`,
    email: `user${props.userId}@example.com`,
    role: 'Engineer',
  };

  return (
    <XDSDialogServer isOpen onOpenChange={props.onOpenChange} width={400}>
      <XDSLayout
        header={
          <XDSDialogHeader
            title="User Details"
            subtitle={`User ${props.userId}`}
          />
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap={2}>
              <XDSText type="body" weight="bold">
                {user.name}
              </XDSText>
              <XDSText type="body">{user.email}</XDSText>
              <XDSText type="supporting" color="secondary">
                {user.role} — fetched and rendered on the server.
              </XDSText>
            </XDSVStack>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter>
            <XDSHStack gap={2} hAlign="end">
              <XDSDialogCloseButton label="Done" variant="primary" />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialogServer>
  );
}
