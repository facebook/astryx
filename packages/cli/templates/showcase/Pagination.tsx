'use client';

import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationShowcase() {
  return (
    <XDSPagination totalPages={10} currentPage={1} onPageChange={() => {}} />
  );
}
