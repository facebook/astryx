/**
 * @file XDSNavIcon.test.tsx
 * @input Uses vitest, @testing-library/react, XDSNavIcon
 * @output Unit tests for XDSNavIcon component
 * @position Testing; validates XDSNavIcon implementation
 *
 *
 * - /packages/cli/templates/showcase/NavIcon.tsx (showcase preview)
 * - /packages/cli/templates/blocks/components/NavIcon/NavIconInSideNavigation.tsx (block template)
 * - /packages/cli/templates/blocks/components/NavIcon/NavIconInTopNavigation.tsx (block template)
 * - /packages/cli/templates/blocks/components/NavIcon/NavIconWithHomeIcon.tsx (block template)SYNC: When XDSNavIcon changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSNavIcon} from './XDSNavIcon';

describe('XDSNavIcon', () => {
  it('renders icon content', () => {
    render(<XDSNavIcon icon={<span data-testid="icon">Icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSNavIcon icon={<span>Icon</span>} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('passes data-testid', () => {
    render(<XDSNavIcon icon={<span>Icon</span>} data-testid="nav-icon" />);
    expect(screen.getByTestId('nav-icon')).toBeInTheDocument();
  });
});
