import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSCarousel} from './XDSCarousel';

// Mock ResizeObserver (not available in jsdom)
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('XDSCarousel', () => {
  it('renders children', () => {
    render(
      <XDSCarousel aria-label="Test carousel">
        <div data-testid="item-1">Item 1</div>
        <div data-testid="item-2">Item 2</div>
      </XDSCarousel>,
    );
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('has carousel ARIA attributes', () => {
    render(
      <XDSCarousel aria-label="Photos">
        <div>Item</div>
      </XDSCarousel>,
    );
    const region = screen.getByRole('region', {name: 'Photos'});
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('applies data-testid', () => {
    render(
      <XDSCarousel data-testid="my-carousel">
        <div>Item</div>
      </XDSCarousel>,
    );
    expect(screen.getByTestId('my-carousel')).toBeInTheDocument();
  });

  it('has correct xds class name', () => {
    render(
      <XDSCarousel data-testid="cls-test">
        <div>Item</div>
      </XDSCarousel>,
    );
    const el = screen.getByTestId('cls-test');
    expect(el.className).toContain('xds-carousel');
  });
});
