'use client';

import {useState, useCallback, useEffect, useMemo} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {XDSText} from '@xds/core/Text';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSButton} from '@xds/core/Button';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {categories} from '../sandboxPages';
import {useThemeControls} from '../providers';
import {sourceRegistry} from '../../generated/sourceRegistry';

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DesktopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TabletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';
const viewportWidths: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function PreviewShell({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [copied, setCopied] = useState(false);
  const {themeName, setThemeName, mode, setMode} = useThemeControls();
  const [toolbarHidden, setToolbarHidden] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sandbox-toolbar-hidden');
    if (saved === 'true') setToolbarHidden(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sandbox-toolbar-hidden', String(toolbarHidden));
  }, [toolbarHidden]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '\\') {
        e.preventDefault();
        setToolbarHidden(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find current page name from the registry
  const currentPage = useMemo(() => {
    for (const cat of categories) {
      for (const page of cat.pages) {
        const normalizedHref = page.href.replace(/\/$/, '');
        const normalizedPath = pathname.replace(/\/$/, '');
        if (normalizedHref === normalizedPath)
          return {page, category: cat.label};
      }
    }
    return null;
  }, [pathname]);

  const pageName =
    currentPage?.page.name ??
    (() => {
      const segments = pathname.replace(/\/$/, '').split('/');
      return (
        segments[segments.length - 1]
          ?.replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase()) ?? 'Preview'
      );
    })();

  const [paletteOpen, setPaletteOpen] = useState(false);

  // Build searchable items for the command palette
  const searchSource = useMemo(() => {
    const items = categories.flatMap(cat =>
      cat.pages.map(page => ({
        id: page.href,
        label: page.name,
        auxiliaryData: {group: cat.label, description: page.description},
      })),
    );
    return createStaticSource(items);
  }, []);

  const resolvedSource =
    sourceRegistry[pathname] ??
    sourceRegistry[pathname.replace(/\/$/, '') + '/'] ??
    null;

  const handleViewChange = useCallback((v: string) => {
    setView(v as 'preview' | 'code');
  }, []);

  const handleCopy = useCallback(async () => {
    if (!resolvedSource) return;
    await navigator.clipboard.writeText(resolvedSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [resolvedSource]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      {/* Toolbar */}
      <div
        style={{
          display: toolbarHidden ? 'none' : 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderBottom: '1px solid var(--color-border-emphasized)',
          backgroundColor: '#f8f8f8',
          flexShrink: 0,
          zIndex: 10,
        }}>
        <div style={{flex: 1, minWidth: 0}}>
          <button
            onClick={() => setPaletteOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: 'inherit',
            }}>
            {pageName}
            <ChevronDownIcon width={14} height={14} style={{opacity: 0.5}} />
          </button>
        </div>

        <XDSCommandPalette
          isOpen={paletteOpen}
          onOpenChange={setPaletteOpen}
          searchSource={searchSource}
          label="Navigate to page"
          onValueChange={value => {
            router.push(value);
            setPaletteOpen(false);
          }}
          width={480}
          renderItem={(item, isSelected) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: '2px 0',
                fontWeight: isSelected ? 600 : 400,
              }}>
              <span>{item.label}</span>
              {(item.auxiliaryData as {description?: string})?.description && (
                <span style={{fontSize: 12, opacity: 0.6}}>
                  {(item.auxiliaryData as {description?: string}).description}
                </span>
              )}
            </div>
          )}
        />

        <XDSSegmentedControl
          value={view}
          onChange={handleViewChange}
          label="Toggle preview or code view"
          size="sm">
          <XDSSegmentedControlItem
            value="preview"
            label="Preview"
            isLabelHidden
            icon={<EyeIcon width={14} height={14} />}
          />
          <XDSSegmentedControlItem
            value="code"
            label="Code"
            isLabelHidden
            icon={<CodeIcon width={14} height={14} />}
          />
        </XDSSegmentedControl>

        {view === 'preview' && (
          <XDSSegmentedControl
            value={viewport}
            onChange={v => setViewport(v as ViewportSize)}
            label="Viewport size"
            size="sm">
            <XDSSegmentedControlItem
              value="desktop"
              label="Desktop"
              isLabelHidden
              icon={<DesktopIcon width={14} height={14} />}
            />
            <XDSSegmentedControlItem
              value="tablet"
              label="Tablet"
              isLabelHidden
              icon={<TabletIcon width={14} height={14} />}
            />
            <XDSSegmentedControlItem
              value="mobile"
              label="Mobile"
              isLabelHidden
              icon={<PhoneIcon width={14} height={14} />}
            />
          </XDSSegmentedControl>
        )}

        <XDSDropdownMenu
          button={{
            label: themeName.charAt(0).toUpperCase() + themeName.slice(1),
            variant: 'ghost',
            size: 'sm',
          }}
          hasChevron
          items={[
            {label: 'Default', onClick: () => setThemeName('default')},
            {label: 'Neutral', onClick: () => setThemeName('neutral')},
            {label: 'Brutalist', onClick: () => setThemeName('brutalist')},
            {label: 'Meta', onClick: () => setThemeName('meta')},
            {label: 'WhatsApp', onClick: () => setThemeName('whatsapp')},
            {label: 'Daily', onClick: () => setThemeName('daily')},
          ]}
        />
        <XDSButton
          variant="ghost"
          size="sm"
          label={mode === 'light' ? 'Light mode' : 'Dark mode'}
          icon={
            mode === 'light' ? (
              <SunIcon width={14} height={14} />
            ) : (
              <MoonIcon width={14} height={14} />
            )
          }
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          isIconOnly
        />
        <XDSButton
          variant="ghost"
          size="sm"
          label={copied ? 'Copied' : 'Copy source'}
          icon={
            copied ? (
              <CheckIcon width={14} height={14} />
            ) : (
              <CopyIcon width={14} height={14} />
            )
          }
          onClick={handleCopy}
          isIconOnly
        />
      </div>
      {/* Content */}
      {view === 'preview' ? (
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            padding: viewport !== 'desktop' ? '24px 16px' : 0,
            backgroundColor: viewport === 'desktop' ? 'transparent' : '#f0f0f0',
          }}>
          <div
            style={{
              width: viewportWidths[viewport],
              maxWidth: '100%',
              height: viewport !== 'desktop' ? 'fit-content' : '100%',
              minHeight: viewport !== 'desktop' ? '100%' : undefined,
              overflow: 'auto',
              border:
                viewport !== 'desktop'
                  ? '1px solid var(--color-border-emphasized)'
                  : 'none',
              borderRadius: viewport !== 'desktop' ? 8 : 0,
              backgroundColor: 'var(--color-background-card)',
            }}>
            {children}
          </div>
        </div>
      ) : (
        <div style={{flex: 1, overflow: 'auto'}}>
          {resolvedSource ? (
            <XDSCodeBlock
              code={resolvedSource}
              language="tsx"
              hasLineNumbers
              hasCopyButton
            />
          ) : (
            <div
              style={{
                padding: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <XDSText type="body" color="secondary">
                Source not available
              </XDSText>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
