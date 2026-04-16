'use client';

import React, {useState, useMemo} from 'react';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSPopover} from '@xds/core/Popover';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSIcon} from '@xds/core/Icon';
import {XDSToken} from '@xds/core/Token';
import {XDSLink} from '@xds/core/Link';
import {TEMPLATES, PROFILE_CRAFT_ITEMS, THEME_PICKER_ENTRIES, FILTER_COLUMNS} from './constants';
import {TemplateCard} from './TemplateCard';
import {SparklesIcon, SearchIcon, PaletteIcon, ContrastIcon, MoonIcon, VerifiedIcon} from './docsite-icons';
import {AppTopNav} from './AppTopNav';
import {BookmarkIcon, Cog6ToothIcon, ClockIcon} from '@heroicons/react/24/outline';

export function DialogPreview() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div style={{marginBottom: 16}}><XDSHeading level={3}>Dialog</XDSHeading></div>
      <XDSButton label="Open Dialog" variant="primary" onClick={() => setIsOpen(true)} />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSDialogHeader title="Example Dialog" onOpenChange={setIsOpen} />
        <div style={{padding: 16}}>
          <XDSText type="body">This is an example dialog. Dialogs are used to require user action or display important information that needs acknowledgment.</XDSText>
        </div>
      </XDSDialog>
    </div>
  );
}

