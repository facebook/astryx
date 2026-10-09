// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-adapter.fixture.tsx
 * @input One local adapter contract and supplied SVG-compatible library components
 * @output Inferred finite requests, primitive library mapping, and unchanged IconType
 * @position Isolated external consumer; no internal dispatcher or source aliases
 */
import type {ComponentType, SVGProps} from 'react';
import {
  Icon,
  createIconAdapter,
  defineIconCapabilities,
  type IconType,
  type IconAdapterProps,
} from '@astryxdesign/core/Icon';

export const contract = defineIconCapabilities({
  appearances: ['outline', 'filled'],
  weights: {values: [400, 600]},
});

declare module '@astryxdesign/core/Icon' {
  interface IconCapabilityMap {
    consumerAdapter: typeof contract;
  }
}

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
export type UnchangedIconType = Assert<
  Equal<IconType, ComponentType<SVGProps<SVGSVGElement>>>
>;

interface ProductProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'solid';
  inkWeight?: number;
  monochrome?: boolean | null;
  options?: Readonly<{detail: string}>;
}

// The public filter itself excludes forbidden keys, independent of tuple defaults.
interface MappingCandidate {
  variant?: 'line' | 'solid';
  inkWeight?: number;
  monochrome?: boolean | null;
  size?: number;
  icon?: string;
  label?: string;
  color?: string;
  role?: 'img';
  id?: string;
  formAction?: string;
  'aria-label'?: string;
  ariaLabel?: string;
  'data-label'?: string;
  dataLabel?: string;
  onClick?: () => void;
  ref?: {current: SVGSVGElement | null};
  style?: {opacity: number};
  className?: string;
  children?: string;
  __adapter?: string;
  options?: {detail: string};
}
export type PrimitiveLibraryKeysOnly = Assert<
  Equal<
    keyof IconAdapterProps<MappingCandidate>,
    'variant' | 'inkWeight' | 'monochrome' | 'size'
  >
>;
export const primitiveMappingShape: IconAdapterProps<MappingCandidate> = {
  variant: 'solid',
  inkWeight: 600,
  monochrome: null,
  size: 20,
};

const Product: ComponentType<ProductProps> = ({
  variant,
  inkWeight,
  monochrome,
  ...svgProps
}) => (
  <svg
    {...svgProps}
    data-version={variant}
    data-ink-weight={inkWeight}
    data-monochrome={monochrome}
  />
);
export const adapt = createIconAdapter({
  capabilities: contract,
  propNames: ['variant', 'inkWeight', 'monochrome'],
  resolveProps(request) {
    const appearance: 'outline' | 'filled' | undefined = request.appearance;
    const weight: 400 | 600 | undefined = request.weight;
    const size: undefined = request.size;
    // @ts-expect-error A local exact-weight contract does not admit arbitrary numbers.
    const unsupportedWeight: typeof request.weight = 500;
    // @ts-expect-error A local appearance contract does not infer additional names.
    const unsupportedAppearance: typeof request.appearance = 'duotone';
    // @ts-expect-error The adapter request has no ref transport field.
    request.ref;
    // @ts-expect-error The adapter request has no accessibility transport field.
    request.label;
    const variant: 'line' | 'solid' =
      appearance === 'filled' ? 'solid' : 'line';
    return {
      variant,
      inkWeight: weight,
      monochrome: appearance === 'outline' ? true : null,
    };
  },
});
export const Wrapped: IconType = adapt(Product);
export const Ordinary: IconType = props => <svg {...props} />;
export const ordinary = <Icon icon={Ordinary} viewBox="0 0 24 24" />;
export const adapted = (
  <Icon icon={Wrapped} appearance="filled" weight={600} label="Product mark" />
);
export const ordinaryWrapperProps = (
  <Wrapped
    viewBox="0 0 24 24"
    aria-label="Product mark"
    ref={{current: null}}
    onClick={() => {}}
    style={{opacity: 0.5}}>
    <title>Product mark</title>
  </Wrapped>
);
// @ts-expect-error The wrapper still exposes only the unchanged SVG-compatible IconType.
export const mappedPropsAreOpaque = <Wrapped variant="solid" />;
// @ts-expect-error Unknown explicit appearance remains rejected on Icon.
export const invalidAppearance = <Icon icon={Wrapped} appearance="duotone" />;
// @ts-expect-error Unknown exact weight remains rejected on Icon.
export const invalidWeight = <Icon icon={Wrapped} weight={500} />;

const DefaultProduct: ComponentType<
  SVGProps<SVGSVGElement> & {appearance?: 'outline' | 'filled'; weight?: number}
> = props => (
  <svg data-appearance={props.appearance} data-weight={props.weight} />
);
export const defaultMapping = createIconAdapter({
  capabilities: contract,
  resolveProps: request => ({
    appearance: request.appearance,
    weight: request.weight,
  }),
})(DefaultProduct);
export const defaultMappingIsIcon: IconType = defaultMapping;
export const blockMapping: IconType = createIconAdapter({
  capabilities: contract,
  resolveProps: request => {
    const weight: 400 | 600 | undefined = request.weight;
    return {appearance: request.appearance, weight};
  },
})(DefaultProduct);

