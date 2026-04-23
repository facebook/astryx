'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

const styles = stylex.create({
  root: {
    width: 320,
  },
});

export default function DateInputShowcase() {
  const [date, setDate] = useState<DateString | undefined>(undefined);

  return (
    <XDSStack direction="vertical" xstyle={styles.root}>
      <XDSDateInput
        label="Start date"
        placeholder="Select a date"
        value={date}
        onChange={setDate}
        hasClear
      />
    </XDSStack>
  );
}
