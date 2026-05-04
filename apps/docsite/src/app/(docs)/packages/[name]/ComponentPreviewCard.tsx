'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
  type ComponentType,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {showcaseRegistry} from '../../../../generated/showcaseRegistry';

const FIXED_SCALE = 0.5;

const styles = stylex.create({
  thumbnail: {
    width: '100%',
    aspectRatio: '16/10',
    overflow: 'hidden',
    position: 'relative' as const,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 300px 187px',
  },
  scaler: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '200%',
    transformOrigin: 'top left',
    pointerEvents: 'none' as const,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    aspectRatio: '16/10',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  textContent: {
    padding: '0 var(--spacing-2) var(--spacing-1)',
  },
});

function ComponentThumbnail({name}: {name: string}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setRenderWidth(containerRef.current.offsetWidth / FIXED_SCALE);
    }
  }, []);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {rootMargin: '200px'},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    updateWidth();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateWidth]);

  if (error) {
    return (
      <div {...stylex.props(styles.placeholder)}>
        <XDSText type="supporting" color="secondary">
          {name}
        </XDSText>
      </div>
    );
  }

  return (
    <div ref={containerRef} {...stylex.props(styles.thumbnail)} inert>
      {renderWidth > 0 && isVisible && Component && (
        <div
          {...stylex.props(styles.scaler)}
          style={{width: renderWidth, transform: `scale(${FIXED_SCALE})`}}>
          <Suspense fallback={<XDSSkeleton width="100%" height="100%" />}>
            <Component />
          </Suspense>
        </div>
      )}
    </div>
  );
}

interface ComponentPreviewCardProps {
  name: string;
  href: string;
  description: string;
  groupSize: number;
}

export function ComponentPreviewCard({
  name,
  href,
  description,
  groupSize,
}: ComponentPreviewCardProps) {
  return (
    <XDSClickableCard
      label={name}
      href={href}
      variant="transparent"
      padding={0}>
      <XDSVStack gap={2}>
        <ComponentThumbnail name={name} />
        <div {...stylex.props(styles.textContent)}>
          <XDSVStack gap={0.5}>
            <XDSText type="body" weight="bold">
              {name}
              {groupSize > 1 ? (
                <XDSText type="supporting" color="secondary">
                  {' '}
                  +{groupSize - 1}
                </XDSText>
              ) : null}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {description}
            </XDSText>
          </XDSVStack>
        </div>
      </XDSVStack>
    </XDSClickableCard>
  );
}
