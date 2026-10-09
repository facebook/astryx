// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconAdapters.test.tsx
 * @input Pure adapter factories, unsafe runtime mappers and public Icon rendering
 * @output Isolated evidence for local intent, safe defaults and caller SVG ownership
 * @position Core B regressions; no role/state participation or public inspection API
 */
import React, {type SVGProps} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {defineTheme} from '../theme/defineTheme';
import {ThemeContext} from '../theme/useTheme';
import {resetThemes} from '../theme/themeRegistry';
import {__resetDevWarnings} from '../utils/devWarning';
import {Icon, type IconType} from './Icon';
import {IconDefaultSizeProvider} from './IconDefaultSizeContext';
import {
  defineIconCapabilities,
  getApplicationIconCapabilities,
} from './iconCapabilities';
import {
  createIconAdapter,
  type IconAdapterOptions,
  type IconAdapterRequest,
} from './iconAdapters';
import {resolveIconWithContext} from './iconResolution';

const contract = defineIconCapabilities({
  sizes: {
    md: {default: '20px'},
    sm: {default: '16px'},
    hero: {default: '40px'},
  },
  appearances: ['outline', 'fill'],
  weights: {range: {min: 200, max: 800}},
});
const wide = defineIconCapabilities({
  sizes: {hero: {default: '40px'}},
  appearances: ['outline', 'fill', 'duotone'],
  weights: {range: {min: 100, max: 900}},
});
declare module './index' {
  interface IconCapabilityMap {
    adapterRuntimeContract: typeof contract;
    adapterRuntimeWide: typeof wide;
  }
}
type Request = IconAdapterRequest<typeof contract>;
type Mapping = {
  variant?: 'outline' | 'fill';
  inkWeight?: number;
  monochrome?: boolean | null;
};
type LibraryProps = SVGProps<SVGSVGElement> & Mapping & {size?: number};
const propNames = ['variant', 'inkWeight', 'monochrome'] as const;
function Library({
  variant = 'outline',
  inkWeight = 350,
  monochrome = true,
  size,
  ...props
}: LibraryProps) {
  return (
    <svg
      {...props}
      data-variant={variant}
      data-weight={inkWeight}
      data-monochrome={String(monochrome)}
      data-native-size={size}
    />
  );
}
function mapping(request: Request): Mapping {
  return {
    variant: request.appearance,
    inkWeight: request.weight,
    monochrome: request.appearance === 'fill' ? null : false,
  };
}
function fixture() {
  const mapper = vi.fn(mapping);
  const adapt = createIconAdapter({
    capabilities: contract,
    propNames,
    resolveProps: mapper,
  });
  return {mapper, adapt, Adapted: adapt(Library)};
}
// Deliberately erased caller types exercise the runtime boundary, not public authoring.
function unsafeFixture(mapper: (request: Request) => unknown): IconType {
  return createIconAdapter({
    capabilities: contract,
    propNames,
    resolveProps: mapper as (request: Request) => Mapping,
  })(Library);
}
function unsafeOptions(options: unknown) {
  return options as IconAdapterOptions<
    typeof contract,
    Mapping,
    typeof propNames
  >;
}
function physicalDimension(svg: HTMLElement | SVGElement, value: string) {
  return [...Array(svg.style.length).keys()].some(
    index => svg.style.getPropertyValue(svg.style.item(index)) === value,
  );
}

beforeEach(() => __resetDevWarnings());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetThemes();
});

