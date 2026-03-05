import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
  name: 'Link',
  description:
    'XDSLink component for styled anchor links with multiple variants and features, plus polymorphic link infrastructure for rendering custom link components (Next.js Link, React Router Link, etc.).',
  features: [
    "Variants: 'default', 'subtle', 'inherit'",
    'External links: Opens in new tab with external link icon',
    'Tooltip support: Display tooltip text on hover',
    'Underline control: Always show underline or only on hover',
    'Inline support: Inherits parent font styles when used within text',
    'Standalone mode: Applies base font sizing for independent links',
    'Disabled state: Visual and interaction disabled',
    'Focus visible: Accessible focus outline',
    'Polymorphic link: Render as a custom component via `as` prop or XDSLinkProvider',
  ],
  examples: [
    {
      label: 'Basic link',
      code: '<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>',
    },
    {
      label: 'External link (opens in new tab with icon)',
      code: '<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>',
    },
    {
      label: 'Link with tooltip',
      code: `<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>`,
    },
    {
      label: 'Always underlined link',
      code: '<XDSLink label="Privacy Policy" href="/privacy" hasUnderline>Privacy Policy</XDSLink>',
    },
    {
      label: 'Inline within text (inherits parent font styles)',
      code: '<XDSText>Read the <XDSLink label="docs" href="/docs">documentation</XDSLink> for more info.</XDSText>',
    },
    {
      label: 'Standalone link',
      code: '<XDSLink label="Settings" href="/settings" isStandalone>Settings</XDSLink>',
    },
    {
      label: 'Subtle variant',
      code: '<XDSLink label="Privacy" href="/privacy" variant="subtle">Privacy Policy</XDSLink>',
    },
    {
      label: 'Disabled link',
      code: '<XDSLink label="Disabled" href="/disabled" isDisabled>Disabled Link</XDSLink>',
    },
    {
      label: 'Provider (global default) — Next.js',
      code: `import Link from 'next/link';
import {XDSLinkProvider} from '@xds/core/Link';

<XDSLinkProvider component={Link}>
  <App />
</XDSLinkProvider>`,
    },
    {
      label: 'Per-component override (as prop)',
      code: `import {Link as RouterLink} from 'react-router-dom';

<XDSLink label="Docs" href="/docs" as={RouterLink}>
  Docs
</XDSLink>`,
    },
    {
      label: 'Hook: useXDSLinkComponent',
      code: `import {useXDSLinkComponent} from '@xds/core/Link';

function MyComponent({as}: {as?: XDSLinkComponentType}) {
  const LinkComponent = useXDSLinkComponent(as);
  return <LinkComponent href="/foo">Click me</LinkComponent>;
}`,
    },
  ],
  theming: {
    componentKey: 'link',
    surfaces: [{name: 'root', description: 'Root anchor element styles'}],
  },
  notes: [
    'XDSLinkVariant type is derived from the `variants` StyleX object using `keyof typeof variants`',
    'By default, links inherit font family, size, line-height, and weight from parent elements',
    'Use isStandalone prop when the link is not inline within other text content',
    'isExternalLink automatically sets target="_blank" and rel="noopener noreferrer" for security',
    'Disabled state uses aria-disabled and pointer-events: none for accessibility',
    'Tooltip wraps the link in XDSTooltip component when provided',
    'XDSLinkComponentType is React.ElementType, allowing both string tags ("a") and custom components',
    'XDSLinkContext is separated from XDSLinkProvider (mirrors ThemeContext/XDSTheme pattern) so consumers can import the context without the full provider',
    'XDSLinkProvider memoizes its context value to prevent unnecessary re-renders',
    'Polymorphic link resolution order: (1) per-component as prop (highest priority), (2) XDSLinkProvider context, (3) native <a> element (default)',
    'All XDS components that render links (XDSLink, XDSTopNavItem, XDSSideNavItem, XDSBreadcrumbItem, XDSTab) support rendering as a custom link component',
  ],
  components: [
    {
      name: 'XDSLink',
      description:
        'Styled anchor link with variants, external link support, and polymorphic rendering.',
      props: [
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: 'Custom component to render instead of <a>',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: 'Link destination URL',
        },
        {
          name: 'variant',
          type: "'default' | 'subtle' | 'inherit'",
          description: 'Visual style variant',
          default: "'default'",
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: 'Always show underline',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the link',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description: 'Opens in new tab with external icon',
          default: 'false',
        },
        {
          name: 'target',
          type: 'string',
          description: 'Where to open linked document',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: 'Click event handler',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: 'Tooltip text displayed on hover',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: 'Applies base font sizing',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Link content',
          required: true,
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: '<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>',
        },
        {
          label: 'External link',
          code: '<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>',
        },
        {
          label: 'With tooltip',
          code: `<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>`,
        },
        {
          label: 'With custom component (as prop)',
          code: `<XDSLink label="Docs" href="/docs" as={RouterLink}>
  Docs
</XDSLink>`,
        },
      ],
    },
    {
      name: 'XDSLinkProvider',
      description:
        'Provider that sets the default link component for all XDS link components in the subtree.',
      props: [
        {
          name: 'component',
          type: 'XDSLinkComponentType',
          description: 'Component to use for all link elements',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Subtree',
          required: true,
        },
      ],
      examples: [
        {
          label: 'With Next.js Link',
          code: `import Link from 'next/link';
import {XDSLinkProvider} from '@xds/core/Link';

<XDSLinkProvider component={Link}>
  <App />
</XDSLinkProvider>`,
        },
      ],
    },
  ],
};
