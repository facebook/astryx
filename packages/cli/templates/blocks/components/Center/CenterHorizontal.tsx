'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {
  PencilSquareIcon,
  TrashIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

export default function CenterHorizontal() {
  return (
    <XDSCard width={440}>
      <XDSStack direction="vertical" gap={4}>
        <XDSStack direction="horizontal" gap={2} hAlign="end">
          <XDSButton
            label="Edit"
            variant="ghost"
            size="sm"
            icon={<XDSIcon icon={PencilSquareIcon} />}
          />
          <XDSButton
            label="Share"
            variant="ghost"
            size="sm"
            icon={<XDSIcon icon={ShareIcon} />}
          />
          <XDSButton
            label="Delete"
            variant="destructive"
            size="sm"
            icon={<XDSIcon icon={TrashIcon} />}
          />
        </XDSStack>
        <XDSCenter axis="horizontal">
          <XDSStack direction="vertical" gap={1} hAlign="center">
            <XDSHeading level={2}>Q2 Performance Review</XDSHeading>
            <XDSText type="supporting" color="secondary">
              Updated 3 days ago by Alice Chen
            </XDSText>
          </XDSStack>
        </XDSCenter>
      </XDSStack>
    </XDSCard>
  );
}
