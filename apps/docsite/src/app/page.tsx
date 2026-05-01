'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}>
      <XDSVStack gap={6} hAlign="center">
        <XDSVStack gap={2} hAlign="center">
          <XDSHeading level={1}>XDS</XDSHeading>
          <XDSText type="body" color="secondary">
            A design system for building internal tools and products.
          </XDSText>
        </XDSVStack>
        <XDSButton label="Get Started" variant="primary" />
      </XDSVStack>
    </main>
  );
}