function SearchableFilterDropdown({label, items, selectedFilters, onToggle, verifiedItems}: {label: string; items: string[]; selectedFilters: Set<string>; onToggle: (item: string) => void; verifiedItems?: Set<string>}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
  return (
    <XDSPopover label={label} placement="below" alignment="start" width={280} isOpen={isOpen} onOpenChange={open => { setIsOpen(open); if (!open) setSearch(''); }}
      content={
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div tabIndex={0} style={{position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden'}} />
          <XDSTextInput label="Search" isLabelHidden placeholder={`Search ${label.toLowerCase()}...`} value={search} onChange={setSearch} size="lg" startIcon={SearchIcon} />
          <div style={{maxHeight: 280, overflowY: 'auto', margin: '0 -8px'}}>
            {filtered.length === 0 ? (
              <div style={{padding: '12px 16px'}}><XDSText type="body" color="secondary">No results</XDSText></div>
            ) : (
              <XDSList density="spacious">
                {filtered.map(item => (
                  <XDSListItem key={item} label={item} isSelected={selectedFilters.has(item)} onClick={() => onToggle(item)}
                    endContent={verifiedItems?.has(item) ? <XDSIcon icon={VerifiedIcon} size="sm" color="accent" /> : undefined} />
                ))}
              </XDSList>
            )}
          </div>
        </div>
      }>
      <XDSButton label={label} variant="ghost" size="sm" endContent={<XDSIcon icon="chevronDown" size="sm" color="inherit" />} />
    </XDSPopover>
  );
}

const NAV_ITEMS = [
  {label: 'Crafted', icon: SparklesIcon},
  {label: 'Used', icon: ClockIcon},
  {label: 'Bookmarks', icon: BookmarkIcon},
  {label: 'Settings', icon: Cog6ToothIcon},
];
const GRID_NAVS = ['Used', 'Bookmarks'] as const;

export function ProfileView({activeView, setActiveView}: {activeView: 'craft' | 'explore' | 'docs' | 'profile'; setActiveView: (v: 'craft' | 'explore' | 'docs' | 'profile') => void}) {
  const [activeNav, setActiveNav] = useState('Crafted');
  const [craftTypeFilter, setCraftTypeFilter] = useState('all');
  const [craftStatusFilter, setCraftStatusFilter] = useState('all');
  const craftTypeCounts = useMemo(() => ({
    template: PROFILE_CRAFT_ITEMS.filter(i => i.type === 'Template').length,
    theme: PROFILE_CRAFT_ITEMS.filter(i => i.type === 'Theme').length,
    component: PROFILE_CRAFT_ITEMS.filter(i => i.type === 'Component').length,
  }), []);
  const craftStatusCounts = useMemo(() => ({
    published: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Published').length,
    draft: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Draft').length,
    review: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'In Review').length,
  }), []);
  const filteredCraftItems = useMemo(() => {
    let items = PROFILE_CRAFT_ITEMS;
    if (craftTypeFilter !== 'all') items = items.filter(i => i.type === craftTypeFilter);
    if (craftStatusFilter !== 'all') items = items.filter(i => i.status === craftStatusFilter);
    return items;
  }, [craftTypeFilter, craftStatusFilter]);

  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [previewTheme, setPreviewTheme] = useState('default');
  const [sortOption, setSortOption] = useState('trending');
  const [resultFilters, setResultFilters] = useState<Set<string>>(() => new Set());
  const handleToggleResultFilter = (filter: string) => {
    setResultFilters(prev => { const next = new Set(prev); if (next.has(filter)) next.delete(filter); else next.add(filter); return next; });
  };
  const previewImageFilter = useMemo(() => {
    const filters: string[] = [];
    if (previewMode === 'dark') filters.push('invert(0.88)', 'hue-rotate(180deg)');
    const tf: Record<string, string> = {neutral: 'saturate(0.3)', brutalist: 'contrast(1.2) saturate(0.5)', meta: 'sepia(0.15) saturate(1.4) hue-rotate(200deg)', whatsapp: 'sepia(0.2) saturate(1.3) hue-rotate(100deg)'};
    if (tf[previewTheme]) filters.push(tf[previewTheme]);
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [previewMode, previewTheme]);
  const templateAuthors = useMemo(() => {
    const authors = Array.from(new Set(TEMPLATES.map(t => t.author)));
    return authors.sort((a, b) => { if (a === 'XDS Design') return -1; if (b === 'XDS Design') return 1; return a.localeCompare(b); });
  }, []);
  const filteredTemplates = useMemo(() => TEMPLATES.map((t, i) => ({...t, originalIndex: i})), []);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [sendTo, setSendTo] = useState('clipboard');

  return (
    <div style={{display: 'flex', flexDirection: 'column' as const, height: '100vh'}}>
      <AppTopNav activeView={activeView} setActiveView={setActiveView} activeTab="all" onActiveTabChange={() => setActiveView('craft')} />
      <div style={{flex: 1, display: 'flex', overflow: 'hidden'}}>
        <nav style={{width: 280, flexShrink: 0, height: '100%', overflowY: 'auto' as const, marginLeft: 8, marginRight: 8}}>
          <div style={{display: 'flex', flexDirection: 'column' as const}}>
            <div style={{padding: 16}}><XDSHeading level={2}>Profile</XDSHeading></div>
            <XDSList density="spacious">
              {NAV_ITEMS.map(item => (
                <XDSListItem key={item.label} label={item.label} startContent={<item.icon style={{width: 20, height: 20}} />} isSelected={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
              ))}
            </XDSList>
          </div>
        </nav>
        <div style={{flex: 1, overflowY: 'auto' as const, height: '100%', padding: '16px 24px 140px'}}>
          <style>{`
            @keyframes craftCardFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes craftTitleSlideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
          `}</style>

          {activeNav === 'Crafted' && (
            <div style={{maxWidth: 2000, margin: '0 auto'}}>
              <div style={{animation: 'craftTitleSlideIn 400ms cubic-bezier(0.16, 1, 0.3, 1)', marginBottom: 16}}>
                <XDSText type="display-1">Crafted</XDSText>
              </div>
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 8, animation: 'craftTitleSlideIn 400ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both'}}>
                {[{value: 'all', label: `All (${PROFILE_CRAFT_ITEMS.length})`}, {value: 'Template', label: `Templates (${craftTypeCounts.template})`}, {value: 'Theme', label: `Themes (${craftTypeCounts.theme})`}, {value: 'Component', label: `Components (${craftTypeCounts.component})`}].map(tab => (
                  <XDSButton key={tab.value} label={tab.label} variant={craftTypeFilter === tab.value ? 'primary' : 'secondary'} size="sm" onClick={() => setCraftTypeFilter(tab.value)} />
                ))}
                <XDSDivider orientation="vertical" />
                {[{value: 'all', label: 'All statuses'}, {value: 'Published', label: `Published (${craftStatusCounts.published})`}, {value: 'Draft', label: `Draft (${craftStatusCounts.draft})`}, {value: 'In Review', label: `In Review (${craftStatusCounts.review})`}].map(tab => (
                  <XDSButton key={tab.value} label={tab.label} variant={craftStatusFilter === tab.value ? 'primary' : 'secondary'} size="sm" onClick={() => setCraftStatusFilter(tab.value)} />
                ))}
              </div>
              <div style={{marginBottom: 16}}><XDSText type="supporting" color="secondary">{filteredCraftItems.length} of {PROFILE_CRAFT_ITEMS.length} items</XDSText></div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
                {filteredCraftItems.map((item, i) => (
                  <XDSCard key={item.name} padding={0} style={{overflow: 'hidden', animation: `craftCardFadeIn 400ms ${i * 50}ms cubic-bezier(0.16, 1, 0.3, 1) both`}}>
                    <div style={{aspectRatio: '16 / 9', overflow: 'hidden', backgroundColor: 'var(--color-background-muted, #f0f0f0)'}}>
                      <img src={item.img} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block'}} />
                    </div>
                    <div style={{padding: 16}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
                        <XDSText type="body" weight="bold">{item.name}</XDSText>
                        <span style={{fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, whiteSpace: 'nowrap' as const, flexShrink: 0,
                          backgroundColor: item.status === 'Published' ? '#ECFDF3' : item.status === 'In Review' ? '#FFFAEB' : '#F2F4F7',
                          color: item.status === 'Published' ? '#027A48' : item.status === 'In Review' ? '#B54708' : '#667085'}}>
                          {item.status}
                        </span>
                      </div>
                      <div style={{marginTop: 4}}><XDSText type="supporting" color="secondary">{item.description}</XDSText></div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 12}}>
                        <span style={{fontSize: 11, fontWeight: 500, padding: '1px 6px', borderRadius: 4, backgroundColor: 'var(--color-background-muted, #f0f0f0)', color: 'var(--color-text-secondary, #666)'}}>{item.type}</span>
                        <XDSText type="supporting" color="secondary">{item.used} uses</XDSText>
                        <XDSText type="supporting" color="secondary">{item.views} views</XDSText>
                        <div style={{marginLeft: 'auto'}}><XDSText type="supporting" color="secondary">{new Date(item.lastUpdated).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</XDSText></div>
                      </div>
                    </div>
                  </XDSCard>
                ))}
                {filteredCraftItems.length === 0 && <div style={{gridColumn: '1 / -1', padding: 32, textAlign: 'center' as const}}><XDSText type="body" color="secondary">No items match this filter.</XDSText></div>}
              </div>
            </div>
          )}

          {(GRID_NAVS as readonly string[]).includes(activeNav) && (
            <div style={{maxWidth: 2000, margin: '0 auto'}}>
              <div style={{animation: 'craftTitleSlideIn 400ms cubic-bezier(0.16, 1, 0.3, 1)', marginBottom: 16}}><XDSText type="display-1">{activeNav}</XDSText></div>
              <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4, marginBottom: 20, animation: 'craftTitleSlideIn 400ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8, marginRight: -8}}>
                  {FILTER_COLUMNS.map(col => <SearchableFilterDropdown key={col.heading} label={col.heading} items={col.items} selectedFilters={resultFilters} onToggle={handleToggleResultFilter} />)}
                  <SearchableFilterDropdown label="Author" items={templateAuthors} selectedFilters={resultFilters} onToggle={handleToggleResultFilter} verifiedItems={new Set(['XDS Design'])} />
                  <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16}}>
                    <XDSText type="supporting" color="secondary" style={{whiteSpace: 'nowrap'}}>Showing {filteredTemplates.length} screens</XDSText>
                    <XDSToolbar label="View controls" density="compact" startContent={<>
                      <XDSButton label={previewMode === 'dark' ? 'Light mode' : 'Dark mode'} variant="ghost" size="sm" isIconOnly icon={previewMode === 'dark' ? <ContrastIcon /> : <MoonIcon />} onClick={() => setPreviewMode(previewMode === 'dark' ? 'light' : 'dark')} />
                      <XDSDropdownMenu button={{label: 'Theme', variant: 'ghost', size: 'sm', isIconOnly: true, icon: <PaletteIcon />}} hasChevron={false} menuWidth={160}
                        items={[{label: 'Default', onClick: () => setPreviewTheme('default')}, {label: 'Neutral', onClick: () => setPreviewTheme('neutral')}, {label: 'Brutalist', onClick: () => setPreviewTheme('brutalist')}, {label: 'Meta', onClick: () => setPreviewTheme('meta')}, {label: 'WhatsApp', onClick: () => setPreviewTheme('whatsapp')}]} />
                    </>} />
                    <XDSDropdownMenu button={{label: sortOption === 'trending' ? 'Trending' : sortOption === 'newest' ? 'Newest first' : 'Oldest first', variant: 'ghost', size: 'sm'}}
                      items={[{label: 'Trending', onClick: () => setSortOption('trending')}, {label: 'Newest first', onClick: () => setSortOption('newest')}, {label: 'Oldest first', onClick: () => setSortOption('oldest')}]} />
                  </div>
                </div>
                {resultFilters.size > 0 && (
                  <div style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
                    {Array.from(resultFilters).map(f => <XDSToken key={f} label={f} size="sm" onRemove={() => handleToggleResultFilter(f)} />)}
                    <XDSText type="supporting"><XDSLink label="Clear all" color="secondary" onClick={() => setResultFilters(new Set())}>Clear all</XDSLink></XDSText>
                  </div>
                )}
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, gridAutoRows: '1fr'}}>
                {filteredTemplates.map((template, i) => (
                  <div key={`${template.name}-${template.originalIndex}`} style={{animation: `craftCardFadeIn 400ms ${i * 50}ms cubic-bezier(0.16, 1, 0.3, 1) both`, filter: previewImageFilter, transition: 'filter 300ms ease'}}>
                    <TemplateCard src={template.src} name={template.name} isGenerating={false} cardSize={template.size} onUse={() => {}} onPreview={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'Settings' && (
            <div style={{maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: 24}}>
              <XDSHeading level={2}>Settings</XDSHeading>
              <div>
                <XDSHeading level={3} style={{marginBottom: 16}}>Theme preference</XDSHeading>
                {(['official', 'community'] as const).map(category => {
                  const entries = THEME_PICKER_ENTRIES.filter(e => e.category === category);
                  if (entries.length === 0) return null;
                  return (
                    <div key={category} style={{marginBottom: 20}}>
                      <div style={{marginBottom: 8}}><XDSText type="supporting" color="secondary">{category.charAt(0).toUpperCase() + category.slice(1)}</XDSText></div>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}>
                        {entries.map(entry => {
                          const isSelected = selectedTheme === entry.key;
                          const p = entry.preview;
                          return (
                            <div key={entry.key} onClick={() => setSelectedTheme(entry.key)} style={{borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: isSelected ? '2px solid var(--color-accent, #0066FF)' : '1px solid var(--color-border-emphasized, #e0e0e0)', transition: 'border-color 0.15s ease'}}>
                              <div style={{height: 80, backgroundColor: p.bg, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden'}}>
                                <div style={{height: 14, backgroundColor: p.surface, borderBottom: `1px solid ${p.text}1A`, display: 'flex', alignItems: 'center', paddingInline: 8, gap: 4}}>
                                  <div style={{width: 5, height: 5, borderRadius: '50%', backgroundColor: p.accent}} />
                                  <div style={{width: 16, height: 2, borderRadius: 1, backgroundColor: p.text, opacity: 0.3}} />
                                </div>
                                <div style={{flex: 1, padding: 8, display: 'flex', flexDirection: 'column' as const, gap: 5}}>
                                  <div style={{width: '65%', height: 4, borderRadius: 2, backgroundColor: p.text, opacity: 0.6}} />
                                  <div style={{width: '45%', height: 3, borderRadius: 1.5, backgroundColor: p.text, opacity: 0.25}} />
                                  <div style={{width: 28, height: 10, borderRadius: 4, backgroundColor: p.accent, marginTop: 'auto'}} />
                                </div>
                              </div>
                              <div style={{padding: '8px 10px'}}>
                                <XDSText type="supporting" style={{fontWeight: isSelected ? 600 : 400}}>{entry.name}</XDSText>
                                {entry.description && <div style={{marginTop: 2}}><XDSText type="supporting" color="secondary">{entry.description}</XDSText></div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <XDSHeading level={3} style={{marginBottom: 16}}>Send to</XDSHeading>
                <XDSText type="supporting" color="secondary" display="block" style={{marginBottom: 12}}>Choose where templates and code are sent when you use them.</XDSText>
                <div style={{display: 'flex', flexDirection: 'column' as const, gap: 0}}>
                  {([
                    {key: 'clipboard', label: 'Clipboard', description: 'Copy code to your clipboard'},
                    {key: 'vscode', label: 'VS Code', description: 'Open directly in VS Code'},
                    {key: 'github', label: 'GitHub', description: 'Create a new repo or gist'},
                    {key: 'download', label: 'Download', description: 'Save as a file to your device'},
                  ] as const).map((option, i, arr) => (
                    <React.Fragment key={option.key}>
                      <div onClick={() => setSendTo(option.key)} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', cursor: 'pointer'}}>
                        <div>
                          <XDSText type="body" weight={sendTo === option.key ? 'semibold' : 'normal'} display="block">{option.label}</XDSText>
                          <XDSText type="supporting" color="secondary" display="block">{option.description}</XDSText>
                        </div>
                        <div style={{width: 20, height: 20, borderRadius: '50%', border: sendTo === option.key ? '6px solid var(--color-accent, #0066FF)' : '2px solid var(--color-border-emphasized, #ccc)', transition: 'border 0.15s ease', flexShrink: 0}} />
                      </div>
                      {i < arr.length - 1 && <XDSDivider />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
