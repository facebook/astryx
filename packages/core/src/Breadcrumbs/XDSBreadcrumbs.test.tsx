import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSBreadcrumbs} from './XDSBreadcrumbs';
import {XDSBreadcrumbItem} from './XDSBreadcrumbItem';

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
    const separators = container.querySelectorAll('li[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
    expect(separators[0].textContent).toBe('/');
  });

  it('supports custom separator', () => {
    const {container} = render(
      <XDSBreadcrumbs separator={<span>›</span>}>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const separators = container.querySelectorAll('li[aria-hidden="true"]');
    expect(separators[0].textContent).toBe('›');
  });

  it('separators have role="presentation"', () => {
    const {container} = render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const separators = container.querySelectorAll('li[aria-hidden="true"]');
    expect(separators[0]).toHaveAttribute('role', 'presentation');
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

  it('auto-detects last child as current when no isCurrent is set', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
        <XDSBreadcrumbItem>Last Item</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const lastItem = screen.getByText('Last Item');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('does not auto-detect when isCurrent is explicitly set', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem isCurrent>First</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/second">Second</XDSBreadcrumbItem>
        <XDSBreadcrumbItem href="/third">Third</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    expect(screen.getByText('First')).toHaveAttribute('aria-current', 'page');
    const third = screen.getByText('Third');
    expect(third).not.toHaveAttribute('aria-current');
    expect(third.tagName).toBe('A');
  });

  it('handles onClick', async () => {
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

  it('renders single item as current by auto-detection', () => {
    render(
      <XDSBreadcrumbs>
        <XDSBreadcrumbItem>Only Item</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const item = screen.getByText('Only Item');
    expect(item).toHaveAttribute('aria-current', 'page');
    expect(item.tagName).toBe('SPAN');
  });

  it('auto-detects last child as current with supporting variant', () => {
    render(
      <XDSBreadcrumbs variant="supporting">
        <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
        <XDSBreadcrumbItem>Last</XDSBreadcrumbItem>
      </XDSBreadcrumbs>,
    );
    const last = screen.getByText('Last');
    expect(last).toHaveAttribute('aria-current', 'page');
    expect(last.tagName).toBe('SPAN');
  });
});
