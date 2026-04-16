'use client';

import {XDSRadioList} from '@xds/core/RadioList';

export default function RadioListShowcase() {
  return <XDSRadioList label="Choice" items={[{label: 'A', value: 'a'}]} />;
}
