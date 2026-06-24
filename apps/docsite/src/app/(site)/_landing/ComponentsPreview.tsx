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

// Live "sampler" composition for the home page's "Over N components"
// feature card. This replaces the former baked PNG
// (/feature-components.png) which could not adapt to dark mode — it
// stayed light on the dark surface. Rendering the real XDS components
// instead means the preview re-themes automatically via the same
// light-dark() tokens every other component uses, so it reads
// correctly in both light and dark.
//
// The composition mirrors the original screenshot, top to bottom:
//   1. two Badges (orange + blue) + a bare radio, checkbox, and switch
//   2. a Secondary and a Primary button
//   3. a search TextInput (leading search icon, clear button)
//
// Everything is decorative, so the controls carry hidden labels and
// fixed "checked"/"on"/"selected" states. They keep minimal local
// state so they remain genuine, interactive components (not static
// markup) — the preview still behaves like the real thing if poked.

const styles = stylex.create({
  // Outer frame. The card supplies the 40px inset padding around the
  // preview (innerPaddingImageInset), so this just stacks the three
  // rows with even spacing and centers them in the available space.
  // maxWidth keeps the sampler from stretching uncomfortably wide on
  // the desktop bento card while staying fluid on narrow screens.
  root: {
    width: '100%',
    maxWidth: 360,
    marginInline: 'auto',
  },
  // Row 1: badges + form controls, distributed evenly across the full
  // row width (hAlign="evenly" → space-evenly). The small gap is just a
  // min spacing for the wrap case; rowGap adds vertical spacing if the
  // row wraps on a very narrow card so nothing clips.
  controlsRow: {
    rowGap: spacingVars['--spacing-3'],
  },
});

// Full-width buttons so each fills its equal-width Grid cell and the
// pair reads as a balanced Secondary | Primary row like the reference.
// (Button sizes to content by default.)
const buttonStyles = stylex.create({
  fill: {
    width: '100%',
  },
});

export function ComponentsPreview() {
  // Decorative state — seeded to the "active" look shown in the
  // reference (checkbox checked, switch on). They stay interactive so
  // the sampler is a real, pokeable component rather than a static
  // mock.
  const [checked, setChecked] = useState(true);
  const [on, setOn] = useState(true);
  const [search, setSearch] = useState('');

  return (
    <VStack gap={4} align="stretch" xstyle={styles.root}>
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
          size="sm"
          value=""
          onChange={() => {}}>
          {/* Empty label keeps just the bare radio circle (unselected,
              since the group value never matches) to match the
              reference's label-less control trio. */}
          <RadioListItem label="" value="sample" />
        </RadioList>
        <CheckboxInput
          label="Sample checkbox"
          isLabelHidden
          size="sm"
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
