'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const LEVELS = [
  {level: 1 as const, text: 'Heading 1 — Page title'},
  {level: 2 as const, text: 'Heading 2 — Section title'},
  {level: 3 as const, text: 'Heading 3 — Subsection'},
  {level: 4 as const, text: 'Heading 4 — Group title'},
  {level: 5 as const, text: 'Heading 5 — Detail label'},
  {level: 6 as const, text: 'Heading 6 — Fine print heading'},
];

export default function TextHeadingLevels() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {LEVELS.map(({level, text}) => (
        <XDSStack key={level} direction="vertical" gap={0}>
          <XDSText type="supporting" color="secondary">
            h{level}
          </XDSText>
          <XDSHeading level={level}>{text}</XDSHeading>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
