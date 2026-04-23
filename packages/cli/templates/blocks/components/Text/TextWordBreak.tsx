'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';
import {XDSSection} from '@xds/core/Section';

const LONG_WORD = 'Supercalifragilisticexpialidocious_DesignTokensAreThemeable';

const BREAKS = [
  {wordBreak: 'break-word' as const, label: 'break-word'},
  {wordBreak: 'break-all' as const, label: 'break-all'},
];

export default function TextWordBreak() {
  return (
    <XDSStack direction="horizontal" gap={3}>
      {BREAKS.map(({wordBreak, label}) => (
        <XDSStack key={wordBreak} direction="vertical" gap={1}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <div style={{width: 150}}>
            <XDSSection padding={2} variant="wash">
              <XDSText type="body" maxLines={2} wordBreak={wordBreak}>
                {LONG_WORD}
              </XDSText>
            </XDSSection>
          </div>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
