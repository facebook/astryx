'use client';

import React, {useState} from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSTable} from '@xds/core/Table';
import {XDSTooltip} from '@xds/core/Tooltip';
import {ExternalLinkIcon, ContrastIcon, FullscreenIcon} from './docsite-icons';
import LogoNav, {XDS_LOGO_PLAIN} from './LogoNav';
import {SectionLabel} from './ProfileView';
import {COMPONENT_PREVIEWS} from './ComponentPreviews';
import {
  COMPONENT_CATEGORIES,
  getComponentName,
  getComponentDocs,
} from './docsview-data';

export function DocsView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (v: 'craft' | 'explore' | 'docs' | 'profile') => void;
}) {
  const [activeNav, setActiveNav] = useState('button');
  const [_showCode, _setShowCode] = useState(true);
  const [_activeRightNav, _setActiveRightNav] = useState('usage');
  const [selectedComponent, setSelectedComponent] = useState(
    null as string | null,
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column' as const,
          backgroundColor: 'var(--color-background-surface, #ffffff)',
          overflow: 'hidden',
        }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 8px 12px 8px',
            flexShrink: 0,
          }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{paddingLeft: 16}}>
              <LogoNav
                activeView={activeView}
                setActiveView={setActiveView}
                logo={XDS_LOGO_PLAIN}
              />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            padding: '0 16px 16px 16px',
          }}>
          <XDSList density="balanced">
            <XDSListItem
              label="Overview"
              isSelected={selectedComponent === null}
              onClick={() => setSelectedComponent(null)}
            />
            <XDSListItem
              label="Getting started"
              isSelected={
                selectedComponent !== null && activeNav === 'getting-started'
              }
              onClick={() => setActiveNav('getting-started')}
            />
          </XDSList>

          {COMPONENT_CATEGORIES.map(category => (
            <div key={category.label}>
              <SectionLabel label={category.label.toUpperCase()} />
              <XDSList density="balanced">
                {category.items.map(item => (
                  <XDSListItem
                    key={item.key}
                    label={item.name}
                    isSelected={
                      selectedComponent !== null && activeNav === item.key
                    }
                    onClick={() => {
                      setSelectedComponent(item.key);
                      setActiveNav(item.key);
                    }}
                  />
                ))}
              </XDSList>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '32px 40px',
        }}>
        {selectedComponent === null ? (
          <div style={{maxWidth: 1200, margin: '0 auto'}}>
            {/* Page header — hero banner */}
            <div
              style={{
                marginBottom: 48,
                backgroundColor:
                  'var(--color-background-accent-muted, #e3f2fd)',
                borderRadius: 24,
                padding: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 48,
                overflow: 'hidden',
                minHeight: 320,
              }}>
              <div style={{flex: 1, minWidth: 0}}>
                <XDSText type="supporting" color="secondary">
                  XDS Design System
                </XDSText>
                <div style={{marginTop: 8}}>
                  <XDSText type="display-1">Web overview</XDSText>
                </div>
                <div style={{marginTop: 16}}>
                  <XDSText type="large" color="secondary">
                    XDS Web React is an open-source UI library created by the
                    XDS Design Team to help developers quickly build beautiful,
                    accessible products.
                  </XDSText>
                </div>
                <div style={{marginTop: 24}}>
                  <XDSButton
                    label="Get started"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setSelectedComponent('getting-started');
                      setActiveNav('getting-started');
                    }}
                  />
                </div>
              </div>
              <div style={{flex: 1}} />
            </div>

            {/* Category sections */}
            {COMPONENT_CATEGORIES.map(category => (
              <div key={category.label} style={{marginBottom: 64}}>
                <div style={{marginBottom: 16}}>
                  <XDSText type="display-2">{category.label}</XDSText>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 32,
                  }}>
                  {category.items.map(item => (
                    <div
                      key={item.key}
                      onClick={() => {
                        setSelectedComponent(item.key);
                        setActiveNav(item.key);
                      }}
                      style={{cursor: 'pointer'}}>
                      <XDSCard
                        padding={0}
                        style={{
                          border: 'none',
                          boxShadow: 'none',
                          outline: 'none',
                        }}>
                        <div
                          style={{
                            height: 160,
                            backgroundColor:
                              'var(--color-background-muted, #c4cdd5)',
                            borderRadius: 12,
                          }}
                        />
                        <div style={{padding: '12px 0 0'}}>
                          <XDSText type="body" style={{fontWeight: 700}}>
                            {item.name}
                          </XDSText>
                          <div style={{marginTop: 0}}>
                            <XDSText type="body" color="secondary">
                              {item.desc}
                            </XDSText>
                          </div>
                        </div>
                      </XDSCard>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{maxWidth: 840, margin: '0 auto'}}>
            {/* Header */}
            <div style={{marginBottom: 8}}>
              <XDSText type="display-1">{getComponentName(activeNav)}</XDSText>
            </div>
            <div style={{marginBottom: 32}}>
              <XDSText type="supporting" color="secondary">
                March 30, 2026 · Updated 5:40 p.m. PST
              </XDSText>
            </div>

            {/* Live Preview Card */}
            <div
              style={{
                border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 48,
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom:
                    '1px solid var(--color-divider, rgba(0,0,0,0.08))',
                  backgroundColor: 'var(--color-background-surface, #ffffff)',
                }}>
                <XDSText type="supporting" weight="semibold" color="secondary">
                  Live preview
                </XDSText>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="Open in Craft"
                    variant="ghost"
                    size="sm"
                    icon={<ExternalLinkIcon />}
                    onClick={() => setActiveView('craft')}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Variants',
                      variant: 'ghost',
                      size: 'sm',
                    }}
                    hasChevron={false}
                    items={[
                      {label: 'Primary', onClick: () => {}},
                      {label: 'Secondary', onClick: () => {}},
                      {label: 'Ghost', onClick: () => {}},
                    ]}
                  />
                  <XDSButton
                    label="Toggle theme"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<ContrastIcon />}
                  />
                  <XDSButton
                    label="Fullscreen"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<FullscreenIcon />}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 280,
                  backgroundColor: 'var(--color-background-muted, #f5f5f5)',
                }}>
                {COMPONENT_PREVIEWS[activeNav] ?? (
                  <XDSText type="supporting" color="secondary">
                    Preview coming soon
                  </XDSText>
                )}
              </div>
            </div>

            {/* Description */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <XDSHeading level={3}>{docs.tagline}</XDSHeading>
                  <div style={{marginTop: 12}}>
                    <XDSText type="body">{docs.description}</XDSText>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSHeading level={4}>When to use</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSList density="compact" listStyle="disc">
                        {docs.whenToUse.map((item, i) => (
                          <XDSListItem key={i} label={item} />
                        ))}
                      </XDSList>
                    </div>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSHeading level={4}>When NOT to use</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSList density="compact" listStyle="disc">
                        {docs.whenNotToUse.map((item, i) => (
                          <XDSListItem key={i} label={item} />
                        ))}
                      </XDSList>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Anatomy */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <XDSHeading level={2}>Anatomy</XDSHeading>
                  <div
                    style={{
                      marginTop: 16,
                      height: 320,
                      backgroundColor: 'var(--color-background-muted, #f5f5f5)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <XDSText type="supporting" color="secondary">
                      Anatomy diagram
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSText type="body">
                      The {getComponentName(activeNav)} is composed of the
                      following elements. Required elements must always be
                      present, while optional elements can be included as
                      needed.
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSTable
                      data={
                        docs.anatomy as {[key: string]: unknown}[]
                      }
                      columns={[
                        {key: 'element', header: 'Element'},
                        {key: 'required', header: 'Required'},
                        {key: 'description', header: 'Description'},
                      ]}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
