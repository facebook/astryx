import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: spacingVars['--spacing-4'],
  },
  cardContent: {
    padding: spacingVars['--spacing-3'],
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    cursor: 'pointer',
    borderRadius: spacingVars['--spacing-1'],
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colorVars['--color-overlay'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'pointer',
  },
  overlayImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
  },
  meta: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
  },
});

interface ScreenshotGalleryProps {
  screenshots: Record<string, string>;
}

interface ScreenshotMeta {
  filename: string;
  src: string;
  promptId: string;
  viewport: string;
  theme: string;
}

function parseFilename(filename: string): {
  promptId: string;
  viewport: string;
  theme: string;
} {
  // Expected format: promptId-viewport-theme.png or similar
  const withoutExt = filename.replace(/\.\w+$/, '');
  const parts = withoutExt.split(/[-_]/);

  if (parts.length >= 3) {
    const theme = parts[parts.length - 1] ?? 'unknown';
    const viewport = parts[parts.length - 2] ?? 'unknown';
    const promptId = parts.slice(0, -2).join('-');
    return {promptId, viewport, theme};
  }

  return {promptId: withoutExt, viewport: 'unknown', theme: 'unknown'};
}

export function ScreenshotGallery({screenshots}: ScreenshotGalleryProps) {
  const [enlarged, setEnlarged] = useState<string | null>(null);

  const items: ScreenshotMeta[] = Object.entries(screenshots).map(
    ([filename, src]) => {
      const {promptId, viewport, theme} = parseFilename(filename);
      return {filename, src, promptId, viewport, theme};
    },
  );

  return (
    <>
      <div sx={styles.grid}>
        {items.map(item => (
          <XDSCard key={item.filename}>
            <XDSVStack gap="space0">
              <img
                sx={styles.image}
                src={item.src}
                alt={`Screenshot: ${item.promptId}`}
                onClick={() => setEnlarged(item.src)} />
              <div sx={styles.cardContent}>
                <XDSVStack gap="space1">
                  <XDSText type="label">{item.promptId}</XDSText>
                  <div sx={styles.meta}>
                    <XDSText type="supporting">{item.viewport}</XDSText>
                    <XDSText type="supporting">{item.theme}</XDSText>
                  </div>
                </XDSVStack>
              </div>
            </XDSVStack>
          </XDSCard>
        ))}
      </div>
      {enlarged && (
        <div sx={styles.overlay} onClick={() => setEnlarged(null)}>
          <img sx={styles.overlayImage} src={enlarged} alt="Enlarged screenshot" />
        </div>
      )}
    </>
  );
}
