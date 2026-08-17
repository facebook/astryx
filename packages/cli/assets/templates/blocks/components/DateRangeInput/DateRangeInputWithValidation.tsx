// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DateRangeInput} from '@astryxdesign/core/DateRangeInput';
import type {DateRange} from '@astryxdesign/core/DateRangeInput';
import {Stack} from '@astryxdesign/core/Layout';

export default function DateRangeInputWithValidation() {
  const [errorRange, setErrorRange] = useState<DateRange | null>({
    start: '2026-01-01',
    end: '2026-01-31',
  });
  const [warningRange, setWarningRange] = useState<DateRange | null>({
    start: '2026-06-01',
    end: '2026-06-30',
  });
  const [successRange, setSuccessRange] = useState<DateRange | null>({
    start: '2026-03-01',
    end: '2026-03-31',
  });

  return (
    <Stack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <DateRangeInput
        label="Booking period"
        value={errorRange}
        onChange={setErrorRange}
        status={{
          type: 'error',
          message: 'Selected dates are no longer available',
        }}
      />
      <DateRangeInput
        label="Preferred period"
        value={warningRange}
        onChange={setWarningRange}
        status={{
          type: 'warning',
          message: 'High demand — limited availability',
        }}
      />
      <DateRangeInput
        label="Confirmed period"
        value={successRange}
        onChange={setSuccessRange}
        status={{type: 'success', message: 'Dates confirmed and available'}}
      />
    </Stack>
  );
}
