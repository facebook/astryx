'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationCountDisplayWithPageSizeSelector() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <XDSPagination
      page={page}
      onChange={setPage}
      totalItems={200}
      variant="count"
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 50]}
      onPageSizeChange={setPageSize}
    />
  );
}
