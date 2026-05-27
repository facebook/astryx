// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 12,
    paddingBlock: 6,
    flexShrink: 0,
  },
  iframe: {
    flex: 1,
    border: 'none',
    width: '100%',
    height: '100%',
  },
  error: {
    padding: '8px 16px',
    maxHeight: 120,
    overflow: 'auto',
  },
});

interface PlaygroundPreviewProps {
  code: string;
  theme: string;
  onError?: (msg: string | null) => void;
  onReady?: () => void;
}

export function PlaygroundPreview({
  code,
  theme,
  onError,
  onReady,
}: PlaygroundPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const send = useCallback((c: string) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) {return;}
    win.postMessage(
      c ? {type: 'preview-code', code: c} : {type: 'preview-clear'},
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) {return;}
      if (e.data?.type === 'preview-ready') {
        readyRef.current = true;
        setPreviewReady(true);
        onReady?.();
        if (pendingRef.current != null) {
          send(pendingRef.current);
          pendingRef.current = null;
        }
      }
      if (e.data?.type === 'preview-rendered') {
        setPreviewError(null);
        onError?.(null);
      }
      if (e.data?.type === 'preview-error') {
        const msg = e.data.message ?? 'Unknown error';
        setPreviewError(msg);
        onError?.(msg);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [send, onReady, onError]);

  // Ping until ready
  useEffect(() => {
    const interval = setInterval(() => {
      if (readyRef.current) {
        clearInterval(interval);
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        {type: 'preview-ping'},
        window.location.origin,
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Send code on change (debounced)
  useEffect(() => {
    if (debounceRef.current) {clearTimeout(debounceRef.current);}
    debounceRef.current = setTimeout(() => {
      if (!readyRef.current) {
        pendingRef.current = code;
      } else {
        send(code);
      }
    }, 400);
    return () => {
      if (debounceRef.current) {clearTimeout(debounceRef.current);}
    };
  }, [code, send]);

  // Send theme changes
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {type: 'preview-theme', theme},
      window.location.origin,
    );
  }, [theme]);

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.bar)}>
        <XDSText color="secondary" type="supporting">
          Preview
        </XDSText>
        <XDSText color="disabled" type="supporting">
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </XDSText>
      </div>
      <XDSDivider />
      <iframe
        ref={iframeRef}
        src="/playground-preview"
        sandbox="allow-scripts allow-same-origin"
        title="Preview"
        {...stylex.props(s.iframe)}
      />
      {previewError && (
        <>
          <XDSDivider />
          <div {...stylex.props(s.error)}>
            <XDSText type="code" color="inherit">
              <span
                style={{
                  color: 'var(--color-text-error, #ef4444)',
                  whiteSpace: 'pre-wrap',
                }}>
                {previewError}
              </span>
            </XDSText>
          </div>
        </>
      )}
    </div>
  );
}
