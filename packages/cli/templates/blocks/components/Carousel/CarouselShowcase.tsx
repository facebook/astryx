'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 500,
  },
  card: {
    minWidth: 200,
  },
});

const ITEMS = [
  {title: 'Design', body: 'Create wireframes and prototypes.'},
  {title: 'Develop', body: 'Build components and pages.'},
  {title: 'Test', body: 'Write tests and fix bugs.'},
  {title: 'Deploy', body: 'Ship to production.'},
  {title: 'Monitor', body: 'Track performance and errors.'},
];

export default function CarouselShowcase() {
  return (
    <XDSCarousel
      gap={2}
      hasSnap
      aria-label="Workflow steps"
      xstyle={styles.root}>
      {ITEMS.map(item => (
        <XDSCard key={item.title} padding={3} xstyle={styles.card}>
          <XDSStack direction="vertical" gap={1}>
            <XDSHeading level={5}>{item.title}</XDSHeading>
            <XDSText type="supporting" color="secondary">
              {item.body}
            </XDSText>
          </XDSStack>
        </XDSCard>
      ))}
    </XDSCarousel>
  );
}
