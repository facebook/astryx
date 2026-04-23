'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const styles = stylex.create({
  fixed: {width: 400},
});

const skills: XDSSearchableItem[] = [
  {id: '1', label: 'React'},
  {id: '2', label: 'TypeScript'},
  {id: '3', label: 'GraphQL'},
  {id: '4', label: 'Node.js'},
  {id: '5', label: 'Python'},
  {id: '6', label: 'Rust'},
  {id: '7', label: 'Go'},
  {id: '8', label: 'Swift'},
];

const skillSource: XDSSearchSource = {
  search: (query: string) =>
    skills.filter(s => s.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => skills,
};

const MAX_SKILLS = 3;

export default function TokenizerMaxEntries() {
  const [value, setValue] = useState<XDSSearchableItem[]>([
    skills[0],
    skills[1],
  ]);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="supporting" color="secondary">
        Limited to {MAX_SKILLS} selections — {MAX_SKILLS - value.length}{' '}
        remaining
      </XDSText>
      <XDSTokenizer
        label="Top Skills"
        placeholder="Search skills..."
        description={`Choose up to ${MAX_SKILLS} skills`}
        searchSource={skillSource}
        value={value}
        onChange={items => setValue(items)}
        maxEntries={MAX_SKILLS}
        xstyle={styles.fixed}
      />
    </XDSStack>
  );
}
