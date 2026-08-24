// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file page.tsx
 * @position Mobile Interaction Prototypes — a gallery of interactive mobile
 *   prototypes for the component migration table. Lives under
 *   Components & Patterns. Each card opens a full-screen 375px device view so
 *   design can communicate the expected mobile interactions to engineering.
 * @input ?p=<id> selects a prototype (deep-linkable)
 * @output Gallery + device-framed prototype viewer
 */

'use client';

import {useEffect, useMemo, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {
  SideNav,
  SideNavItem,
  SideNavHeading,
  SideNavSection,
} from '@astryxdesign/core/SideNav';

const styles = stylex.create({
  nav: {height: '100%', flexShrink: 0},
});

import {useThemeControls, SANDBOX_THEMES} from '../../../providers';
import {PROTOTYPES, type Prototype, type PrototypeCategory} from './prototypes';
import {PhoneFrame, TabletFrame, ChevronRight} from './primitives';

const CATEGORIES: PrototypeCategory[] = ['Blocks migration', 'Enhancement'];

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeControls() {
  const {themeName, setThemeName, mode, setMode} = useThemeControls();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 2px',
      }}>
      <div style={{flex: 1, minWidth: 0}}>
        <DropdownMenu
          button={{
            label:
              SANDBOX_THEMES.find(t => t.id === themeName)?.label ?? themeName,
            variant: 'ghost',
            size: 'sm',
          }}
          hasChevron
          items={SANDBOX_THEMES.map(({id, label}) => ({
            label,
            onClick: () => setThemeName(id),
          }))}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        label={mode === 'light' ? 'Switch to dark' : 'Switch to light'}
        icon={mode === 'light' ? <SunIcon /> : <MoonIcon />}
        onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      />
    </div>
  );
}

function CategoryBadge({category}: {category: PrototypeCategory}) {
  return category === 'Blocks migration' ? (
    <Badge label="Blocks migration" variant="error" />
  ) : (
    <Badge label="Enhancement" variant="info" />
  );
}

