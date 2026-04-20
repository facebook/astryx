'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';

export default function DotsPagination() {
  const [page, setPage] = useState(1);
  return (
    <XDSPagination
      page={page}
      onChange={setPage}
      totalPages={8}
      variant="dots"
    />
  );
}
