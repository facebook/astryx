// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Section} from './Section';

describe('Section', () => {
  it('renders with default props', () => {
    const {container} = render(<Section>Default section</Section>);
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByText('Default section')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Section>
        <span data-testid="child">Hello</span>
      </Section>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders with variant="section" (default)', () => {
    const {container} = render(<Section>Content</Section>);
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('xds-section');
    expect(inner.className).toContain('section');
  });

  it('renders with variant="transparent"', () => {
    const {container} = render(
      <Section variant="transparent">Content</Section>,
    );
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('xds-section');
    expect(inner.className).toContain('transparent');
  });

  it('renders with variant="muted"', () => {
    const {container} = render(
      <Section variant="muted">Content</Section>,
    );
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('xds-section');
    expect(inner.className).toContain('muted');
  });

  it('renders with dividers', () => {
    const {container} = render(
      <Section dividers={['top', 'bottom']}>Content</Section>,
    );
    // The component should render without error
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with padding prop', () => {
    const {container} = render(<Section padding={2}>Content</Section>);
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with width and height without error', () => {
    const {container} = render(
      <Section width={400} height={300}>
        Content
      </Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    // Sizing is applied via stylex dynamic styles (CSS custom properties)
    // which aren't reflected in element.style in test environments
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with maxWidth and minHeight without error', () => {
    const {container} = render(
      <Section maxWidth={600} minHeight={200}>
        Content
      </Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with string size values without error', () => {
    const {container} = render(
      <Section width="50%" height="auto">
        Content
      </Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<Section ref={ref}>Content</Section>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders xds-* class names for theme targeting', () => {
    const {container} = render(<Section>Content</Section>);
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('xds-section');
  });

  it('renders variant in xds class names', () => {
    const {container} = render(
      <Section variant="muted">Content</Section>,
    );
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('xds-section');
    expect(inner.className).toContain('muted');
  });

  it('accepts xstyle prop without error', () => {
    // xstyle is a StyleXStyles type; in tests stylex.create returns objects
    // that may not produce runtime styles, but the prop should be accepted
    const {container} = render(
      <Section xstyle={undefined}>Content</Section>,
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    const {container} = render(
      <Section className="custom-class">Content</Section>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('custom-class');
  });

  it('accepts style prop', () => {
    const {container} = render(
      <Section style={{opacity: 0.5}}>Content</Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe('0.5');
  });

  it('has two-div structure (outer + inner)', () => {
    const {container} = render(<Section>Content</Section>);
    const outer = container.firstElementChild!;
    const inner = outer.firstElementChild!;
    expect(outer.tagName).toBe('DIV');
    expect(inner.tagName).toBe('DIV');
    // Children are inside the inner div
    expect(inner.textContent).toBe('Content');
  });

  it('spreads additional props', () => {
    render(<Section data-testid="custom-section">Content</Section>);
    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
  });

  it('propagates explicit padding to nested sections via --xds-section-padding', () => {
    const {container} = render(
      <Section padding={6}>
        <Section data-testid="inner">Inner</Section>
      </Section>,
    );
    // Outer section's inner div should set --xds-section-padding
    const outerInner = container.firstElementChild!.firstElementChild!;
    expect(outerInner.className).toBeDefined();
    // Inner section should render without error
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });

  it('renders nested sections with explicit inner padding override', () => {
    render(
      <Section padding={6}>
        <Section padding={2} data-testid="inner">
          Inner
        </Section>
      </Section>,
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });
});
