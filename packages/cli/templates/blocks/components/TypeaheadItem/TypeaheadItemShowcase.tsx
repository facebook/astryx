'use client';

import {useState} from 'react';
import {XDSTypeahead, XDSTypeaheadItem} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSCenter} from '@xds/core/Center';

interface PersonItem extends XDSSearchableItem {
  auxiliaryData: {role: string};
}

const people: PersonItem[] = [
  {id: '1', label: 'Alice Johnson', auxiliaryData: {role: 'Engineer'}},
  {id: '2', label: 'Bob Smith', auxiliaryData: {role: 'Designer'}},
  {id: '3', label: 'Charlie Brown', auxiliaryData: {role: 'Product Manager'}},
  {id: '4', label: 'Diana Prince', auxiliaryData: {role: 'Data Scientist'}},
  {id: '5', label: 'Eve Davis', auxiliaryData: {role: 'QA Engineer'}},
];

const peopleSource: XDSSearchSource<PersonItem> = {
  search: (query: string) =>
    people.filter(p => p.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => people.slice(0, 4),
};

export default function TypeaheadItemShowcase() {
  const [value, setValue] = useState<PersonItem | null>(null);

  return (
    <XDSCenter width={320}>
      <XDSTypeahead
        label="Assignee"
        placeholder="Search people..."
        searchSource={peopleSource}
        value={value}
        onChange={setValue}
        renderItem={(item: PersonItem) => (
          <XDSTypeaheadItem
            item={item}
            icon={<XDSAvatar name={item.label} size="small" />}
            description={item.auxiliaryData.role}
          />
        )}
      />
    </XDSCenter>
  );
}
