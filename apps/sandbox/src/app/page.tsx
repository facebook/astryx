import {XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core';
import {XDSVStack} from '@xds/core';
import {XDSLink} from '@xds/core';

export default function Home() {
  return (
    <XDSVStack gap="space4">
      <XDSHeading level={1}>Welcome to the XDS Sandbox</XDSHeading>
      <XDSText type="large">
        A testing ground for exploring and composing XDS components in
        real-world layouts.
      </XDSText>

      <XDSVStack gap="space2">
        <XDSHeading level={2}>Example Pages</XDSHeading>
        <XDSText type="body">
          Browse the sidebar to explore example pages, or jump to one directly:
        </XDSText>
        <XDSVStack gap="space1">
          <XDSLink label="Buttons page" href="/pages/buttons">
            Buttons — variants, sizes, and states
          </XDSLink>
          <XDSLink label="Form page" href="/pages/form">
            Form — text inputs, checkboxes, and switches
          </XDSLink>
        </XDSVStack>
      </XDSVStack>

      <XDSVStack gap="space2">
        <XDSHeading level={2}>Adding a New Page</XDSHeading>
        <XDSText type="body">
          Create a file at{' '}
          <XDSText type="code">
            src/app/pages/&lt;name&gt;/page.tsx
          </XDSText>{' '}
          and add an entry to the sidebar in{' '}
          <XDSText type="code">src/app/Sidebar.tsx</XDSText>. The page will be
          accessible at{' '}
          <XDSText type="code">/pages/&lt;name&gt;</XDSText>.
        </XDSText>
      </XDSVStack>
    </XDSVStack>
  );
}
