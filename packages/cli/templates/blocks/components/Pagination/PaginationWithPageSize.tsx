'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationWithPageSize() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <XDSPagination
      page={page}
      onChange={setPage}
      totalItems={200}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      pageSizeOptions={[10, 20, 50]}
      variant="count"
    />
  );
}
