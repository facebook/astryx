// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {XDSCard} from '@astryxdesign/core/Card';
import {XDSVStack} from '@astryxdesign/core/Stack';
import {XDSText} from '@astryxdesign/core/Text';
import './report.css';

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
      <div className="report-gallery-grid">
        {items.map(item => (
          <XDSCard key={item.filename}>
            <XDSVStack gap={0}>
              <img
                className="report-gallery-image"
                src={item.src}
                alt={`Screenshot: ${item.promptId}`}
                onClick={() => setEnlarged(item.src)}
              />
              <div className="report-gallery-cardContent">
                <XDSVStack gap={1}>
                  <XDSText type="label">{item.promptId}</XDSText>
                  <div className="report-gallery-meta">
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
        <div
          className="report-gallery-overlay"
          onClick={() => setEnlarged(null)}>
          <img
            className="report-gallery-overlayImage"
            src={enlarged}
            alt="Enlarged screenshot"
          />
        </div>
      )}
    </>
  );
}
