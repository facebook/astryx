// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';
import {BoldIcon, ItalicIcon, UnderlineIcon} from '@heroicons/react/24/outline';

export default function UseKeyboardHintHookUsage() {
  return (
    <Card style={{width: 420}}>
      <Toolbar
        label="Text formatting"
        dividers={['bottom']}
        startContent={
          <>
            <Button
              label="Bold"
              variant="ghost"
              icon={<Icon icon={BoldIcon} />}
              isIconOnly
            />
            <Button
              label="Italic"
              variant="ghost"
              icon={<Icon icon={ItalicIcon} />}
              isIconOnly
            />
            <Button
              label="Underline"
              variant="ghost"
              icon={<Icon icon={UnderlineIcon} />}
              isIconOnly
            />
          </>
        }
      />
      <Section>
        <VStack gap={1}>
          <Text type="body" weight="bold">
            Keyboard-friendly by default
          </Text>
          <Text type="supporting" color="secondary">
            Tab into the toolbar with your keyboard and Toolbar shows an
            ephemeral "← → to navigate" hint — powered by useKeyboardHint — so
            sighted keyboard users learn that arrows move within the group.
          </Text>
        </VStack>
      </Section>
    </Card>
  );
}
