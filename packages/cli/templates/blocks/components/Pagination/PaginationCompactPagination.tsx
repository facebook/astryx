'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationCompactPagination() {
  const [page, setPage] = useState(1);
  return (
    <XDSPagination
      page={page}
      onChange={setPage}
      totalPages={10}
      variant="compact"
    />
  );
}
