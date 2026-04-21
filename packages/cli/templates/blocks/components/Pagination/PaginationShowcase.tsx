import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationShowcase() {
  return (
    <XDSPagination
      page={1}
      onChange={() => {}}
      totalItems={100}
      pageSize={10}
    />
  );
}
