'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSIcon} from '@xds/core/Icon';
import {StarIcon} from '@heroicons/react/24/solid';
import * as stylex from '@stylexjs/stylex';

const REVIEWS = [
  {
    name: 'Jeannie Grant',
    date: 'June 01, 2025',
    stars: 5,
    quote:
      'A thorough report was done on our financial situation. Better deals were found and processed on our behalf, which took a lot of stress away.',
  },
  {
    name: 'Derval Russell',
    date: 'November 09, 2025',
    stars: 5,
    quote:
      'I have been a client for 8 years now and have always found the advice provided excellent. They take the time to explain things clearly.',
  },
  {
    name: 'Claire Dawson',
    date: 'October 15, 2025',
    stars: 5,
    quote:
      'Constantly professional and concise. Our mortgage process was smooth from start to finish thanks to their dedicated team.',
  },
  {
    name: 'Marcus Webb',
    date: 'September 22, 2025',
    stars: 4,
    quote:
      'Great service overall. The team was responsive and knowledgeable. Would definitely recommend to anyone looking for solid financial advice.',
  },
];

const styles = stylex.create({
  root: {
    maxWidth: 480,
    width: '100%',
  },
  pagination: {
    justifyContent: 'center',
    paddingTop: 4,
  },
});

function Stars({count}: {count: number}) {
  return (
    <XDSStack direction="horizontal" gap={0}>
      {Array.from({length: count}, (_, i) => (
        <XDSIcon key={i} icon={StarIcon} size="sm" color="warning" />
      ))}
    </XDSStack>
  );
}

export default function PaginationDotsCarousel() {
  const [page, setPage] = useState(1);
  const review = REVIEWS[page - 1];

  return (
    <XDSStack direction="vertical" gap={3} xstyle={styles.root}>
      <XDSCard padding={5}>
        <XDSStack direction="vertical" gap={3}>
          <Stars count={review.stars} />
          <XDSText type="body">{review.quote}</XDSText>
          <XDSStack
            direction="horizontal"
            gap={3}
            vAlign="center"
            hAlign="start">
            <XDSAvatar name={review.name} size="small" />
            <XDSStack direction="vertical" gap={0}>
              <XDSText type="supporting" weight="bold">
                {review.name}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {review.date}
              </XDSText>
            </XDSStack>
          </XDSStack>
        </XDSStack>
      </XDSCard>
      <XDSPagination
        page={page}
        onChange={setPage}
        totalPages={REVIEWS.length}
        variant="dots"
        xstyle={styles.pagination}
      />
    </XDSStack>
  );
}
