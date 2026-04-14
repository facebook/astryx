'use client';

import React, {useState} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';

import {
  PROFILE_USED_ITEMS,
  PROFILE_LIKED_ITEMS,
  PROFILE_COLLECTIONS,
  DUMMY_IMAGE,
} from './constants';
import {
  SearchIcon,
  ProfileIcon,
  PlusIcon,
  ChevronDownIcon,
  FolderIcon,
  DownloadIcon,
} from './docsite-icons';
import LogoNav from './LogoNav';

// ---------------------------------------------------------------------------
// Section Label Component (for DocsView sidebar)
// ---------------------------------------------------------------------------

export function SectionLabel({label}: {label: string}) {
  return (
    <div
      style={{
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '12px 8px 4px',
        margin: 0,
      }}>
      <XDSText type="supporting" weight="semibold" color="secondary">
        {label}
      </XDSText>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DialogPreview — stateful dialog preview for component previews
// ---------------------------------------------------------------------------

export function DialogPreview() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Dialog</XDSHeading>
      </div>
      <XDSButton
        label="Open Dialog"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSDialogHeader title="Example Dialog" onOpenChange={setIsOpen} />
        <div style={{padding: 16}}>
          <XDSText type="body">
            This is an example dialog. Dialogs are used to require user action
            or display important information that needs acknowledgment.
          </XDSText>
        </div>
      </XDSDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileView — user profile page
// ---------------------------------------------------------------------------

export function ProfileView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (v: 'craft' | 'explore' | 'docs' | 'profile') => void;
}) {
  const [profileTab, setProfileTab] = useState('used');
  const [expandedCollection, setExpandedCollection] = useState(null as string | null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* Top Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          flexShrink: 0,
        }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
          <XDSButton
            label="Search"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<SearchIcon />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<ProfileIcon />}
          />
        </div>
      </nav>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '40px 48px 64px',
        }}>
        <div style={{maxWidth: 800, margin: '0 auto'}}>
          {/* Profile Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 24,
            }}>
            <XDSAvatar name="Ruby Cheung" size="large" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face" />
            <div>
              <XDSHeading level={1}>Ruby Cheung</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Design Systems Engineer
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Joined March 2026
              </XDSText>
              <div style={{marginTop: 8}}>
                <XDSText type="supporting" color="secondary">
                  12 used · 8 liked · 3 collections
                </XDSText>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{marginBottom: 24}}>
            <XDSTabList value={profileTab} onChange={setProfileTab} size="sm">
              <XDSTab value="used" label="Used" />
              <XDSTab value="liked" label="Liked" />
              <XDSTab value="bookmarks" label="Bookmarks" />
              <XDSTab value="created" label="Created" />
            </XDSTabList>
          </div>

          {/* Tab Content: Used */}
          {profileTab === 'used' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
              {PROFILE_USED_ITEMS.map(item => (
                <XDSCard key={item.name}>
                  <div style={{padding: 0}}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        backgroundColor:
                          'var(--color-background-body, #f1f4f7)',
                        borderRadius: '8px 8px 0 0',
                      }}
                    />
                    <div style={{padding: 12}}>
                      <XDSText type="body">{item.name}</XDSText>
                      <XDSText type="supporting" color="secondary">
                        {item.lastUsed}
                      </XDSText>
                    </div>
                  </div>
                </XDSCard>
              ))}
            </div>
          )}

          {/* Tab Content: Liked */}
          {profileTab === 'liked' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
              {PROFILE_LIKED_ITEMS.map(item => (
                <XDSCard key={item.name}>
                  <div style={{padding: 0}}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        backgroundColor:
                          'var(--color-background-body, #f1f4f7)',
                        borderRadius: '8px 8px 0 0',
                      }}
                    />
                    <div style={{padding: 12}}>
                      <XDSText type="body">{item.name}</XDSText>
                      <XDSText type="supporting" color="secondary">
                        {item.lastUsed}
                      </XDSText>
                    </div>
                  </div>
                </XDSCard>
              ))}
            </div>
          )}

          {/* Tab Content: Bookmarks */}
          {profileTab === 'bookmarks' && (
            <div>
              <div style={{marginBottom: 16}}>
                <XDSButton
                  label="New collection"
                  variant="secondary"
                  icon={<PlusIcon />}>
                  New collection
                </XDSButton>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  marginBottom: 24,
                }}>
                {PROFILE_COLLECTIONS.map(collection => (
                  <XDSCard key={collection.name}>
                    <div style={{padding: 16}}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                        }}>
                        <FolderIcon width={20} height={20} />
                        <XDSText type="body">{collection.name}</XDSText>
                      </div>
                      <XDSText type="supporting" color="secondary">
                        {collection.count} items
                      </XDSText>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 4,
                          marginTop: 12,
                        }}>
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            style={{
                              aspectRatio: '1',
                              backgroundColor:
                                'var(--color-background-body, #f1f4f7)',
                              borderRadius: 4,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </XDSCard>
                ))}
              </div>

              {/* Expandable list */}
              {PROFILE_COLLECTIONS.map(collection => (
                <div key={collection.name} style={{marginBottom: 8}}>
                  <XDSButton
                    label={collection.name}
                    variant="ghost"
                    size="sm"
                    icon={
                      <ChevronDownIcon
                        style={{
                          transform:
                            expandedCollection === collection.name
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          transition: 'transform 200ms',
                        }}
                      />
                    }
                    onClick={() =>
                      setExpandedCollection(
                        expandedCollection === collection.name
                          ? null
                          : collection.name,
                      )
                    }>
                    {collection.name} ({collection.count})
                  </XDSButton>
                  {expandedCollection === collection.name && (
                    <div style={{paddingLeft: 32, paddingTop: 8}}>
                      {Array.from({length: collection.count}, (_, i) => (
                        <div key={i} style={{padding: '4px 0'}}>
                          <XDSText type="supporting" color="secondary">
                            Item {i + 1}
                          </XDSText>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Created */}
          {profileTab === 'created' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 16,
                }}>
                <XDSButton
                  label="Create new"
                  variant="secondary"
                  size="sm"
                  icon={<PlusIcon />}>
                  Create new
                </XDSButton>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 16,
                }}>
                {[
                  {
                    name: 'My Dashboard Theme',
                    type: 'Theme',
                    status: 'Published',
                    downloads: '342',
                    img: DUMMY_IMAGE,
                  },
                  {
                    name: 'Custom Login Template',
                    type: 'Template',
                    status: 'Published',
                    downloads: '128',
                    img: DUMMY_IMAGE,
                  },
                  {
                    name: 'Internal Tools Kit',
                    type: 'Template',
                    status: 'Draft',
                    downloads: '0',
                    img: DUMMY_IMAGE,
                  },
                ].map((item, i) => (
                  <XDSCard key={i} padding={0}>
                    <img
                      src={item.img}
                      alt={item.name}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{padding: '12px 16px'}}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}>
                        <XDSText type="body" weight="bold">
                          {item.name}
                        </XDSText>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}>
                        <XDSBadge
                          label={item.status}
                          variant={
                            item.status === 'Published' ? 'success' : 'neutral'
                          }
                        />
                        <XDSText type="supporting" color="secondary">
                          {item.type}
                        </XDSText>
                      </div>
                      {item.status === 'Published' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 4,
                          }}>
                          <DownloadIcon
                            width={14}
                            height={14}
                            style={{opacity: 0.4}}
                          />
                          <XDSText type="supporting" color="secondary">
                            {item.downloads} downloads
                          </XDSText>
                        </div>
                      )}
                    </div>
                  </XDSCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
