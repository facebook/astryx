'use client';

import {useState} from 'react';
import {XDSCheckboxListItem} from '@xds/core/CheckboxList';
import {XDSList} from '@xds/core/List';

export default function CheckboxListStandaloneMode() {
  const [accepted, setAccepted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <XDSList>
      <XDSCheckboxListItem
        label="Accept terms"
        isChecked={accepted}
        onCheck={setAccepted}
      />
      <XDSCheckboxListItem
        label="Subscribe to newsletter"
        isChecked={subscribed}
        onCheck={setSubscribed}
      />
    </XDSList>
  );
}
