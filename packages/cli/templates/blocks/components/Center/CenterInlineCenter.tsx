'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/outline';

export default function CenterInlineCenter() {
  return (
    <XDSCard width={400}>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="body">
          Build passed{' '}
          <XDSCenter isInline>
            <XDSIcon icon={CheckCircleIcon} size="sm" color="positive" />
          </XDSCenter>{' '}
          — all 47 tests green.
        </XDSText>
        <XDSText type="body">
          Deploy failed{' '}
          <XDSCenter isInline>
            <XDSIcon icon={XCircleIcon} size="sm" color="negative" />
          </XDSCenter>{' '}
          — check the logs for details.
        </XDSText>
      </XDSStack>
    </XDSCard>
  );
}
