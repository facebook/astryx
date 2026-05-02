'use client';

import {useEffect, useState, type ComponentType} from 'react';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSSpinner} from '@xds/core/Spinner';
import {showcaseRegistry} from '../../generated/showcaseRegistry';

interface ShowcasePreviewProps {
  name: string;
}

export function ShowcasePreview({name}: ShowcasePreviewProps) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loader = showcaseRegistry[name];
    if (!loader) {
      setError(true);
      return;
    }
    loader()
      .then(mod => setComponent(() => mod.default))
      .catch(() => setError(true));
  }, [name]);

  if (error) {
    return (
      <XDSCenter height={360}>
        <XDSText type="supporting" color="secondary">
          Preview not available
        </XDSText>
      </XDSCenter>
    );
  }

  if (!Component) {
    return (
      <XDSCenter height={360}>
        <XDSSpinner size="md" />
      </XDSCenter>
    );
  }

  return <Component />;
}
