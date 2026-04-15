'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationCursorBased() {
  const [page, setPage] = useState(1);

  return (
    <XDSPagination
      page={page}
      onChange={setPage}
      hasMore={page < 10}
    />
  );
}
