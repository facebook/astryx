// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

import {PlaygroundShell} from '../../components/playground/PlaygroundShell';
import {PlaygroundPreview} from '../../components/playground/PlaygroundPreview';
import {PlaygroundToolbar} from '../../components/playground/PlaygroundToolbar';
import {ComponentEditorPanel} from '../../components/playground/ComponentEditorPanel';
import {TemplateEditorPanel} from '../../components/playground/TemplateEditorPanel';
import {ThemeEditorPanel} from '../../components/playground/theme/ThemeEditorPanel';
import {
  detectContentType,
  type ContentType,
} from '../../components/playground/contentTypeDetector';

const DEFAULT_CODE = `import {
  XDSButton,
  XDSText,
  XDSHeading,
  XDSVStack,
  XDSHStack,
  XDSCard,
  XDSBadge,
} from '@xds/core';

export default function Demo() {
  const [count, setCount] = useState(0);

  return (
    <XDSCard padding={5} maxWidth={400}>
      <XDSVStack gap={12}>
        <XDSHeading level={3}>
          XDS Playground
        </XDSHeading>
        <XDSText color="secondary">
          Edit the code and see live changes.
        </XDSText>
        <XDSHStack gap={8} align="center">
          <XDSButton
            label={\`Count: \${count}\`}
            onClick={() => setCount(c => c + 1)}
          />
          <XDSBadge variant="info" label={\`\${count} clicks\`} />
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}`;

function getInitialCode(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_CODE;
  }
  const hash = window.location.hash.slice(1);
  if (!hash) {
    return DEFAULT_CODE;
  }
  const params = new URLSearchParams(hash);
  const compressed = params.get('code');
  if (!compressed) {
    return DEFAULT_CODE;
  }
  try {
    return decompressFromEncodedURIComponent(compressed) || DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

function updateURL(code: string) {
  const compressed = compressToEncodedURIComponent(code);
  window.history.replaceState(null, '', `#code=${compressed}`);
}

export function PlaygroundClient() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(getInitialCode);
  const [theme, setTheme] = useState('default');
  const [previewReady, setPreviewReady] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Detect content type from URL params and code
  const contentType: ContentType = detectContentType(code, searchParams);

  // Re-read code from hash on hashchange (e.g. SPA navigation with new code)
  useEffect(() => {
    const onHashChange = () => {
      const newCode = getInitialCode();
      if (newCode !== DEFAULT_CODE) {
        setCode(newCode);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update URL when code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL(code);
    }, 400);
    return () => clearTimeout(timer);
  }, [code]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
  }, []);

  // Render the appropriate editor panel based on content type
  const renderEditorPanel = () => {
    switch (contentType) {
      case 'template':
        return <TemplateEditorPanel code={code} onChange={setCode} />;
      case 'theme':
        return <ThemeEditorPanel code={code} onChange={setCode} />;
      case 'component':
      default:
        return <ComponentEditorPanel code={code} onChange={setCode} />;
    }
  };

  return (
    <>
      <PlaygroundShell
        toolbar={
          <PlaygroundToolbar
            previewReady={previewReady}
            previewError={previewError}
            theme={theme}
            onThemeChange={setTheme}
            onReset={handleReset}
            onShare={handleShare}
            contentType={contentType}
          />
        }
        leftPanel={renderEditorPanel()}
        rightPanel={
          <PlaygroundPreview
            code={code}
            theme={theme}
            onError={setPreviewError}
            onReady={() => setPreviewReady(true)}
          />
        }
      />
    </>
  );
}
