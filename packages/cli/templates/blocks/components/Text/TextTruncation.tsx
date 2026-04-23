'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';
import {XDSSection} from '@xds/core/Section';

const LONG_TEXT =
  'The design system provides a consistent set of typography tokens, spacing scales, and color palettes that ensure every surface in the product feels cohesive regardless of which team built it. Components inherit these tokens automatically so teams can build new features without manually matching fonts, colors, or spacing values across different surfaces and breakpoints.';

const LINES = [
  {maxLines: 1, label: '1 line'},
  {maxLines: 2, label: '2 lines'},
  {maxLines: 3, label: '3 lines'},
];

export default function TextTruncation() {
  return (
    <div style={{maxWidth: 480, overflow: 'hidden'}}>
      <XDSStack direction="vertical" gap={3}>
        {LINES.map(({maxLines, label}) => (
          <XDSStack key={maxLines} direction="vertical" gap={1}>
            <XDSText type="supporting" color="secondary">
              {label}
            </XDSText>
            <XDSSection padding={2} variant="wash">
              <XDSText type="body" maxLines={maxLines}>
                {LONG_TEXT}
              </XDSText>
            </XDSSection>
          </XDSStack>
        ))}
      </XDSStack>
    </div>
  );
}
