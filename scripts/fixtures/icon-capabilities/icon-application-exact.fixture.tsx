// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-application-exact.fixture.tsx
 * @input One application augmentation with exact numeric and named weights
 * @output Admitted Icon requests without widening the shared control-size axis
 * @position Independent external-consumer program; never imported by other fixtures
 */
import {
  Icon,
  defineAdaptiveIcon,
  defineIconCapabilities,
  renderIconSlot,
  type IconAppearance,
  type IconRequest,
  type IconSize,
  type IconWeight,
} from '@astryxdesign/core/Icon';
import type {ElementSize} from '@astryxdesign/core/SizeContext';

export const contract = defineIconCapabilities({
  sizes: {compact: {default: '14px'}},
  appearances: ['outline', 'filled'],
  weights: {values: [400, 600, 'book']},
});

declare module '@astryxdesign/core/Icon' {
  interface IconCapabilityMap {
    consumerExact: typeof contract;
  }
}

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
export type AdmittedSizes = Assert<
  Equal<IconSize, 'xsm' | 'sm' | 'md' | 'lg' | 'compact'>
>;
export type AdmittedAppearances = Assert<
  Equal<IconAppearance, 'outline' | 'filled'>
>;
export type ExactWeights = Assert<Equal<IconWeight, 400 | 600 | 'book'>>;
export type ControlSizesStayClosed = Assert<
  Equal<ElementSize, 'sm' | 'md' | 'lg'>
>;

export const explicit = (
  <Icon icon="search" size="compact" appearance="filled" weight={600} />
);
export const namedWeight = <Icon icon="consumer:mark" weight="book" />;
export const partialRequest: IconRequest = {appearance: 'outline'};
export const request: IconRequest = {
  size: 'compact',
  appearance: 'filled',
  weight: 400,
};
export const slot = renderIconSlot('search', {
  size: 'compact',
  color: 'accent',
});
export const supplied = defineAdaptiveIcon(contract, {
  default: {
    default: <svg />,
    byWeight: {400: <svg />, 600: <svg />, book: <svg />},
  },
  bySize: {compact: {default: <svg />, byAppearance: {filled: <svg />}}},
  byAppearance: {outline: <svg />, filled: <svg />},
});

// @ts-expect-error Custom Icon sizes do not become shared control sizes.
export const invalidControlSize: ElementSize = 'compact';
// @ts-expect-error Size admission is finite, not arbitrary strings.
export const invalidSize = <Icon icon="search" size="display" />;
// @ts-expect-error Appearance admission is finite.
export const invalidAppearance = <Icon icon="search" appearance="duotone" />;
// @ts-expect-error Exact weights do not admit every number.
export const invalidWeight = <Icon icon="search" weight={500} />;
// @ts-expect-error A range augmentation in another program cannot leak here.
export const leakedRange = <Icon icon="search" weight={425.5} />;
// @ts-expect-error Unknown named weights remain rejected.
export const invalidNamedWeight: IconRequest = {weight: 'heavy'};
// @ts-expect-error Application appearance admission does not expand the slot helper.
renderIconSlot('search', {appearance: 'filled'});
// @ts-expect-error Application weight admission does not expand the slot helper.
renderIconSlot('search', {weight: 600});
export const invalidBranch = defineAdaptiveIcon(contract, {
  default: <svg />,
  byWeight: {
    // @ts-expect-error Source branches use the bound exact weights.
    500: <svg />,
  },
});
