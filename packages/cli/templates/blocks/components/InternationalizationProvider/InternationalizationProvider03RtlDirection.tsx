// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Stack} from '@astryxdesign/core/Layout';
import {Pagination} from '@astryxdesign/core/Pagination';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

type Direction = 'ltr' | 'rtl';

export default function InternationalizationProviderRtlDirection() {
  const [direction, setDirection] = useState<Direction>('ltr');
  const [page, setPage] = useState(3);
  return (
    <InternationalizationProvider locale="en" dir={direction}>
      <div dir={direction} style={{width: '100%'}}>
        <Stack direction="vertical" gap={4} hAlign="center">
          <SegmentedControl
            label="Direction"
            value={direction}
            onChange={nextDirection => setDirection(nextDirection as Direction)}
            size="sm">
            <SegmentedControlItem value="ltr" label="LTR" />
            <SegmentedControlItem value="rtl" label="RTL" />
          </SegmentedControl>
          <Pagination
            page={page}
            onChange={setPage}
            totalItems={200}
            pageSize={10}
            variant="pages"
          />
        </Stack>
      </div>
    </InternationalizationProvider>
  );
}
