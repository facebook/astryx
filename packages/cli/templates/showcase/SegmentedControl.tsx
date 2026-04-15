'use client';

import {XDSSegmentedControl} from '@xds/core/SegmentedControl';

export default function SegmentedControlShowcase() {
  return <XDSSegmentedControl items={[{label: 'Tab 1', value: '1'}]} />;
}
