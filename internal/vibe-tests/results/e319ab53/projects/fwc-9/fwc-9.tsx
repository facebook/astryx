// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {DateInput} from '@astryxdesign/core/DateInput';
import {TimeInput} from '@astryxdesign/core/TimeInput';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

export default function MeetingScheduler() {
  const [date, setDate] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const duration = 30;

  const getEndTime = () => {
    if (!startTime) {return undefined;}
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md">
      <Heading level={2}>Schedule Meeting</Heading>
      <DateInput
        label="Meeting Date"
        value={date}
        onChange={setDate}
        min={new Date().toISOString().split('T')[0]}
      />
      <TimeInput
        label="Start Time"
        value={startTime}
        onChange={setStartTime}
        increment={15}
      />
      <Text type="supporting">
        Duration: {duration} minutes{startTime && ` (ends at ${getEndTime()})`}
      </Text>
      <Button
        label="Schedule Meeting"
        variant="primary"
        isDisabled={!date || !startTime}
      />
    </div>
  );
}
