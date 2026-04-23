'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';
import {XDSSection} from '@xds/core/Section';

const SAMPLE =
  'Design tokens give every surface a consistent look regardless of which team built it, ensuring cohesion across the product.';

const WRAPS = [
  {textWrap: 'wrap' as const, label: 'wrap'},
  {textWrap: 'nowrap' as const, label: 'nowrap'},
  {textWrap: 'balance' as const, label: 'balance'},
  {textWrap: 'pretty' as const, label: 'pretty'},
];

export default function TextWrap() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {WRAPS.map(({textWrap, label}) => (
        <XDSStack key={textWrap} direction="vertical" gap={1}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <div style={{width: 200, overflow: 'hidden'}}>
            <XDSSection padding={2} variant="wash">
              <XDSText type="body" textWrap={textWrap}>
                {SAMPLE}
              </XDSText>
            </XDSSection>
          </div>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
