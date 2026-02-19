'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSDivider} from '@xds/core';

const styles = stylex.create({
  container: {
    maxWidth: 480,
  },
});

export default function FormPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap="space6">
        <XDSHeading level={1}>Form Controls</XDSHeading>

        <XDSVStack gap="space3">
          <XDSHeading level={2}>Text Inputs</XDSHeading>
          <XDSTextInput label="Name" placeholder="Enter your name" />
          <XDSTextInput
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap="space3">
          <XDSHeading level={2}>Checkboxes</XDSHeading>
          <XDSCheckboxInput label="Enable notifications" />
          <XDSCheckboxInput label="Subscribe to updates" />
          <XDSCheckboxInput label="Disabled option" isDisabled />
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
