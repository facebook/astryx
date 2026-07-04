// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Breadcrumbs} from './Breadcrumbs';
import {BreadcrumbItem} from './BreadcrumbItem';
import {LinkProvider} from '../Link/LinkProvider';

function CustomLink({
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<'a'>) {
  return (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  );
}

describe('Breadcrumbs', () => {
  it('renders a nav landmark with aria-label', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('supports custom aria-label', () => {
    render(
      <Breadcrumbs label="Custom nav">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Custom nav',
    );
  });

  it('renders items in an ordered list', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('renders separators between items', () => {
    const {container} = render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );
    // Each item renders its own separator span; first is hidden via CSS
    const separators = container.querySelectorAll('span[aria-hidden="true"]');
    expect(separators).toHaveLength(3);
    expect(separators[0].textContent).toBe('/');
  });

  it('supports custom separator', () => {
    const {container} = render(
      <Breadcrumbs separator={<span>›</span>}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Page</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const separators = container.querySelectorAll('span[aria-hidden="true"]');
    // Custom separator content is nested inside the aria-hidden span
    // First item's separator is hidden via CSS, but still in the DOM
    expect(separators[1].textContent).toBe('›');
  });

  it('separators are aria-hidden', () => {
    const {container} = render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Page</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const separators = container.querySelectorAll('span[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards ref to the nav element', () => {
    const ref = {current: null as HTMLElement | null};
    render(
      <Breadcrumbs ref={ref}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('supports data-testid', () => {
    render(
      <Breadcrumbs data-testid="my-breadcrumbs">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(screen.getByTestId('my-breadcrumbs')).toBeInTheDocument();
  });

  it('defaults to variant="default"', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('accepts variant="supporting"', () => {
    render(
      <Breadcrumbs variant="supporting">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
  });

  it('supporting variant renders links and current items', () => {
    render(
      <Breadcrumbs variant="supporting">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/');
    expect(screen.getByText('Detail')).toHaveAttribute('aria-current', 'page');
  });
});

describe('BreadcrumbItem', () => {
  it('renders a link when href is provided', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/home">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders current item as span with aria-current="page"', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current Page</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const current = screen.getByText('Current Page');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('auto-detects last child as current when no isCurrent is set', async () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem>Last Item</BreadcrumbItem>
      </Breadcrumbs>,
    );
    // aria-current is set via useEffect on the content element (matching the
    // explicit isCurrent path), not the outer <li>.
    const lastContent = screen.getByText('Last Item');
    await waitFor(() => {
      expect(lastContent).toHaveAttribute('aria-current', 'page');
    });
    expect(lastContent.tagName).toBe('SPAN');
    // The <li> wrapper must NOT carry aria-current.
    expect(lastContent.closest('li')).not.toHaveAttribute('aria-current');
  });

  it('auto-detects aria-current on the anchor when the last item is a link', async () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/projects/current">Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const lastLink = screen.getByText('Current');
    await waitFor(() => {
      expect(lastLink).toHaveAttribute('aria-current', 'page');
    });
    // aria-current is on the anchor itself, not the <li>.
    expect(lastLink.tagName).toBe('A');
    expect(lastLink.closest('li')).not.toHaveAttribute('aria-current');
  });

  it('does not auto-detect when isCurrent is explicitly set', async () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem isCurrent>First</BreadcrumbItem>
        <BreadcrumbItem href="/second">Second</BreadcrumbItem>
        <BreadcrumbItem href="/third">Third</BreadcrumbItem>
      </Breadcrumbs>,
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
      <Breadcrumbs>
        <BreadcrumbItem href="/" onClick={handleClick}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    await userEvent.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders onClick-only items as buttons with link styling', async () => {
    const handleClick = vi.fn();
    render(
      <Breadcrumbs>
        <BreadcrumbItem onClick={handleClick}>Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const button = screen.getByRole('button', {name: 'Home'});
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders startIcon', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem
          href="/"
          startIcon={<span data-testid="home-icon">icon</span>}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('supports data-testid on items', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/" data-testid="crumb-home">
          Home
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent data-testid="crumb-current">
          Current
        </BreadcrumbItem>
      </Breadcrumbs>,
    );
    expect(screen.getByTestId('crumb-home')).toBeInTheDocument();
    expect(screen.getByTestId('crumb-current')).toBeInTheDocument();
  });

  it('renders single item as current by auto-detection', async () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem>Only Item</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const content = screen.getByText('Only Item');
    await waitFor(() => {
      expect(content).toHaveAttribute('aria-current', 'page');
    });
    expect(content.tagName).toBe('SPAN');
    expect(content.closest('li')).not.toHaveAttribute('aria-current');
  });

  it('auto-detects last child as current with supporting variant', async () => {
    render(
      <Breadcrumbs variant="supporting">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Last</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const content = screen.getByText('Last');
    await waitFor(() => {
      expect(content).toHaveAttribute('aria-current', 'page');
    });
    expect(content.tagName).toBe('SPAN');
    expect(content.closest('li')).not.toHaveAttribute('aria-current');
  });

  it('renders custom component for non-current items when as is provided', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/" as={CustomLink}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('does not apply as to current item (renders as span)', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent as={CustomLink}>
          Current
        </BreadcrumbItem>
      </Breadcrumbs>,
    );
    const current = screen.getByText('Current');
    expect(current.tagName).toBe('SPAN');
    expect(current).not.toHaveAttribute('data-custom-link');
  });

  it('renders custom component from LinkProvider for non-current items', () => {
    render(
      <LinkProvider component={CustomLink}>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
        </Breadcrumbs>
      </LinkProvider>,
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
