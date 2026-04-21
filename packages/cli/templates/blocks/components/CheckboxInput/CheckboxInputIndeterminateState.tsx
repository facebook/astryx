'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

const allItems = ['email', 'sms', 'push', 'slack'];

export default function CheckboxInputIndeterminateState() {
  const [selected, setSelected] = useState<string[]>(['email', 'push']);

  const allChecked = allItems.every(item => selected.includes(item));
  const noneChecked = selected.length === 0;
  const selectAllState = allChecked
    ? true
    : noneChecked
      ? false
      : ('indeterminate' as const);

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? [...allItems] : []);
  };

  return (
    <XDSCheckboxList label="Notifications" hasDividers>
      <XDSCheckboxListItem
        label="Select all"
        isChecked={selectAllState}
        onCheck={handleSelectAll}
      />
      <XDSCheckboxListItem
        label="Email"
        isChecked={selected.includes('email')}
        onCheck={checked =>
          setSelected(prev =>
            checked ? [...prev, 'email'] : prev.filter(v => v !== 'email'),
          )
        }
      />
      <XDSCheckboxListItem
        label="SMS"
        isChecked={selected.includes('sms')}
        onCheck={checked =>
          setSelected(prev =>
            checked ? [...prev, 'sms'] : prev.filter(v => v !== 'sms'),
          )
        }
      />
      <XDSCheckboxListItem
        label="Push"
        isChecked={selected.includes('push')}
        onCheck={checked =>
          setSelected(prev =>
            checked ? [...prev, 'push'] : prev.filter(v => v !== 'push'),
          )
        }
      />
      <XDSCheckboxListItem
        label="Slack"
        isChecked={selected.includes('slack')}
        onCheck={checked =>
          setSelected(prev =>
            checked ? [...prev, 'slack'] : prev.filter(v => v !== 'slack'),
          )
        }
      />
    </XDSCheckboxList>
  );
}
