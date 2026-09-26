// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Typeahead, TypeaheadItem} from '@astryxdesign/core/Typeahead';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Center} from '@astryxdesign/core/Center';

interface PersonItem extends SearchableItem {
  auxiliaryData: {role: string};
}

const people: PersonItem[] = [
  {id: '1', label: 'Alice Johnson', auxiliaryData: {role: 'Engineer'}},
  {id: '2', label: 'Bob Smith', auxiliaryData: {role: 'Designer'}},
  {id: '3', label: 'Charlie Brown', auxiliaryData: {role: 'Product Manager'}},
  {id: '4', label: 'Diana Prince', auxiliaryData: {role: 'Data Scientist'}},
  {id: '5', label: 'Eve Davis', auxiliaryData: {role: 'QA Engineer'}},
];

const peopleSource: SearchSource<PersonItem> = {
  search: (query: string) =>
    people.filter(p => p.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => people.slice(0, 4),
};

export default function TypeaheadItemShowcase() {
  const [value, setValue] = useState<PersonItem | null>(null);

  return (
    <Center width={320}>
      <Typeahead
        label="Assignee"
        placeholder="Search people..."
        searchSource={peopleSource}
        value={value}
        onChange={setValue}
        renderItem={(item: PersonItem) => (
          <TypeaheadItem
            item={item}
            icon={<Avatar name={item.label} size="md" />}
            description={item.auxiliaryData.role}
          />
        )}
      />
    </Center>
  );
}
