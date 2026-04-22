'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const TYPES = [
  {type: 'large' as const, label: 'Large text', sample: 'Large text for introductions and callouts'},
  {type: 'body' as const, label: 'Body text', sample: 'Body text for paragraphs and general content'},
  {type: 'label' as const, label: 'Label text', sample: 'Label text for form fields and section titles'},
  {type: 'supporting' as const, label: 'Supporting text', sample: 'Supporting text for captions and metadata'},
  {type: 'code' as const, label: 'Code text', sample: 'const theme = defineTheme({})'},
];

export default function TextTypes() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {TYPES.map(({type, label, sample}) => (
        <XDSStack key={type} direction="vertical" gap={0}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <XDSText type={type} display="block">
            {sample}
          </XDSText>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
