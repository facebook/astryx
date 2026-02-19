import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {XDSIllustrationNoResults} from './XDSIllustrationNoResults';
import {XDSIllustrationEmptyInbox} from './XDSIllustrationEmptyInbox';
import {XDSIllustrationEmptyFolder} from './XDSIllustrationEmptyFolder';
import {XDSIllustrationError} from './XDSIllustrationError';
import {XDSIllustrationSuccess} from './XDSIllustrationSuccess';
import type {XDSIllustrationSize} from './types';

const illustrations = [
  {name: 'XDSIllustrationNoResults', Component: XDSIllustrationNoResults},
  {name: 'XDSIllustrationEmptyInbox', Component: XDSIllustrationEmptyInbox},
  {name: 'XDSIllustrationEmptyFolder', Component: XDSIllustrationEmptyFolder},
  {name: 'XDSIllustrationError', Component: XDSIllustrationError},
  {name: 'XDSIllustrationSuccess', Component: XDSIllustrationSuccess},
] as const;

const sizeMap: Record<XDSIllustrationSize, number> = {
  sm: 48,
  md: 80,
  lg: 120,
};

describe.each(illustrations)('$name', ({name, Component}) => {
  it('renders without crashing', () => {
    const {container} = render(<Component />);
    expect(container.firstChild).toBeTruthy();
  });

  it('has aria-hidden="true"', () => {
    const {container} = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders an SVG element', () => {
    const {container} = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName).toBe('svg');
  });

  it('defaults to md size (80px)', () => {
    const {container} = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
  });

  it.each(['sm', 'md', 'lg'] as const)('renders at %s size', size => {
    const {container} = render(<Component size={size} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', String(sizeMap[size]));
    expect(svg).toHaveAttribute('height', String(sizeMap[size]));
  });

  it('forwards ref', () => {
    const ref = {current: null as SVGSVGElement | null};
    render(<Component ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it('accepts data-testid', () => {
    const testId = `test-${name}`;
    const {container} = render(<Component data-testid={testId} />);
    const svg = container.querySelector(`[data-testid="${testId}"]`);
    expect(svg).toBeInTheDocument();
  });

  it('has a viewBox attribute', () => {
    const {container} = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 120 120');
  });
});
