// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {InputMask} from '@astryxdesign/lab';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof InputMask> = {
  title: 'Lab/InputMask',
  component: InputMask,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputMask>;

const PHONE = {pattern: '(###) ###-####'};

export const Masks: Story = {
  render: () => (
    <VStack gap={4}>
      <InputMask mask={PHONE} label="Phone number" />
      <InputMask mask={{pattern: '#####'}} label="ZIP code" />
      <InputMask mask={{pattern: '###-##-####'}} label="SSN" />
      <InputMask mask={{pattern: '#### #### #### ####'}} label="Card number" />
    </VStack>
  ),
};

export const PlaceholderAndHint: Story = {
  render: () => (
    <VStack gap={4}>
      <InputMask
        mask={{pattern: '###-###', placeholder: '•'}}
        label="Sort code"
        formatHint="Six digits, e.g. 123-456"
        defaultValue="12"
      />
      <InputMask
        mask={{pattern: '(+1) ### ### ####'}}
        label="Phone with country code"
      />
    </VStack>
  ),
};

export const ValidationAndClear: Story = {
  render: function ValidationStory() {
    const [value, setValue] = useState('55512');
    const incomplete = value.length > 0 && value.length < 10;
    return (
      <VStack gap={4}>
        <InputMask
          mask={PHONE}
          label="Phone number"
          value={value}
          onChange={setValue}
          hasClear
          status={
            incomplete
              ? {type: 'error', message: 'Enter all 10 digits'}
              : undefined
          }
        />
        <Text>Raw value: {value === '' ? '(empty)' : value}</Text>
      </VStack>
    );
  },
};

export const States: Story = {
  render: () => (
    <VStack gap={4}>
      <InputMask mask={PHONE} label="Disabled" value="5551234567" isDisabled />
      <InputMask
        mask={PHONE}
        label="Disabled with reason"
        value="5551234567"
        isDisabled
        disabledMessage="Verified numbers cannot be edited"
      />
      <InputMask
        mask={{pattern: '###-##-####'}}
        label="Read-only"
        value="123456789"
        isReadOnly
      />
      <InputMask
        mask={{pattern: '#### #### #### ####'}}
        label="Validating"
        value="4111111111111111"
        isLoading
      />
    </VStack>
  ),
};
