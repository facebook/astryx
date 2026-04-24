import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import {XDSBreadcrumbs} from './XDSBreadcrumbs';
import {XDSBreadcrumbItem} from './XDSBreadcrumbItem';
import {XDSLinkProvider} from '../Link/XDSLinkProvider';

const CustomLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  ({children, ...props}, ref) => (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  ),
);
CustomLink.displayName = 'CustomLink';

describe('XDSBreadcrumbs', () => {
  it('renders a nav landmark with aria-label', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('supports custom aria-label', () => {
    render(
      <XDSBreadcrumbs label="Custom nav">
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Custom nav',
    );
  });

  it('renders items in an ordered list', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('renders separators between items', () => {
    const {container} = render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Detail</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    // Each item renders its own separator span; first is hidden via CSS
    const separators = container.querySelectorAll('span[aria-hidden="true"]');
    expect(separators).toHaveLength(3);
    expect(separators[0].textContent).toBe('/');
  });

  it('supports custom separator', () => {
    const {container} = render(
      <XDSBreadcrumbs separator={<span>›</span>}>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const separators = container.querySelectorAll('span[aria-hidden="true"]');
    // Custom separator content is nested inside the aria-hidden span
    // First item's separator is hidden via CSS, but still in the DOM
    expect(separators[1].textContent).toBe('›');
  });

  it('separators are aria-hidden', () => {
    const {container} = render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const separators = container.querySelectorAll('span[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards ref to the nav element', () => {
    const ref = {current: null as HTMLElement | null};
    render(
      <XDSBreadcrumbs ref={ref}>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('supports data-testid', () => {
    render(
      <XDSBreadcrumbs data-testid="my-breadcrumbs">
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByTestId('my-breadcrumbs')).toBeInTheDocument();
  });

  it('defaults to variant="default"', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('accepts variant="supporting"', () => {
    render(
      <XDSBreadcrumbs variant="supporting">
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
  });

  it('supporting variant renders links and current items', () => {
    render(
      <XDSBreadcrumbs variant="supporting">
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Detail</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByText('Detail')).toHaveAttribute('aria-current', 'page');
  });
});

describe('XDSBreadcrumbItem', () => {
  it('renders a link when href is provided', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/home">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders current item as span with aria-current="page"', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current Page</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const current = screen.getByText('Current Page');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('auto-detects last child as current when no isCurrent is set', async () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
        <XDSBreadcrumbItem>Last Item</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    // aria-current is set via useEffect, so we need to wait for it
    const lastLi = screen.getByText('Last Item').closest('li')!;
    await waitFor(() => {
      expect(lastLi).toHaveAttribute('aria-current', 'page');
    });
    expect(screen.getByText('Last Item').tagName).toBe('SPAN');
  });

  it('does not auto-detect when isCurrent is explicitly set', async () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem isCurrent>First</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/second">Second</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/third">Third</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByText('First')).toHaveAttribute('aria-current', 'page');
    // Wait for effects to settle, then confirm third has no aria-current
    const thirdLi = screen.getByText('Third').closest('li')!;
    await waitFor(() => {
      expect(thirdLi).not.toHaveAttribute('aria-current');
    });
    expect(screen.getByText('Third').tagName).toBe('A');
  });

  it('handles onClick on link items', async () => {
    const handleClick = vi.fn();
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/" onClick={handleClick}>
          Home
        </XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    await userEvent.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders onClick-only items as buttons with link styling', async () => {
    const handleClick = vi.fn();
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem onClick={handleClick}>Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const button = screen.getByRole('button', {name: 'Home'});
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders startIcon', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem
          href="/"
          startIcon={<span data-testid="home-icon">icon</span>}>
          Home
        </XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('supports data-testid on items', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/" data-testid="crumb-home">
          Home
        </XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent data-testid="crumb-current">
          Current
        </XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByTestId('crumb-home')).toBeInTheDocument();
    expect(screen.getByTestId('crumb-current')).toBeInTheDocument();
  });

  it('renders single item as current by auto-detection', async () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem>Only Item</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const li = screen.getByText('Only Item').closest('li')!;
    await waitFor(() => {
      expect(li).toHaveAttribute('aria-current', 'page');
    });
    expect(screen.getByText('Only Item').tagName).toBe('SPAN');
  });

  it('auto-detects last child as current with supporting variant', async () => {
    render(
      <XDSBreadcrumbs variant="supporting">
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem>Last</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const li = screen.getByText('Last').closest('li')!;
    await waitFor(() => {
      expect(li).toHaveAttribute('aria-current', 'page');
    });
    expect(screen.getByText('Last').tagName).toBe('SPAN');
  });

  it('renders custom component for non-current items when as is provided', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/" as={CustomLink}>
          Home
        </XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('does not apply as to current item (renders as span)', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent as={CustomLink}>
          Current
        </XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const current = screen.getByText('Current');
    expect(current.tagName).toBe('SPAN');
    expect(current).not.toHaveAttribute('data-custom-link');
  });

  it('renders custom component from XDSLinkProvider for non-current items', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Current</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSLinkProvider>,
    );
    const homeLink = screen.getByRole('link', {name: 'Home'});
    expect(homeLink).toHaveAttribute('data-custom-link');
    const projectsLink = screen.getByRole('link', {name: 'Projects'});
    expect(projectsLink).toHaveAttribute('data-custom-link');
    // Current item is still a span
    const current = screen.getByText('Current');
    expect(current.tagName).toBe('SPAN');
  });
});
