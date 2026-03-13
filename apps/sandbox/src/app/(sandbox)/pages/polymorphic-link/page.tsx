'use client';

import {
  useState,
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSLink, XDSLinkProvider} from '@xds/core/Link';
import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Simulated framework link components
// =============================================================================

const styles = stylex.create({
  container: {
    maxWidth: 960,
  },
  navWrapper: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  log: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    backgroundColor: '#f5f5f5',
    padding: '0.75rem 1rem',
    borderRadius: 6,
    maxHeight: 200,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  },
  customLinkIndicator: {
    outline: '2px dashed #3b82f6',
    outlineOffset: -2,
  },
  sidenavWrapper: {
    width: 240,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

/**
 * Simulated Next.js-like Link for demo purposes.
 * Intercepts navigation and logs to console instead of full page reload.
 * Renders with a blue dashed outline to visually identify it.
 */
const SimulatedNextLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & {children?: ReactNode}
>(function SimulatedNextLink({href, onClick, children, ...props}, ref) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={e => {
        e.preventDefault();

        console.log(`[SimulatedNextLink] Client-side navigate to: ${href}`);
        onClick?.(e);
      }}
      {...stylex.props(styles.customLinkIndicator)}
      {...props}>
      {children}
    </a>
  );
});

/**
 * Another custom link for demonstrating per-component `as` override.
 * Renders with a green dashed outline.
 */
const GreenLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & {children?: ReactNode}
>(function GreenLink({href, onClick, children, style, ...props}, ref) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={e => {
        e.preventDefault();

        console.log(`[GreenLink] Navigate to: ${href}`);
        onClick?.(e);
      }}
      style={{...style, outline: '2px dashed #22c55e', outlineOffset: -2}}
      {...props}>
      {children}
    </a>
  );
});

// =============================================================================
// Demo page
// =============================================================================

export default function PolymorphicLinkPage() {
  const [tab, setTab] = useState('overview');

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Polymorphic Link</XDSHeading>
          <XDSText type="body" color="secondary">
            XDS components that render links can use a custom link component
            instead of native {'<a>'}. Set it globally via XDSLinkProvider or
            per-component via the{' '}
            <XDSText type="body" weight="bold">
              as
            </XDSText>{' '}
            prop.
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* ================================================================= */}
        {/* Section 1: Provider Demo */}
        {/* ================================================================= */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Provider Demo</XDSHeading>
          <XDSText type="body" color="secondary">
            All components below are wrapped in{' '}
            <XDSText type="body" weight="bold">
              XDSLinkProvider
            </XDSText>{' '}
            with a simulated Next.js Link (blue dashed outline). Open the
            browser console to see navigation logs.
          </XDSText>

          <XDSLinkProvider component={SimulatedNextLink}>
            <XDSVStack gap={4}>
              {/* TopNav */}
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  XDSTopNav
                </XDSText>
                <div {...stylex.props(styles.navWrapper)}>
                  <XDSTopNav
                    label="Provider demo navigation"
                    heading={<XDSTopNavHeading heading="My App" />}
                    startContent={
                      <>
                        <XDSTopNavItem label="Home" href="/" isSelected />
                        <XDSTopNavItem label="Products" href="/products" />
                        <XDSTopNavItem label="About" href="/about" />
                      </>
                    }
                  />
                </div>
              </XDSVStack>

              {/* Breadcrumbs */}
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  XDSBreadcrumbs
                </XDSText>
                <XDSBreadcrumbs label="Provider breadcrumbs">
                  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
                  <XDSBreadcrumbItem href="/products">
                    Products
                  </XDSBreadcrumbItem>
                  <XDSBreadcrumbItem isCurrent>Widget</XDSBreadcrumbItem>
                </XDSBreadcrumbs>
              </XDSVStack>

              {/* TabList */}
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  XDSTabList (with href)
                </XDSText>
                <XDSTabList value={tab} onChange={setTab}>
                  <XDSTab value="overview" label="Overview" href="/overview" />
                  <XDSTab value="details" label="Details" href="/details" />
                  <XDSTab value="reviews" label="Reviews" href="/reviews" />
                </XDSTabList>
              </XDSVStack>

              {/* SideNav */}
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  XDSSideNav
                </XDSText>
                <div {...stylex.props(styles.sidenavWrapper)}>
                  <XDSSideNav aria-label="Provider sidenav">
                    <XDSSideNavItem
                      label="Dashboard"
                      href="/dashboard"
                      isSelected
                    />
                    <XDSSideNavItem label="Settings" href="/settings" />
                    <XDSSideNavItem label="Profile" href="/profile" />
                  </XDSSideNav>
                </div>
              </XDSVStack>

              {/* XDSLink */}
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  XDSLink
                </XDSText>
                <XDSLink label="Documentation link" href="/docs">
                  Go to documentation
                </XDSLink>
              </XDSVStack>
            </XDSVStack>
          </XDSLinkProvider>
        </XDSVStack>

        <XDSDivider />

        {/* ================================================================= */}
        {/* Section 2: Per-component `as` override */}
        {/* ================================================================= */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Per-Component Override</XDSHeading>
          <XDSText type="body" color="secondary">
            The{' '}
            <XDSText type="body" weight="bold">
              as
            </XDSText>{' '}
            prop overrides the provider for a single component. Below, the
            provider sets the blue link, but &quot;Products&quot; uses a green
            link via{' '}
            <XDSText type="body" weight="bold">
              as={'{GreenLink}'}
            </XDSText>
            .
          </XDSText>

          <XDSLinkProvider component={SimulatedNextLink}>
            <div {...stylex.props(styles.navWrapper)}>
              <XDSTopNav
                label="Override demo navigation"
                heading={<XDSTopNavHeading heading="Override Demo" />}
                startContent={
                  <>
                    <XDSTopNavItem label="Home" href="/" isSelected />
                    <XDSTopNavItem
                      label="Products"
                      href="/products"
                      as={GreenLink}
                    />
                    <XDSTopNavItem label="About" href="/about" />
                  </>
                }
              />
            </div>
          </XDSLinkProvider>
        </XDSVStack>

        <XDSDivider />

        {/* ================================================================= */}
        {/* Section 3: Default behavior (no provider) */}
        {/* ================================================================= */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Default Behavior</XDSHeading>
          <XDSText type="body" color="secondary">
            Without a provider or{' '}
            <XDSText type="body" weight="bold">
              as
            </XDSText>{' '}
            prop, components render native {'<a>'} elements as usual.
          </XDSText>

          <div {...stylex.props(styles.navWrapper)}>
            <XDSTopNav
              label="Default navigation"
              heading={<XDSTopNavHeading heading="Default" />}
              startContent={
                <>
                  <XDSTopNavItem label="Home" href="#home" isSelected />
                  <XDSTopNavItem label="Products" href="#products" />
                  <XDSTopNavItem label="About" href="#about" />
                </>
              }
            />
          </div>

          <XDSBreadcrumbs label="Default breadcrumbs">
            <XDSBreadcrumbItem href="#home">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem href="#products">Products</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Current Page</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
