// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';

const options = [
  {key: 'A', label: 'Yes'},
  {key: 'B', label: 'Yes, and don\u2019t ask again for `git add` commands'},
  {key: 'C', label: 'No, and tell me what to do differently'},
];

export default function ChatComposerDrawerFeedback() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <XDSStack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={value => {
          console.log('Submit:', value, '| Answer:', selected);
        }}
        drawer={
          <XDSChatComposerDrawer count={1} label="User feedback requested">
            <XDSStack direction="vertical" gap={1} width="100%">
              <XDSList>
                <XDSListItem
                  label={
                    <XDSText weight="bold">Do you want to proceed?</XDSText>
                  }
                />
                {options.map(opt => (
                  <XDSListItem
                    key={opt.key}
                    label={opt.label}
                    startContent={
                      <XDSBadge
                        variant={selected === opt.key ? 'info' : 'neutral'}
                        label={opt.key}
                      />
                    }
                    isSelected={selected === opt.key}
                    onClick={() => setSelected(opt.key)}
                  />
                ))}
              </XDSList>
            </XDSStack>
          </XDSChatComposerDrawer>
        }
      />
    </XDSStack>
  );
}