describe('pure stable icon adapters', () => {
  it('caches one wrapper per supplied component without mapping or global installation', () => {
    const {adapt, Adapted, mapper} = fixture();
    expect(adapt(Library)).toBe(Adapted);
    expect(adapt(React.memo(Library))).not.toBe(Adapted);
    expect(getApplicationIconCapabilities().sizes).not.toHaveProperty('hero');
    expect(getApplicationIconCapabilities().appearances).toEqual([]);
    expect(mapper).not.toHaveBeenCalled();
    expect(Object.getOwnPropertyNames(Adapted)).not.toContain('capabilities');
    expect(Object.getOwnPropertySymbols(Adapted)).toEqual([]);
  });
  it('never probes supplied component getters or lazy payload during construction/resolution', () => {
    const getter = vi.fn(() => {
      throw new Error('opaque component field');
    });
    const Component = (props: SVGProps<SVGSVGElement>) => <svg {...props} />;
    Object.defineProperty(Component, 'displayName', {get: getter});
    const Lazy = {$$typeof: Symbol.for('react.lazy')};
    Object.defineProperties(Lazy, {
      _init: {get: getter},
      _payload: {get: getter},
    });
    const adapt = createIconAdapter({
      capabilities: contract,
      resolveProps: () => ({}),
    });
    const wrapped = adapt(Component);
    const wrappedLazy = adapt(Lazy as unknown as IconType);
    expect(resolveIconWithContext(wrapped, {size: 'md'}).component).toBe(
      wrapped,
    );
    expect(resolveIconWithContext(wrappedLazy, {size: 'md'}).component).toBe(
      wrappedLazy,
    );
    expect(getter).not.toHaveBeenCalled();
  });
  it('does not execute option or propNames getters', () => {
    const getter = vi.fn(() => {
      throw new Error('unsafe data accessor');
    });
    const options = {capabilities: contract, propNames, resolveProps: mapping};
    Object.defineProperty(options, 'resolveProps', {get: getter});
    expect(() => {
      void createIconAdapter(options);
    }).toThrow();
    const names = ['variant'];
    Object.defineProperty(names, '0', {get: getter});
    expect(() => {
      void createIconAdapter(
        unsafeOptions({
          capabilities: contract,
          propNames: names,
          resolveProps: mapping,
        }),
      );
    }).toThrow();
    expect(getter).not.toHaveBeenCalled();
  });
  it('snapshots raw contracts, output-key lists and mapper identity', () => {
    const raw = {appearances: ['outline']};
    const names = ['variant'] as 'variant'[];
    const mapper = vi.fn(() => ({variant: 'fill' as const}));
    const options = {capabilities: raw, propNames: names, resolveProps: mapper};
    const Adapted = createIconAdapter(options)(Library);
    raw.appearances.push('duotone');
    names.splice(0, 1);
    options.resolveProps = vi.fn(() => ({variant: 'fill' as const}));
    const result = resolveIconWithContext(Adapted, {appearance: 'outline'});
    expect(result.mappedProps).toEqual({variant: 'fill'});
    expect(result.inspection.capabilities.appearances).toEqual(['outline']);
    expect(mapper).toHaveBeenCalledOnce();
    expect(options.resolveProps).not.toHaveBeenCalled();
  });
  it.each([
    'icon',
    'label',
    'color',
    'role',
    'state',
    'aria-label',
    'ariaLabel',
    'data-marker',
    'dataWhatever',
    'onClick',
    'style',
    'xstyle',
    'children',
    'ref',
    'className',
    'formAction',
    'width',
    '__proto__',
  ])('rejects unsafe declared mapped key %s before mapping', name => {
    const mapper = vi.fn(mapping);
    expect(() => {
      void createIconAdapter(
        unsafeOptions({
          capabilities: contract,
          propNames: [name],
          resolveProps: mapper,
        }),
      );
    }).toThrow();
    expect(mapper).not.toHaveBeenCalled();
  });
});

