'use client';

import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
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
import {XDSTreeList} from '@xds/core/TreeList';
import type {XDSTreeListItemData} from '@xds/core/TreeList';
import {categories} from '../sandboxPages';
import {useThemeControls} from '../providers';
import {sourceRegistry} from '../../generated/sourceRegistry';
import {templates} from '../../generated/templateRegistry';
import {blocks} from '../../generated/blockRegistry';
import {gitVersions} from '../../generated/versionRegistry';

const blocksByHref = new Map(blocks.map(b => [b.href.replace(/\/$/, ''), b]));

function buildNavTree(currentPath: string): XDSTreeListItemData[] {
  const norm = currentPath.replace(/\/$/, '');

  const pageItems: XDSTreeListItemData[] = templates.map(t => ({
    id: t.href,
    label: t.name,
    href: t.href,
    isSelected: t.href.replace(/\/$/, '') === norm,
  }));

  const componentMap = new Map<string, XDSTreeListItemData[]>();
  for (const b of blocks) {
    const group = b.component;
    if (!componentMap.has(group)) componentMap.set(group, []);
    const shortName = b.name.includes('—')
      ? b.name.split('—').slice(1).join('—').trim()
      : b.name;
    componentMap.get(group)!.push({
      id: b.href,
      label: shortName,
      href: b.href,
      isSelected: b.href.replace(/\/$/, '') === norm,
    });
  }

  const componentItems: XDSTreeListItemData[] = [...componentMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => ({
      id: `component-${name}`,
      label: name,
      children: items,
      isExpanded: items.some(i => i.isSelected),
    }));

  return [
    {
      id: 'pages',
      label: 'Pages',
      children: pageItems,
      isExpanded: true,
    },
    {
      id: 'components',
      label: 'Components',
      children: componentItems,
      isExpanded: true,
    },
  ];
}

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

function SidebarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
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

type Version = {
  id: string;
  name: string;
  timestamp: number;
  source?: 'local' | 'git';
  tag?: string;
  message?: string;
};

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStorageKey(pathname: string) {
  return `sandbox-versions-${pathname.replace(/\/$/, '')}`;
}

function VersionRow({
  version,
  isActive,
  onClick,
  detail,
  subtitle,
}: {
  version: Version;
  isActive: boolean;
  onClick: () => void;
  detail: string;
  subtitle?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 12px',
        border: 'none',
        background: isActive ? 'rgba(10,124,255,0.06)' : 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 13,
      }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: isActive ? '#0A7CFF' : 'transparent',
          border: isActive ? 'none' : '1px solid #ccc',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}>
        <span style={{fontWeight: isActive ? 600 : 400}}>{version.name}</span>
        {subtitle && (
          <span
            style={{
              display: 'block',
              fontSize: 10,
              color: '#999',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
            {subtitle}
          </span>
        )}
      </span>
      <span
        style={{
          fontSize: 11,
          color: '#999',
          marginLeft: 'auto',
          flexShrink: 0,
        }}>
        {detail}
      </span>
    </button>
  );
}

