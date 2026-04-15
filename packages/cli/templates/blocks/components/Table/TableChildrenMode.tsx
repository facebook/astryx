'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSHStack} from '@xds/core/Layout';
import {XDSTable, XDSTableCell, XDSTableRow} from '@xds/core/Table';
import {XDSText} from '@xds/core/Text';

export default function TableChildrenMode() {
  return (
    <XDSTable density="balanced" dividers="rows" isStriped hasHover>
      <XDSTableRow>
        <XDSTableCell>
          <XDSHStack gap={2} vAlign="center">
            <XDSAvatar name="Alice" size="small" />
            <XDSText type="body" weight="semibold">Alice</XDSText>
          </XDSHStack>
        </XDSTableCell>
        <XDSTableCell>
          <XDSBadge variant="success" label="Active" />
        </XDSTableCell>
      </XDSTableRow>
    </XDSTable>
  );
}