describe('adapter intent and source-local dispatch', () => {
  it('renders the supplied default identically and bypasses declared implicit md/context sm', () => {
    const {Adapted, mapper} = fixture();
    const {container, rerender} = render(
      <Icon icon={Library} data-testid="icon" />,
    );
    const ordinary = container.innerHTML;
    rerender(<Icon icon={Adapted} data-testid="icon" />);
    expect(container.innerHTML).toBe(ordinary);
    rerender(
      <IconDefaultSizeProvider value="sm">
        <Icon icon={Adapted} data-testid="icon" />
      </IconDefaultSizeProvider>,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('data-weight', '350');
    expect(mapper).not.toHaveBeenCalled();
    rerender(<Adapted data-testid="icon" />);
    expect(mapper).not.toHaveBeenCalled();
  });
  it('maps supported explicit size-only intent once and retains ordinary physical sizing', () => {
    const {Adapted, mapper} = fixture();
    render(<Icon icon={Adapted} size="md" data-testid="icon" />);
    expect(mapper).toHaveBeenCalledExactlyOnceWith({size: 'md'});
    expect(screen.getByTestId('icon')).toHaveAttribute('data-weight', '350');
  });
  it('never activates for explicit admitted md when the adapter has no declared size or presentation', () => {
    const mapper = vi.fn(() => ({}));
    const Adapted = createIconAdapter({capabilities: {}, resolveProps: mapper})(
      Library,
    );
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Icon icon={Adapted} size="md" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('data-weight', '350');
    expect(mapper).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
  it('omits undeclared local size when supported appearance activates mapping', () => {
    const local = defineIconCapabilities({appearances: ['fill']});
    const mapper = vi.fn((request: IconAdapterRequest<typeof local>) => ({
      variant: request.appearance,
    }));
    const Adapted = createIconAdapter({
      capabilities: local,
      propNames: ['variant'],
      resolveProps: mapper,
    })(Library);
    const result = resolveIconWithContext(Adapted, {
      size: 'md',
      appearance: 'fill',
    });
    expect(mapper).toHaveBeenCalledExactlyOnceWith({appearance: 'fill'});
    expect(result.inspection.size.supported).toBe(false);
    expect(result.inspection.diagnostics).toEqual([]);
  });
  it('maps nullable primitives and fractional weights unchanged', () => {
    const {Adapted, mapper} = fixture();
    render(
      <Icon
        icon={Adapted}
        size="hero"
        appearance="fill"
        weight={425.5}
        data-testid="icon"
      />,
    );
    const svg = screen.getByTestId('icon');
    expect(mapper).toHaveBeenCalledExactlyOnceWith({
      size: 'hero',
      appearance: 'fill',
      weight: 425.5,
    });
    expect(svg).toHaveAttribute('data-variant', 'fill');
    expect(svg).toHaveAttribute('data-weight', '425.5');
    expect(svg).toHaveAttribute('data-monochrome', 'null');
    expect(physicalDimension(svg, '40px')).toBe(true);
    expect(svg).not.toHaveAttribute('appearance');
    expect(svg).not.toHaveAttribute('weight');
    expect(getApplicationIconCapabilities().sizes).not.toHaveProperty('hero');
  });
  it('supports the draft default appearance/weight prop names without a tuple', () => {
    type Props = SVGProps<SVGSVGElement> & {
      appearance?: 'outline' | 'fill';
      weight?: number;
    };
    function Native({appearance = 'outline', weight = 350, ...props}: Props) {
      return (
        <svg {...props} data-appearance={appearance} data-weight={weight} />
      );
    }
    const Adapted = createIconAdapter({
      capabilities: contract,
      resolveProps: request => ({
        appearance: request.appearance,
        weight: request.weight,
      }),
    })(Native);
    render(
      <Icon
        icon={Adapted}
        appearance="fill"
        weight={425.5}
        data-testid="icon"
      />,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute(
      'data-appearance',
      'fill',
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('data-weight', '425.5');
  });
  it('permits an explicitly declared primitive library size output without inventing an axis', () => {
    const Adapted = createIconAdapter({
      capabilities: contract,
      propNames: ['size'],
      resolveProps: () => ({size: 32}),
    })(Library);
    render(<Icon icon={Adapted} size="md" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute(
      'data-native-size',
      '32',
    );
  });
  it('applies theme-by-size and explicit precedence after source-local narrowing', () => {
    const {Adapted, mapper} = fixture();
    const theme = defineTheme({
      name: 'adapter-policy',
      iconCapabilities: {
        contract: wide,
        presentation: {
          default: {appearance: 'outline', weight: 300.5},
          bySize: {sm: {appearance: 'fill', weight: 700.25}},
        },
      },
    });
    const {rerender} = render(
      <ThemeContext value={{theme, mode: 'light'}}>
        <IconDefaultSizeProvider value="sm">
          <Icon icon={Adapted} data-testid="icon" />
        </IconDefaultSizeProvider>
      </ThemeContext>,
    );
    expect(mapper).toHaveBeenLastCalledWith({
      size: 'sm',
      appearance: 'fill',
      weight: 700.25,
    });
    rerender(
      <ThemeContext value={{theme, mode: 'light'}}>
        <Icon
          icon={Adapted}
          size="sm"
          appearance="outline"
          weight={425.5}
          data-testid="icon"
        />
      </ThemeContext>,
    );
    expect(mapper).toHaveBeenLastCalledWith({
      size: 'sm',
      appearance: 'outline',
      weight: 425.5,
    });
    expect(screen.getByTestId('icon')).toHaveAttribute('data-weight', '425.5');
  });
  it('takes quiet theme-only fallback and deduplicates explicit unsupported axes without mapping', () => {
    const {Adapted, mapper} = fixture();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'adapter-wide-policy',
      iconCapabilities: {
        contract: wide,
        presentation: {default: {appearance: 'duotone', weight: 850}},
      },
    });
    const policy = resolveIconWithContext(Adapted, {}, theme);
    expect(
      policy.inspection.diagnostics.map(item => [item.code, item.provenance]),
    ).toEqual([
      ['unsupported', 'theme-default'],
      ['unsupported', 'theme-default'],
    ]);
    expect(policy.mappedProps).toBeUndefined();
    expect(warning).not.toHaveBeenCalled();
    for (let index = 0; index < 2; index++) {
      const explicit = resolveIconWithContext(
        Adapted,
        {appearance: 'duotone', weight: 850},
        theme,
      );
      expect(explicit.inspection.appearance.omitted).toBe('duotone');
      expect(explicit.inspection.weight.omitted).toBe(850);
      expect(explicit.mappedProps).toBeUndefined();
    }
    expect(warning).toHaveBeenCalledTimes(2);
    expect(mapper).not.toHaveBeenCalled();
  });
  it('passes only locally supported axes while retaining global custom-size geometry without warning', () => {
    const local = defineIconCapabilities({
      appearances: ['fill'],
      weights: {range: {min: 200, max: 800}},
    });
    const mapper = vi.fn((request: IconAdapterRequest<typeof local>) => ({
      variant: request.appearance,
      inkWeight: request.weight,
    }));
    const Adapted = createIconAdapter({
      capabilities: local,
      propNames: ['variant', 'inkWeight'],
      resolveProps: mapper,
    })(Library);
    const theme = defineTheme({
      name: 'adapter-local-size',
      iconCapabilities: {contract: wide},
    });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ThemeContext value={{theme, mode: 'light'}}>
        <Icon
          icon={Adapted}
          size="hero"
          appearance="fill"
          weight={425.5}
          data-testid="icon"
        />
      </ThemeContext>,
    );
    expect(mapper).toHaveBeenCalledExactlyOnceWith({
      appearance: 'fill',
      weight: 425.5,
    });
    expect(physicalDimension(screen.getByTestId('icon'), '40px')).toBe(true);
    expect(warning).not.toHaveBeenCalled();
  });
  it('uses plain identity recognition without reading forged metadata on ordinary components', () => {
    const getter = vi.fn(() => {
      throw new Error('forged metadata executed');
    });
    function Ordinary(props: SVGProps<SVGSVGElement>) {
      return <svg {...props} />;
    }
    Object.defineProperties(Ordinary, {
      capabilities: {get: getter},
      resolveProps: {get: getter},
      propNames: {get: getter},
      __iconAdapter: {get: getter},
    });
    render(<Icon icon={Ordinary} data-testid="icon" />);
    expect(resolveIconWithContext(Ordinary).inspection.source.kind).toBe(
      'ordinary-direct',
    );
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('safe runtime mapping and SVG ownership', () => {
  const badOutputs: [string, () => unknown][] = [
    ['undefined result', () => undefined],
    ['null result', () => null],
    ['string result', () => 'fill'],
    ['array result', () => []],
    ['promise result', async () => ({variant: 'fill'})],
    ['unknown key', () => ({variant: 'fill', invented: 1})],
    ['symbol key', () => ({variant: 'fill', [Symbol('unknown')]: 1})],
    ['semantic icon key', () => ({variant: 'fill', icon: 'close'})],
    ['semantic label key', () => ({variant: 'fill', label: 'override'})],
    ['semantic color key', () => ({variant: 'fill', color: 'red'})],
    ['global key', () => ({variant: 'fill', className: 'override'})],
    ['form key', () => ({variant: 'fill', disabled: true})],
    ['a11y key', () => ({variant: 'fill', 'aria-label': 'override'})],
    ['camel a11y key', () => ({variant: 'fill', ariaLabel: 'override'})],
    ['camel data key', () => ({variant: 'fill', dataWhatever: 'override'})],
    ['event key', () => ({variant: 'fill', onClick: () => {}})],
    ['ref key', () => ({variant: 'fill', ref: React.createRef()})],
    ['style key', () => ({variant: 'fill', style: {width: '1px'}})],
    [
      'children key',
      () => ({variant: 'fill', children: <title>Override</title>}),
    ],
    ['nonfinite number', () => ({inkWeight: Number.NaN})],
    ['infinite number', () => ({inkWeight: Number.POSITIVE_INFINITY})],
    ['object value', () => ({variant: {kind: 'fill'}})],
    ['function value', () => ({variant: () => 'fill'})],
    ['array value', () => ({variant: ['fill']})],
    ['bigint value', () => ({inkWeight: 425n})],
    ['symbol value', () => ({variant: Symbol('fill')})],
    [
      'foreign prototype',
      // eslint-disable-next-line @typescript-eslint/promise-function-async -- Intentionally synchronous opaque prototype data; never await or wrap the malformed result.
      (): unknown =>
        Object.assign(Object.create({variant: 'fill'}), {inkWeight: 425}),
    ],
    [
      'mapper throw',
      () => {
        throw new Error('mapper failed');
      },
    ],
  ];
  it.each(badOutputs)(
    'falls back atomically for %s while preserving caller ownership',
    (_name, output) => {
      const Adapted = unsafeFixture(output);
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const ref = React.createRef<SVGSVGElement>();
      const onClick = vi.fn();
      render(
        <Icon
          icon={Adapted}
          appearance="fill"
          weight={425.5}
          label="Safe name"
          role="presentation"
          aria-label="Caller name"
          data-testid="icon"
          className="caller"
          style={{opacity: 0.5}}
          onClick={onClick}
          ref={ref}
        />,
      );
      const svg = screen.getByTestId('icon');
      expect(svg).toHaveAttribute('data-variant', 'outline');
      expect(svg).toHaveAttribute('data-weight', '350');
      expect(svg).toHaveAttribute('role', 'presentation');
      expect(svg).toHaveAttribute('aria-label', 'Caller name');
      expect(svg).not.toHaveAttribute('aria-hidden');
      expect(svg).toHaveClass('caller');
      expect(svg).toHaveStyle({opacity: '0.5'});
      expect(ref.current).toBe(svg);
      fireEvent.click(svg);
      expect(onClick).toHaveBeenCalledOnce();
      expect(warning).toHaveBeenCalledOnce();
      const result = resolveIconWithContext(Adapted, {
        appearance: 'fill',
        weight: 425.5,
      });
      expect(
        result.inspection.diagnostics.some(
          item => item.code === 'malformed-adapter',
        ),
      ).toBe(true);
      expect(result.mappedProps).toBeUndefined();
      expect(result.inspection.appearance.selected).toBeUndefined();
      expect(warning).toHaveBeenCalledOnce();
    },
  );
  it('rejects mapped getters without invoking them and never partially applies valid sibling fields', () => {
    const getter = vi.fn(() => {
      throw new Error('mapped accessor executed');
    });
    const output = {inkWeight: 425.5};
    Object.defineProperty(output, 'variant', {get: getter, enumerable: true});
    const Adapted = unsafeFixture(() => output);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Icon
        icon={Adapted}
        appearance="fill"
        weight={425.5}
        data-testid="icon"
      />,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute(
      'data-variant',
      'outline',
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('data-weight', '350');
    expect(getter).not.toHaveBeenCalled();
  });
  it('keeps safe mapped props behind caller SVG overrides and forwards refs through memo', () => {
    const mapper = vi.fn((request: Request) => ({inkWeight: request.weight}));
    const Adapted = createIconAdapter({
      capabilities: contract,
      propNames: ['inkWeight'],
      resolveProps: mapper,
    })(React.memo(Library));
    const ref = React.createRef<SVGSVGElement>();
    const click = vi.fn();
    render(
      <Icon
        icon={Adapted}
        weight={425.5}
        data-testid="icon"
        ref={ref}
        onClick={click}
        role="presentation"
        aria-label="Caller"
        className="caller"
        style={{opacity: 0.5}}
        strokeWidth={3}
      />,
    );
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveAttribute('data-weight', '425.5');
    expect(svg).toHaveAttribute('stroke-width', '3');
    expect(svg).toHaveAttribute('aria-label', 'Caller');
    expect(svg).toHaveStyle({opacity: '0.5'});
    expect(ref.current).toBe(svg);
    fireEvent.click(svg);
    expect(click).toHaveBeenCalledOnce();
  });
  it('is silent in production for unsupported intent and malformed mappings', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {Adapted} = fixture();
    const theme = defineTheme({
      name: 'production-adapter',
      iconCapabilities: {contract: wide},
    });
    const unsupported = resolveIconWithContext(
      Adapted,
      {appearance: 'duotone', weight: 850},
      theme,
    );
    const malformed = resolveIconWithContext(
      unsafeFixture(() => ({variant: {bad: true}})),
      {appearance: 'fill'},
    );
    expect(unsupported.inspection.diagnostics.map(item => item.code)).toEqual([
      'unsupported',
      'unsupported',
    ]);
    expect(malformed.inspection.diagnostics.map(item => item.code)).toEqual([
      'malformed-adapter',
    ]);
    expect(warning).not.toHaveBeenCalled();
  });
});
