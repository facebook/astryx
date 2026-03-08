import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {XDSCard} from './XDSCard';

describe('XDSCard', () => {
  it('renders children', () => {
    const {getByText} = render(<XDSCard>Hello</XDSCard>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('renders xds-* class names for theme targeting', () => {
    const {container} = render(<XDSCard>Content</XDSCard>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('xds-card');
  });
});
