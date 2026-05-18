// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
  },
});

export default function PaginationVariants() {
  const [pagesPage, setPagesPage] = useState(3);
  const [countPage, setCountPage] = useState(2);
  const [compactPage, setCompactPage] = useState(5);
  const [dotsPage, setDotsPage] = useState(3);

  return (
    <XDSStack direction="vertical" gap={5} hAlign="center" xstyle={styles.root}>
      <XDSPagination
        page={dotsPage}
        onChange={setDotsPage}
        totalPages={8}
        variant="dots"
      />
      <XDSPagination
        page={compactPage}
        onChange={setCompactPage}
        totalPages={10}
        variant="compact"
      />
      <XDSPagination
        page={countPage}
        onChange={setCountPage}
        totalItems={200}
        pageSize={20}
        variant="count"
      />
      <XDSPagination
        page={pagesPage}
        onChange={setPagesPage}
        totalItems={200}
        pageSize={10}
        variant="pages"
      />
    </XDSStack>
  );
}
