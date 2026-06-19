// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSMetricTile} from './XDSMetricTile';

describe('XDSMetricTile', () => {
  it('renders a formatted metric value', () => {
    render(<XDSMetricTile value={1234} data-testid="metric" />);
    expect(screen.getByTestId('metric')).toHaveTextContent('1.23K');
  });

  it('renders em-dash when value is null', () => {
    render(<XDSMetricTile value={null} data-testid="metric" />);
    expect(screen.getByTestId('metric')).toHaveTextContent('--');
  });

  it('renders em-dash when value is undefined', () => {
    render(<XDSMetricTile value={undefined} data-testid="metric" />);
    expect(screen.getByTestId('metric')).toHaveTextContent('--');
  });

  it('renders title and subtitle', () => {
    render(<XDSMetricTile value={42} title="Revenue" subtitle="This month" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('renders with prettyInt format', () => {
    render(
      <XDSMetricTile value={123456} format="prettyInt" data-testid="metric" />,
    );
    expect(screen.getByTestId('metric')).toHaveTextContent('123,456');
  });

  it('renders with prettyBytes format', () => {
    render(
      <XDSMetricTile value={1536} format="prettyBytes" data-testid="metric" />,
    );
    expect(screen.getByTestId('metric')).toHaveTextContent('1.5 KB');
  });

  it('renders with custom format function', () => {
    render(
      <XDSMetricTile value={50} format={v => v + '%'} data-testid="metric" />,
    );
    expect(screen.getByTestId('metric')).toHaveTextContent('50%');
  });

  it('renders delta value', () => {
    render(
      <XDSMetricTile
        value={100}
        deltaValue="+12.5%"
        deltaTrend="upward"
        deltaFavorability="favorable"
      />,
    );
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('renders the delta trend via a theme icon (XDSIcon), not a raw svg', () => {
    const {container} = render(
      <XDSMetricTile value={100} deltaValue="+1%" deltaTrend="upward" />,
    );
    // Registry icons render as a styled span carrying the xds-icon class.
    expect(container.querySelector('.xds-icon')).toBeInTheDocument();
  });

  it('renders a help icon button when a hovercard is provided', () => {
    render(
      <XDSMetricTile value={1} title="Revenue" hovercard="What this means" />,
    );
    expect(
      screen.getByRole('button', {name: 'Help Message'}),
    ).toBeInTheDocument();
  });

  it('renders zero correctly', () => {
    render(<XDSMetricTile value={0} data-testid="metric" />);
    expect(screen.getByTestId('metric')).toHaveTextContent('0');
  });

  it('renders negative values', () => {
    render(<XDSMetricTile value={-5000} data-testid="metric" />);
    expect(screen.getByTestId('metric')).toHaveTextContent('-5K');
  });

  it('renders large values with SI suffixes', () => {
    render(<XDSMetricTile value={2500000} data-testid="metric" />);
    expect(screen.getByTestId('metric')).toHaveTextContent('2.5M');
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSMetricTile ref={ref} value={1} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional props', () => {
    render(<XDSMetricTile data-testid="custom" value={1} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('renders xds-* class names for theme targeting', () => {
    const {container} = render(<XDSMetricTile value={1} />);
    const root = container.firstElementChild!;
    expect(root.className).toContain('xds-metric-tile');
  });

  it('renders with small size variant', () => {
    const {container} = render(<XDSMetricTile value={1} size="small" />);
    const root = container.firstElementChild!;
    expect(root.className).toContain('small');
  });

  it('renders title on top when titlePosition is top', () => {
    const {container} = render(
      <XDSMetricTile value={42} title="KPI" titlePosition="top" />,
    );
    const children = container.firstElementChild!.children;
    expect(children[0]).toHaveTextContent('KPI');
  });

  it('renders title on bottom by default', () => {
    const {container} = render(<XDSMetricTile value={42} title="KPI" />);
    const children = container.firstElementChild!.children;
    expect(children[children.length - 1]).toHaveTextContent('KPI');
  });
});
