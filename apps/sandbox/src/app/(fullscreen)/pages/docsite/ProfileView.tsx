'use client';

import {useState, useMemo} from 'react';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSPopover} from '@xds/core/Popover';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSGrid} from '@xds/core/Grid';
import {TEMPLATES, PROFILE_CRAFT_ITEMS, THEME_PICKER_ENTRIES} from './constants';
import {TemplateCard} from './TemplateCard';
import {SearchIcon, VerifiedIcon} from './docsite-icons';
import {AppTopNav} from './AppTopNav';
import {Cog6ToothIcon} from '@heroicons/react/24/outline';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

function CraftCard({src}: {src: string}) {
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      aspectRatio: '4 / 3',
      backgroundColor: 'var(--color-background-muted, #f0f0f0)',
    }}>
      <img
        src={src}
        alt=""
        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
      />
    </div>
  );
}

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

const PROFILE_TABS = ['Crafted', 'Used', 'Bookmarks'] as const;

export function ProfileView({activeView, setActiveView}: {activeView: 'craft' | 'explore' | 'docs' | 'profile'; setActiveView: (v: 'craft' | 'explore' | 'docs' | 'profile') => void}) {
  const [activeTab, setActiveTab] = useState<typeof PROFILE_TABS[number]>('Crafted');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [sendTo, setSendTo] = useState('clipboard');

  const filteredTemplates = useMemo(() => TEMPLATES.map((t, i) => ({...t, originalIndex: i})), []);

  const profileMetrics = useMemo(() => {
    const totalCrafts = PROFILE_CRAFT_ITEMS.length;
    const totalViews = PROFILE_CRAFT_ITEMS.reduce((sum, i) => sum + i.views, 0);
    const totalUses = PROFILE_CRAFT_ITEMS.reduce((sum, i) => sum + i.used, 0);
    const published = PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Published').length;
    return {totalCrafts, totalViews, totalUses, published};
  }, []);

  const masonryColumns = 5;

  return (
    <div style={{display: 'flex', flexDirection: 'column' as const, height: '100vh'}}>
      <AppTopNav activeView={activeView} setActiveView={setActiveView} activeTab="all" onActiveTabChange={() => setActiveView('craft')} />
      <div style={{flex: 1, overflowY: 'auto' as const, padding: '32px 24px 140px'}}>
        <style>{`
          @keyframes craftCardFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes boardHover { from { transform: scale(1); } to { transform: scale(1.02); } }
        `}</style>

        <div style={{maxWidth: 1400, margin: '0 auto'}}>
          {/* Profile header with metrics */}
          <div style={{marginBottom: 32}}>
            <XDSText type="display-1">Your crafts</XDSText>
            <XDSHStack gap={6} vAlign="center" style={{marginTop: 12}}>
              {[
                {label: 'Crafts', value: profileMetrics.totalCrafts},
                {label: 'Published', value: profileMetrics.published},
                {label: 'Views', value: profileMetrics.totalViews.toLocaleString()},
                {label: 'Uses', value: profileMetrics.totalUses.toLocaleString()},
              ].map(stat => (
                <XDSHStack key={stat.label} gap={1} vAlign="center">
                  <XDSText type="body" style={{fontWeight: 700, fontSize: 18}}>{stat.value}</XDSText>
                  <XDSText type="supporting" color="secondary">{stat.label}</XDSText>
                </XDSHStack>
              ))}
            </XDSHStack>
          </div>

          {/* Tab bar */}
          <XDSTabList value={activeTab} onChange={(v) => setActiveTab(v as typeof PROFILE_TABS[number])} hasDivider>
            {PROFILE_TABS.map(tab => (
              <XDSTab key={tab} value={tab} label={tab} />
            ))}
          </XDSTabList>

          {/* Actions row */}
          <XDSHStack gap={2} vAlign="center" style={{marginTop: 16, marginBottom: 20}}>
            <XDSButton label="Settings" variant="ghost" size="sm" isIconOnly icon={<Cog6ToothIcon style={{width: 18, height: 18}} />} onClick={() => setIsSettingsOpen(true)} />
            <XDSStackItem size="fill" />
            <XDSButton label="Create" variant="primary" size="sm" onClick={() => setActiveView('craft')} />
          </XDSHStack>

          {/* Card grid for Crafted tab */}
          {activeTab === 'Crafted' && (
            <XDSGrid minChildWidth={280} gap={6}>
              {PROFILE_CRAFT_ITEMS.map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    cursor: 'pointer',
                    animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                  }}>
                  <CraftCard src={item.img} />
                  <div style={{marginTop: 8, paddingInline: 2, paddingTop: 8, borderTop: '1px solid var(--color-border-emphasized, #e0e0e0)'}}>
                    <XDSText type="body" style={{fontWeight: 700}}>{item.name}</XDSText>
                    <XDSText type="supporting" color="secondary" display="block" style={{marginTop: 2}}>
                      {item.used} {item.used === 1 ? 'Use' : 'Uses'}{'  '}{timeAgo(item.lastUpdated)}
                    </XDSText>
                  </div>
                </div>
              ))}
            </XDSGrid>
          )}

          {/* Template grid for Used / Bookmarks tabs */}
          {(activeTab === 'Used' || activeTab === 'Bookmarks') && (
            <div style={{display: 'flex', gap: 16, alignItems: 'flex-start'}}>
              {Array.from({length: masonryColumns}, (_, colIdx) => {
                const colItems = filteredTemplates.filter((_, i) => i % masonryColumns === colIdx);
                return (
                  <div key={colIdx} style={{flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 16}}>
                    {colItems.map((template, i) => (
                      <div key={`${template.name}-${template.originalIndex}`} style={{borderRadius: 16, overflow: 'hidden', animation: `craftCardFadeIn 400ms ${(colIdx + i * masonryColumns) * 50}ms cubic-bezier(0.16, 1, 0.3, 1) both`, cursor: 'pointer'}}>
                        <TemplateCard src={template.src} name={template.name} isGenerating={false} cardSize={template.size} onUse={() => {}} onPreview={() => {}} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settings dialog */}
      <XDSDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <XDSDialogHeader title="Settings" onOpenChange={setIsSettingsOpen} />
        <div style={{padding: 24, maxHeight: '70vh', overflowY: 'auto' as const}}>
          <XDSVStack gap={6}>
            <div>
              <XDSHeading level={3} style={{marginBottom: 16}}>Theme preference</XDSHeading>
              {(['official', 'community'] as const).map(category => {
                const entries = THEME_PICKER_ENTRIES.filter(e => e.category === category);
                if (entries.length === 0) return null;
                return (
                  <div key={category} style={{marginBottom: 20}}>
                    <div style={{marginBottom: 8}}><XDSText type="supporting" color="secondary">{category.charAt(0).toUpperCase() + category.slice(1)}</XDSText></div>
                    <XDSGrid columns={4} gap={3}>
                      {entries.map(entry => {
                        const isSelected = selectedTheme === entry.key;
                        const p = entry.preview;
                        return (
                          <div key={entry.key} onClick={() => setSelectedTheme(entry.key)} style={{borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: isSelected ? '2px solid var(--color-accent, #0066FF)' : '1px solid var(--color-border-emphasized, #e0e0e0)', transition: 'border-color 0.15s ease'}}>
                            <XDSVStack>
                              <div style={{height: 80, backgroundColor: p.bg, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden'}}>
                                <XDSHStack gap={1} vAlign="center" style={{height: 14, backgroundColor: p.surface, borderBottom: `1px solid ${p.text}1A`, paddingInline: 8}}>
                                  <div style={{width: 5, height: 5, borderRadius: '50%', backgroundColor: p.accent}} />
                                  <div style={{width: 16, height: 2, borderRadius: 1, backgroundColor: p.text, opacity: 0.3}} />
                                </XDSHStack>
                                <XDSVStack gap={1} style={{flex: 1, padding: 8}}>
                                  <div style={{width: '65%', height: 4, borderRadius: 2, backgroundColor: p.text, opacity: 0.6}} />
                                  <div style={{width: '45%', height: 3, borderRadius: 1.5, backgroundColor: p.text, opacity: 0.25}} />
                                  <div style={{width: 28, height: 10, borderRadius: 4, backgroundColor: p.accent, marginTop: 'auto'}} />
                                </XDSVStack>
                              </div>
                              <div style={{padding: '8px 10px'}}>
                                <XDSText type="supporting" style={{fontWeight: isSelected ? 600 : 400}}>{entry.name}</XDSText>
                                {entry.description && <div style={{marginTop: 2}}><XDSText type="supporting" color="secondary">{entry.description}</XDSText></div>}
                              </div>
                            </XDSVStack>
                          </div>
                        );
                      })}
                    </XDSGrid>
                  </div>
                );
              })}
            </div>
            <XDSRadioList label="Send to" value={sendTo} onChange={setSendTo} description="Choose where templates and code are sent when you use them.">
              <XDSRadioListItem value="clipboard" label="Clipboard" description="Copy code to your clipboard" />
              <XDSRadioListItem value="vscode" label="VS Code" description="Open directly in VS Code" />
              <XDSRadioListItem value="github" label="GitHub" description="Create a new repo or gist" />
              <XDSRadioListItem value="download" label="Download" description="Save as a file to your device" />
            </XDSRadioList>
          </XDSVStack>
        </div>
      </XDSDialog>
    </div>
  );
}
