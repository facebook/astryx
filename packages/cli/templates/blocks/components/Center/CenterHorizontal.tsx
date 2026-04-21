'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {XDSIconButton} from '@xds/core/IconButton';

export default function CenterHorizontal() {
  return (
    <XDSCard width={440} padding={0}>
      <XDSStack direction="horizontal" gap={2} vAlign="center">
        <XDSIconButton
          label="Back"
          icon={<XDSIcon icon={ArrowLeftIcon} />}
          variant="ghost"
          size="sm"
        />
        <XDSCenter axis="horizontal">
          <XDSText type="body" weight="bold">
            Q2 Performance Review
          </XDSText>
        </XDSCenter>
        <XDSIconButton
          label="More options"
          icon={<XDSIcon icon={EllipsisHorizontalIcon} />}
          variant="ghost"
          size="sm"
        />
      </XDSStack>
    </XDSCard>
  );
}