function Gallery({onSelect}: {onSelect: (id: string) => void}) {
  return (
    <div style={{flex: 1, minWidth: 0, overflowY: 'auto'}}>
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '28px 20px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
        <Heading level={1}>Mobile Interaction Prototypes</Heading>
        <div style={{maxWidth: 680}}>
          <Text type="body" color="secondary">
            Interactive prototypes of the expected mobile behavior for each
            component in the migration table. Tap a card to open it in a phone
            frame — everything is interactive (tap triggers, drag sheets down to
            dismiss). Use the theme and light/dark controls in the sidebar to
            sanity-check across themes.
          </Text>
        </div>

        {CATEGORIES.map(cat => {
          const items = PROTOTYPES.filter(p => p.category === cat);
          return (
            <section
              key={cat}
              style={{
                marginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <CategoryBadge category={cat} />
                <Text type="supporting">{items.length} components</Text>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))',
                  gap: 12,
                }}>
                {items.map(p => (
                  <ClickableCard
                    key={p.id}
                    label={p.name}
                    onClick={() => onSelect(p.id)}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}>
                        <Text type="body" weight="semibold">
                          {p.name}
                        </Text>
                        <ChevronRight
                          width={16}
                          height={16}
                          style={{
                            color: 'var(--color-icon-secondary)',
                            flexShrink: 0,
                          }}
                        />
                      </div>
                      <Text type="supporting" maxLines={3}>
                        {p.change}
                      </Text>
                    </div>
                  </ClickableCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <path d="M3 9.5L12 3l9 6.5" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </svg>
  );
}

function NavRail({
  currentId,
  onSelect,
  onHome,
}: {
  currentId: string;
  onSelect: (id: string) => void;
  onHome: () => void;
}) {
  const isHome = currentId === '';
  return (
    <SideNav
      xstyle={styles.nav}
      header={<SideNavHeading heading="Mobile Prototypes" />}
      footer={<ThemeControls />}>
      <SideNavItem
        label="Overview"
        icon={HomeIcon}
        isSelected={isHome}
        onClick={onHome}
      />
      {CATEGORIES.map(cat => (
        <SideNavSection key={cat} title={cat} isHeaderHidden>
          {PROTOTYPES.filter(p => p.category === cat).map(p => (
            <SideNavItem
              key={p.id}
              label={p.name}
              isSelected={p.id === currentId}
              onClick={() => onSelect(p.id)}
            />
          ))}
        </SideNavSection>
      ))}
    </SideNav>
  );
}

function Detail({prototype}: {prototype: Prototype}) {
  const {Demo, Analysis} = prototype;
  const showTablet = prototype.showTablet ?? false;
  const TabletDemo = prototype.TabletDemo ?? Demo;
  const tabletCaption = prototype.tabletCaption ?? 'Tablet';
  const tabletTall = prototype.tabletTall ?? false;
  const AltDemo = prototype.AltDemo;
  const AltTabletDemo = prototype.AltTabletDemo ?? AltDemo;
  const altCaption = prototype.altCaption ?? 'Phone · 390px';
  const altTabletCaption = prototype.altTabletCaption ?? 'Tablet';
  return (
    <div style={{flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex'}}>
      {/* Info panel */}
      <div
        style={{
          width: 320,
          maxWidth: '32%',
          flexShrink: 0,
          borderRight: '1px solid var(--color-border-emphasized)',
          padding: '24px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--color-background-surface)',
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
          }}>
          <Heading level={2}>{prototype.name}</Heading>
          <CategoryBadge category={prototype.category} />
        </div>
        {prototype.features ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <Text type="label">Features</Text>
            {prototype.features.map(f => (
              <div
                key={f.title}
                style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Text type="body" weight="semibold">
                  {f.title}
                </Text>
                <Text type="supporting" color="secondary">
                  {f.description}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              <Text type="label">Change</Text>
              <Text type="body" color="secondary">
                {prototype.change}
              </Text>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              <Text type="label">Interaction to build</Text>
              <Text type="body" color="secondary">
                {prototype.interaction}
              </Text>
            </div>
          </>
        )}
      </div>

      {/* Device stage */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          background:
            'radial-gradient(circle at 50% 30%, var(--color-background-surface), var(--color-background-body))',
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            padding: 24,
            minHeight: Analysis ? undefined : '100%',
            justifyContent: Analysis ? 'flex-start' : 'center',
          }}>
          {/* key forces a fresh mount per prototype so demo state resets */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
            }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}>
              <Text type="supporting">Phone · 390px</Text>
              <PhoneFrame key={`${prototype.id}-phone`}>
                <Demo />
              </PhoneFrame>
            </div>
            {showTablet && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  flex: '1 1 520px',
                  minWidth: 0,
                  maxWidth: 900,
                }}>
                <Text type="supporting">{tabletCaption}</Text>
                <TabletFrame key={`${prototype.id}-tablet`} tall={tabletTall}>
                  <TabletDemo />
                </TabletFrame>
              </div>
            )}
          </div>
          {AltDemo && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                paddingTop: 8,
                marginTop: 8,
                borderTop: '1px solid var(--color-border-emphasized)',
              }}>
              {prototype.altLabel && (
                <div style={{alignSelf: 'flex-start', maxWidth: 820}}>
                  <Text type="large" weight="semibold">
                    {prototype.altLabel}
                  </Text>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: 40,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  width: '100%',
                }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <Text type="supporting">{altCaption}</Text>
                  <PhoneFrame key={`${prototype.id}-alt-phone`}>
                    <AltDemo />
                  </PhoneFrame>
                </div>
                {showTablet && AltTabletDemo && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      flex: '1 1 520px',
                      minWidth: 0,
                      maxWidth: 900,
                    }}>
                    <Text type="supporting">{altTabletCaption}</Text>
                    <TabletFrame key={`${prototype.id}-alt-tablet`}>
                      <AltTabletDemo />
                    </TabletFrame>
                  </div>
                )}
              </div>
            </div>
          )}
          {Analysis && (
            <div style={{width: '100%', maxWidth: 820, paddingBottom: 24}}>
              <Analysis />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MobilePrototypesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Read deep link on mount (client only, avoids useSearchParams Suspense need).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p');
    if (p && PROTOTYPES.some(x => x.id === p)) {
      setSelectedId(p);
    }
  }, []);

  const select = (id: string | null) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set('p', id);
    } else {
      url.searchParams.delete('p');
    }
    window.history.replaceState(null, '', url.toString());
  };

  const index = useMemo(
    () => PROTOTYPES.findIndex(p => p.id === selectedId),
    [selectedId],
  );
  const selected = index >= 0 ? PROTOTYPES[index] : null;

  // Arrow keys flip through prototypes (ignored while typing in a demo input).
  useEffect(() => {
    if (!selected) {
      return undefined;
    }
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight' && index < PROTOTYPES.length - 1) {
        select(PROTOTYPES[index + 1].id);
      } else if (e.key === 'ArrowLeft' && index > 0) {
        select(PROTOTYPES[index - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, index]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-background-body)',
        color: 'var(--color-text-primary)',
      }}>
      <NavRail
        currentId={selectedId ?? ''}
        onSelect={select}
        onHome={() => select(null)}
      />
      {selected ? (
        <Detail prototype={selected} />
      ) : (
        <Gallery onSelect={select} />
      )}
    </div>
  );
}
