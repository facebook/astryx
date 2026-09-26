// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file MobileTokenizer.stories.tsx
 * @input Uses MobileTokenizer (Lab) with the sketch's Design/Eng data
 * @output Storybook try-it story at 390px: field -> manage -> add sheets
 * @position Lab story; stack layer 1 try-it surface
 */
import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {MobileTokenizer} from '@astryxdesign/lab';

const tags: SearchableItem[] = [
  {id: 'design', label: 'Design'},
  {id: 'eng', label: 'Eng'},
  {id: 'engineer', label: 'Engineer'},
  {id: 'energizer', label: 'Energizer'},
];
const source: SearchSource = {
  search: (q: string) =>
    tags.filter(t => t.label.toLowerCase().includes(q.toLowerCase())),
  bootstrap: () => tags,
};

const meta: Meta<typeof MobileTokenizer> = {
  title: 'Lab/MobileTokenizer',
  component: MobileTokenizer,
};
export default meta;
type Story = StoryObj<typeof MobileTokenizer>;

export const TouchFlow: Story = {
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([tags[0], tags[1]]);
    return (
      <div style={{width: 350}}>
        <MobileTokenizer
          label="Tags"
          searchSource={source}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Add tags"
          debounceMs={0}
        />
      </div>
    );
  },
  name: 'Touch flow (sketch: manage + stacked add, bottom filter)',
};
