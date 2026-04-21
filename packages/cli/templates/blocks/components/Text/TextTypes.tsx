'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const TYPES = [
  {type: 'large' as const, sample: 'Large text for introductions and callouts'},
  {type: 'body' as const, sample: 'Body text for paragraphs and general content'},
  {type: 'label' as const, sample: 'Label text for form fields and section titles'},
  {type: 'supporting' as const, sample: 'Supporting text for captions and metadata'},
  {type: 'code' as const, sample: 'const theme = defineTheme({})'},
];

export default function TextTypes() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {TYPES.map(({type, sample}) => (
        <XDSStack key={type} direction="vertical" gap={0}>
          <XDSText type="supporting" color="secondary">
            {type}
          </XDSText>
          <XDSText type={type} display="block">
            {sample}
          </XDSText>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
