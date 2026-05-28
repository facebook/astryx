// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState, type ComponentType} from 'react';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSTheme} from '@xds/core/theme';
import {useMediaQuery} from '@xds/core/hooks';
import {neutralTheme} from '@xds/theme-neutral/built';
import {showcaseRegistry} from '../../generated/showcaseRegistry';
import {useThemeMode} from '../../app/providers';

interface ShowcasePreviewProps {
  name: string;
}

export function ShowcasePreview({name}: ShowcasePreviewProps) {
  const {mode} = useThemeMode();
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);
  const isSmall = useMediaQuery('(max-width: 768px)');

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

  const placeholderStyle = isSmall
    ? {minHeight: 160, width: '100%'}
    : {aspectRatio: '16 / 9', width: '100%'};

  if (error) {
    return (
      <XDSCenter style={placeholderStyle}>
        <XDSText type="supporting" color="secondary">
          Preview not available
        </XDSText>
      </XDSCenter>
    );
  }

  if (!Component) {
    return (
      <XDSCenter style={placeholderStyle}>
        <XDSSpinner size="md" />
      </XDSCenter>
    );
  }

  if (isSmall) {
    return (
      <XDSTheme theme={neutralTheme} mode={mode}>
        <div
          style={{
            width: '100%',
            overflow: 'auto',
            minHeight: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div style={{minWidth: 'fit-content'}}>
            <Component />
          </div>
        </div>
      </XDSTheme>
    );
  }

  return (
    <XDSTheme theme={neutralTheme} mode={mode}>
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Component />
      </div>
    </XDSTheme>
  );
}