const localContract = defineIconCapabilities({
  sizes: {compact: {default: '14px'}},
  appearances: ['duotone'],
  weights: {range: {min: 100, max: 700}},
});
const LocalProduct: ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number;
    appearance?: 'duotone';
    weight?: number;
  }
> = ({size, appearance, weight, ...svgProps}) => (
  <svg
    {...svgProps}
    data-size={size}
    data-appearance={appearance}
    data-weight={weight}
  />
);
export const localMapping = createIconAdapter({
  capabilities: localContract,
  propNames: ['size', 'appearance', 'weight'],
  resolveProps(request) {
    const appearance: 'duotone' | undefined = request.appearance;
    const weight: number | undefined = request.weight;
    const size: 'compact' | undefined = request.size;
    // @ts-expect-error The application contract does not widen this distinct local contract.
    const globalAppearance: typeof request.appearance = 'filled';
    // @ts-expect-error This local numeric range never admits named weights.
    const namedWeight: typeof request.weight = 'book';
    return {size: size === 'compact' ? 14 : undefined, appearance, weight};
  },
})(LocalProduct);
// @ts-expect-error Authoring a local adapter does not augment global Icon sizes.
export const noLocalSizeLeak = <Icon icon={localMapping} size="compact" />;

const role = () => ({role: 'button'});
const id = () => ({id: 'mapped'});
const aria = () => ({'aria-label': 'Mapped label'});
const event = () => ({onClick: () => {}});
const ref = () => ({ref: {current: null}});
const style = () => ({style: {opacity: 0.5}});
const children = () => ({children: <title>Mapped child</title>});
const className = () => ({className: 'mapped'});
const label = () => ({label: 'Mapped label'});
const object = () => ({variant: {name: 'solid'}});
const array = () => ({variant: ['solid']});
const callable = () => ({variant: () => 'solid'});
const extra = () => ({appearance: 'outline', unexpected: true});

// @ts-expect-error Mappers cannot replace semantic role with a primitive.
createIconAdapter({capabilities: contract, resolveProps: role});
// @ts-expect-error Mappers cannot replace a global element identifier.
createIconAdapter({capabilities: contract, resolveProps: id});
// @ts-expect-error Mappers cannot author accessibility props.
createIconAdapter({capabilities: contract, resolveProps: aria});
// @ts-expect-error Mappers cannot install event handlers.
createIconAdapter({capabilities: contract, resolveProps: event});
// @ts-expect-error Mappers cannot replace caller refs.
createIconAdapter({capabilities: contract, resolveProps: ref});
// @ts-expect-error Mappers cannot replace consumer styling.
createIconAdapter({capabilities: contract, resolveProps: style});
// @ts-expect-error Mappers cannot author React children.
createIconAdapter({capabilities: contract, resolveProps: children});
// @ts-expect-error Class names remain owned by the caller/Icon.
createIconAdapter({capabilities: contract, resolveProps: className});
// @ts-expect-error Accessible labels remain owned by Icon/caller.
createIconAdapter({capabilities: contract, resolveProps: label});
// @ts-expect-error Mapped library values must be primitive, not arbitrary objects.
createIconAdapter({capabilities: contract, resolveProps: object});
// @ts-expect-error Mapped library values cannot be arrays.
createIconAdapter({capabilities: contract, resolveProps: array});
// @ts-expect-error Mapped library values cannot be functions.
createIconAdapter({capabilities: contract, resolveProps: callable});
// @ts-expect-error The default mapped tuple does not admit undeclared extra keys.
createIconAdapter({capabilities: contract, resolveProps: extra});

export const unknownMappedKey = createIconAdapter({
  capabilities: contract,
  propNames: ['unknown'],
  // @ts-expect-error Declared mapped keys must exist in the mapper's supported output.
  resolveProps: request => ({variant: request.appearance}),
});
export const unsupportedComponent = adapt(
  // @ts-expect-error Mapped library props must be compatible with the supplied component.
  ({variant}: SVGProps<SVGSVGElement> & {variant?: number}) => (
    <svg data-version={variant} />
  ),
);
const RequiredMapping: ComponentType<
  SVGProps<SVGSVGElement> & {
    variant: 'line' | 'solid';
    inkWeight?: number;
    monochrome?: boolean | null;
  }
> = ({variant, ...svgProps}) => <svg {...svgProps} data-version={variant} />;
// @ts-expect-error A required mapped prop would break the no-intent supplied-default path.
adapt(RequiredMapping);
const RequiredNative: ComponentType<ProductProps & {id: string}> = props => (
  <svg id={props.id} />
);
// @ts-expect-error Requiring a caller-owned native prop would narrow unchanged IconType.
adapt(RequiredNative);
