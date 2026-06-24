// Copyright (c) Meta Platforms, Inc. and affiliates.

import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

export default function RadioListShowcase() {
  return (
    <RadioList label="Notification preference" value="" onChange={() => {}}>
      <RadioListItem label="Email" value="email" />
      <RadioListItem label="SMS" value="sms" />
      <RadioListItem label="Push notification" value="push" />
    </RadioList>
  );
}
