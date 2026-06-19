// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState, type ComponentType} from 'react';
import {Center} from '@xds/core/Center';
import {Text} from '@xds/core/Text';
import {Spinner} from '@xds/core/Spinner';
import {useMediaQuery} from '@xds/core/hooks';
import {showcaseRegistry} from '../../generated/showcaseRegistry';
import {preventPreviewNavigation} from './previewNavigation';

interface ShowcasePreviewProps {
  name: string;
}

export function ShowcasePreview({name}: ShowcasePreviewProps) {
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

  const previewNavigationProps =
    name === 'SideNav' ? {onClickCapture: preventPreviewNavigation} : {};

  const placeholderStyle = isSmall
    ? {minHeight: 160, width: '100%'}
    : {aspectRatio: '16 / 9', width: '100%'};

  if (error) {
    return (
      <Center style={placeholderStyle}>
        <Text type="supporting" color="secondary">
          Preview not available
        </Text>
      </Center>
    );
  }

  if (!Component) {
    return (
      <Center style={placeholderStyle}>
        <Spinner size="md" />
      </Center>
    );
  }

  if (isSmall) {
    return (
      <div
        style={{
          width: '100%',
          overflow: 'auto',
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...previewNavigationProps}>
        <div style={{minWidth: 'fit-content'}}>
          <Component />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...previewNavigationProps}>
      <Component />
    </div>
  );
}
