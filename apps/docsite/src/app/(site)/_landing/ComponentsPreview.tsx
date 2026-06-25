// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Search} from 'lucide-react';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    maxWidth: 360,
    marginInline: 'auto',
    // Decorative preview — never interactive.
    pointerEvents: 'none',
  },
  controlsRow: {
    rowGap: spacingVars['--spacing-3'],
  },
});

const buttonStyles = stylex.create({
  fill: {
    width: '100%',
  },
});

export function ComponentsPreview() {
  const [checked, setChecked] = useState(true);
  const [on, setOn] = useState(true);
  const [search, setSearch] = useState('');

  return (
    <VStack gap={4} align="stretch" xstyle={styles.root} inert>
      <HStack
        gap={2}
        hAlign="evenly"
        vAlign="center"
        wrap="wrap"
        xstyle={styles.controlsRow}>
        <Badge variant="orange" label="Badge" />
        <Badge variant="blue" label="Badge" />
        <RadioList
          label="Sample option"
          isLabelHidden
          size="md"
          value=""
          onChange={() => {}}>
          <RadioListItem label="" value="sample" />
        </RadioList>
        <CheckboxInput
          label="Sample checkbox"
          isLabelHidden
          size="md"
          value={checked}
          onChange={setChecked}
        />
        <Switch
          label="Sample switch"
          isLabelHidden
          value={on}
          onChange={setOn}
        />
      </HStack>

      <Grid columns={2} gap={3}>
        <Button
          variant="secondary"
          label="Secondary"
          xstyle={buttonStyles.fill}
        />
        <Button variant="primary" label="Primary" xstyle={buttonStyles.fill} />
      </Grid>

      <TextInput
        label="Search components"
        isLabelHidden
        placeholder="Search..."
        value={search}
        onChange={setSearch}
        startIcon={Search}
        hasClear
      />
    </VStack>
  );
}
