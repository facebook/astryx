// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ChatComposer, ChatComposerDrawer} from '@astryxdesign/core/Chat';
import {List, ListItem} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Stack} from '@astryxdesign/core/Layout';

const options = [
  {key: 'A', label: 'Yes'},
  {key: 'B', label: 'Yes, and don\u2019t ask again for `git add` commands'},
  {key: 'C', label: 'No, and tell me what to do differently'},
];

export default function ChatComposerDrawerFeedback() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Stack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <ChatComposer
        onSubmit={value => {
          console.log('Submit:', value, '| Answer:', selected);
        }}
        drawer={
          <ChatComposerDrawer count={1} label="User feedback requested">
            <Stack direction="vertical" gap={1} width="100%">
              <List>
                <ListItem
                  label={
                    <Text weight="bold">Do you want to proceed?</Text>
                  }
                />
                {options.map(opt => (
                  <ListItem
                    key={opt.key}
                    label={opt.label}
                    startContent={
                      <Badge
                        variant={selected === opt.key ? 'info' : 'neutral'}
                        label={opt.key}
                      />
                    }
                    isSelected={selected === opt.key}
                    onClick={() => setSelected(opt.key)}
                  />
                ))}
              </List>
            </Stack>
          </ChatComposerDrawer>
        }
      />
    </Stack>
  );
}
