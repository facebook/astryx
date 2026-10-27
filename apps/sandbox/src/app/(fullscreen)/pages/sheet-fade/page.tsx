// Copyright (c) Meta Platforms, Inc. and affiliates.
// LOCAL PROTOTYPE ONLY (evidence for the grab-bar inset). Not committed.
'use client';

import * as React from 'react';
import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Popover} from '@astryxdesign/core/Popover';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {TimeInput} from '@astryxdesign/core/TimeInput';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {Section} from '@astryxdesign/core/Section';

function Rows() {
  return (
    <VStack gap={2}>
      {Array.from({length: 30}, (_, i) => (
        <Text key={i}>{`Row ${i + 1}: Notifications from this project`}</Text>
      ))}
    </VStack>
  );
}

export default function SheetFadePage() {
  const which =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('which') ?? 'sheet'
      : 'sheet';
  const [isOpen, setIsOpen] = useState(true);
  const [time, setTime] = useState<string | undefined>('09:30');
  if (which === 'section') {
    return (
      <div style={{padding: 16}}>
        <BottomSheet label="Filters" isOpen={isOpen} onOpenChange={setIsOpen}>
          <Section>
            <Rows />
          </Section>
        </BottomSheet>
      </div>
    );
  }
  if (which === 'menu') {
    return (
      <div style={{padding: 16}}>
        <DropdownMenu
          button={{label: 'Actions'}}
          presentation="bottom-sheet"
          items={[
            {label: 'Edit', onClick: () => {}},
            {label: 'Duplicate', onClick: () => {}},
            {label: 'Share', onClick: () => {}},
            {label: 'Delete', onClick: () => {}},
          ]}
        />
      </div>
    );
  }
  if (which === 'time') {
    return (
      <div style={{padding: 16}}>
        <TimeInput
          label="Start time"
          presentation="bottom-sheet"
          value={time}
          onChange={setTime}
        />
      </div>
    );
  }
  if (which === 'popover') {
    return (
      <div style={{padding: 16}}>
        <Popover
          label="Filters"
          presentation="bottom-sheet"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          content={<Rows />}>
          <Button label="Filters">Filters</Button>
        </Popover>
      </div>
    );
  }
  return (
    <div style={{padding: 16}}>
      <Button label="Open" onClick={() => setIsOpen(true)}>
        Open
      </Button>
      <BottomSheet label="Filters" isOpen={isOpen} onOpenChange={setIsOpen}>
        <Rows />
      </BottomSheet>
    </div>
  );
}
