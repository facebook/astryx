'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';

export default function PaginationCarouselDots() {
  const [slideIndex, setSlideIndex] = useState(1);

  return (
    <XDSPagination
      page={slideIndex}
      onChange={setSlideIndex}
      totalPages={5}
      variant="dots"
    />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: PaginationCarouselDots,
};
