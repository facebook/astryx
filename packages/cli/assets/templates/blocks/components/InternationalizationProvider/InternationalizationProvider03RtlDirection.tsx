// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {VStack} from '@astryxdesign/core/Layout';
import {Pagination} from '@astryxdesign/core/Pagination';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

type TextDirection = 'ltr' | 'rtl';

export default function InternationalizationProviderRtlDirection() {
  const [textDirection, setTextDirection] = useState<TextDirection>('ltr');
  const [page, setPage] = useState(3);
  return (
    <InternationalizationProvider locale="en" dir={textDirection}>
      {/* `dir` on the VStack scopes text direction to this subtree — no extra
          wrapper needed. (VStack has no `direction` prop, so there's nothing to
          confuse with `dir` here.) */}
      <VStack
        gap={4}
        hAlign="center"
        dir={textDirection}
        style={{width: '100%'}}>
        <SegmentedControl
          label="Direction"
          value={textDirection}
          onChange={next => setTextDirection(next as TextDirection)}
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
      </VStack>
    </InternationalizationProvider>
  );
}