function VersionDropdown({pathname}: {pathname: string}) {
  const [localVersions, setLocalVersions] = useState<Version[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{top: number; left: number} | null>(
    null,
  );

  // Load local versions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(pathname));
      if (stored) setLocalVersions(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, [pathname]);

  // Persist local versions
  useEffect(() => {
    localStorage.setItem(
      getStorageKey(pathname),
      JSON.stringify(localVersions),
    );
  }, [localVersions, pathname]);

  // Merge local versions (first) + git versions
  const versions: Version[] = useMemo(() => {
    const local = localVersions.map(v => ({...v, source: 'local' as const}));
    const git = gitVersions.map(v => ({
      ...v,
      source: 'git' as const,
    }));
    return [...local, ...git];
  }, [localVersions]);

  // Calculate panel position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({top: rect.bottom + 4, left: rect.left});
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleSave = () => {
    const nextNum = localVersions.length + 1;
    const name = prompt('Version name:', `Version ${nextNum}`);
    if (!name) return;
    const newVersion: Version = {
      id: crypto.randomUUID(),
      name,
      timestamp: Date.now(),
      source: 'local',
    };
    setLocalVersions(prev => [newVersion, ...prev]);
    setActiveVersionId(newVersion.id);
  };

  const activeName =
    activeVersionId == null
      ? 'Current'
      : (versions.find(v => v.id === activeVersionId)?.name ?? 'Current');

  return (
    <div ref={dropdownRef} style={{position: 'relative'}}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
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
        {activeName}
        {versions.length > 0 && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#0A7CFF',
              flexShrink: 0,
            }}
          />
        )}
        <ChevronDownIcon width={14} height={14} style={{opacity: 0.5}} />
      </button>
      {isOpen && panelPos && (
        <div
          style={{
            position: 'fixed',
            top: panelPos.top,
            left: panelPos.left,
            width: 240,
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: 8,
            boxShadow:
              '0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
            zIndex: 9999,
            overflow: 'hidden',
          }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}>
            <span style={{fontSize: 12, fontWeight: 600, color: '#666'}}>
              Versions
            </span>
            <button
              onClick={handleSave}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#0A7CFF',
                fontWeight: 500,
                borderRadius: 4,
              }}>
              Save version
            </button>
          </div>
          {/* Current (live) */}
          <button
            onClick={() => {
              setActiveVersionId(null);
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background:
                activeVersionId == null ? 'rgba(10,124,255,0.06)' : 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
            }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor:
                  activeVersionId == null ? '#0A7CFF' : 'transparent',
                border: activeVersionId == null ? 'none' : '1px solid #ccc',
                flexShrink: 0,
              }}
            />
            <span style={{fontWeight: activeVersionId == null ? 600 : 400}}>
              Current
            </span>
            <span style={{fontSize: 11, color: '#999', marginLeft: 'auto'}}>
              live
            </span>
          </button>
          {/* Local versions */}
          {versions.filter(v => v.source === 'local').length > 0 && (
            <div
              style={{
                padding: '6px 12px 2px',
                fontSize: 10,
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
              Local
            </div>
          )}
          {versions
            .filter(v => v.source === 'local')
            .map(v => (
              <VersionRow
                key={v.id}
                version={v}
                isActive={activeVersionId === v.id}
                onClick={() => {
                  setActiveVersionId(v.id);
                  setIsOpen(false);
                }}
                detail={formatRelativeTime(v.timestamp)}
              />
            ))}
          {/* Git tag versions */}
          {versions.filter(v => v.source === 'git').length > 0 && (
            <div
              style={{
                padding: '6px 12px 2px',
                fontSize: 10,
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderTop:
                  versions.filter(v => v.source === 'local').length > 0
                    ? '1px solid rgba(0,0,0,0.08)'
                    : 'none',
              }}>
              Tagged
            </div>
          )}
          {versions
            .filter(v => v.source === 'git')
            .map(v => (
              <VersionRow
                key={v.id}
                version={v}
                isActive={activeVersionId === v.id}
                onClick={() => {
                  setActiveVersionId(v.id);
                  setIsOpen(false);
                }}
                detail={formatRelativeTime(v.timestamp)}
                subtitle={v.tag}
              />
            ))}
        </div>
      )}
    </div>
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
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  );
  const isEmbed = searchParams.get('embed') === '1';
  if (isEmbed) return <>{children}</>;
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [copied, setCopied] = useState(false);
  const {themeName, setThemeName, mode, setMode} = useThemeControls();
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navTree = useMemo(() => buildNavTree(pathname), [pathname]);

  const blockEntry = useMemo(
    () => blocksByHref.get(pathname.replace(/\/$/, '')) ?? null,
    [pathname],
  );
  const isBlock = blockEntry != null;

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'visible',
      }}>
      {/* Toolbar */}
      <div
        style={{
          display: toolbarHidden ? 'none' : 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderBottom: '1px solid var(--color-border-emphasized)',
          backgroundColor: 'var(--color-background-surface)',
          flexShrink: 0,
          zIndex: 1000,
          position: 'relative',
          overflow: 'visible',
        }}>
        <XDSButton
          variant="ghost"
          size="sm"
          label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          icon={<SidebarIcon width={14} height={14} />}
          onClick={() => setSidebarOpen(prev => !prev)}
          isIconOnly
        />
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

        {pathname.replace(/\/$/, '').endsWith('/pages/docsite') && (
          <VersionDropdown pathname={pathname} />
        )}

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

        {view === 'preview' && !isBlock && (
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
      {/* Body: sidebar + content */}
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: '1px solid var(--color-border-emphasized)',
              backgroundColor: 'var(--color-background-surface)',
              overflowY: 'auto',
              padding: '8px 0',
            }}>
            <XDSTreeList items={navTree} density="compact" />
          </div>
        )}

        {/* Content */}
        {view === 'preview' ? (
          isBlock ? (
            children
          ) : viewport !== 'desktop' ? (
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: '24px 16px',
                backgroundColor: '#f0f0f0',
              }}>
              <iframe
                src={`${pathname}?embed=1`}
                title={`${pageName} — ${viewport}`}
                style={{
                  width: viewportWidths[viewport],
                  maxWidth: '100%',
                  height: '100%',
                  border: '1px solid var(--color-border-emphasized)',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                overflow: 'auto',
              }}>
              {children}
            </div>
          )
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
    </div>
  );
}
