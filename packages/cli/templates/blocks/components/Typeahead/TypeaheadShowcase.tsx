// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Typeahead} from '@xds/core/Typeahead';
import type {SearchableItem, SearchSource} from '@xds/core/Typeahead';

const fruits: SearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
  {id: '6', label: 'Fig'},
  {id: '7', label: 'Grape'},
  {id: '8', label: 'Honeydew'},
];

const fruitSource: SearchSource = {
  search: (query: string) =>
    fruits.filter(f => f.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => fruits.slice(0, 5),
};

export default function TypeaheadShowcase() {
  return (
    <div style={{width: 320}}>
      <Typeahead
        label="Fruit"
        placeholder="Search fruits..."
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />
    </div>
  );
}
