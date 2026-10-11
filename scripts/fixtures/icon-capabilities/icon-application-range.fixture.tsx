// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-application-range.fixture.tsx
 * @input A separate application augmentation backed by a numeric weight range
 * @output Numeric Icon requests and parameterized source authoring without named admission
 * @position Independent source/emitted consumer program, isolated from exact weights
 */
import {
  Icon,
  defineAdaptiveIcon,
  defineIconCapabilities,
  type IconRequest,
  type IconWeight,
  type ParameterizedIconVersion,
} from '@astryxdesign/core/Icon';
import {defineTheme} from '@astryxdesign/core/theme';

export const contract = defineIconCapabilities({
  weights: {range: {min: 100, max: 700}},
});

declare module '@astryxdesign/core/Icon' {
  interface IconCapabilityMap {
    consumerRange: typeof contract;
  }
}

type Assert<T extends true> = T;
export type NumericRangeWeights = Assert<
  number extends IconWeight ? (IconWeight extends number ? true : false) : false
>;
const supplied: ParameterizedIconVersion = {
  render: ({weight = 410}) => <svg data-weight={weight} />,
  weightRange: {min: 100, max: 700},
};
export const source = defineAdaptiveIcon(contract, {default: supplied});
export const request: IconRequest = {weight: 425.5};
export const explicit = <Icon icon="search" weight={425.5} />;
export const theme = defineTheme({
  name: 'consumer-range',
  iconCapabilities: {
    contract,
    presentation: {
      default: {weight: 425.5},
      bySize: {sm: {weight: 610.25}},
    },
  },
  icons: {search: source},
});

// @ts-expect-error Numeric range admission never admits a named weight.
export const namedWeight = <Icon icon="search" weight="book" />;
// @ts-expect-error Exact-program appearances must not leak into this program.
export const leakedAppearance = <Icon icon="search" appearance="filled" />;
// @ts-expect-error Exact-program sizes must not leak into this program.
export const leakedSize = <Icon icon="search" size="compact" />;
export const exclusiveWeightModes = defineIconCapabilities({
  // @ts-expect-error One contract declares exact values or a range, not both.
  weights: {values: [400], range: {min: 100, max: 700}},
});
