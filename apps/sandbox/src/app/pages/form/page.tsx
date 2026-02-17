'use client';

import {XDSVStack} from '@xds/core';
import {XDSHStack} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core';
import {XDSTextInput} from '@xds/core';
import {XDSCheckboxInput} from '@xds/core';
import {XDSSwitch} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSDivider} from '@xds/core';

export default function FormPage() {
  return (
    <XDSVStack gap="space4">
      <XDSHeading level={1}>Form Elements</XDSHeading>
      <XDSText type="body" color="secondary">
        Text inputs, checkboxes, switches, and form composition.
      </XDSText>

      <XDSDivider />

      <XDSVStack gap="space3">
        <XDSHeading level={3}>Text Inputs</XDSHeading>
        <XDSTextInput label="Full name" placeholder="Enter your name" />
        <XDSTextInput
          label="Email"
          placeholder="you@example.com"
          description="We'll never share your email."
        />
        <XDSTextInput
          label="Password"
          placeholder="Enter password"
          isRequired
        />
        <XDSTextInput
          label="Disabled input"
          placeholder="Cannot edit"
          isDisabled
        />
      </XDSVStack>

      <XDSDivider />

      <XDSVStack gap="space3">
        <XDSHeading level={3}>Checkboxes</XDSHeading>
        <XDSCheckboxInput label="Accept terms and conditions" />
        <XDSCheckboxInput
          label="Subscribe to newsletter"
          description="Get weekly updates about XDS."
        />
        <XDSCheckboxInput label="Disabled checkbox" isDisabled />
      </XDSVStack>

      <XDSDivider />

      <XDSVStack gap="space3">
        <XDSHeading level={3}>Switches</XDSHeading>
        <XDSSwitch label="Enable dark mode" />
        <XDSSwitch
          label="Email notifications"
          description="Receive email alerts for important updates."
        />
        <XDSSwitch label="Disabled switch" isDisabled />
      </XDSVStack>

      <XDSDivider />

      <XDSVStack gap="space3">
        <XDSHeading level={3}>Example Form</XDSHeading>
        <XDSTextInput label="Username" placeholder="Choose a username" isRequired />
        <XDSTextInput label="Bio" placeholder="Tell us about yourself" isOptional />
        <XDSCheckboxInput label="I agree to the terms of service" />
        <XDSHStack gap="space2">
          <XDSButton variant="primary" label="Submit" />
          <XDSButton variant="ghost" label="Cancel" />
        </XDSHStack>
      </XDSVStack>
    </XDSVStack>
  );
}
