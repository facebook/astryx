'use client';

import React, {useState, useMemo} from 'react';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {
  TEMPLATES,
  PROFILE_COLLECTIONS,
  PROFILE_CRAFT_ITEMS,
  AVATAR_IMAGE,
} from './constants';
import {SparklesIcon, UploadIcon} from './docsite-icons';
import {AppTopNav} from './AppTopNav';
import {
  UserIcon,
  BookmarkIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

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
// Sidebar nav config
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  {label: 'Profile', icon: UserIcon},
  {label: 'Craft', icon: SparklesIcon},
  {label: 'Bookmarks', icon: BookmarkIcon},
  {label: 'Templates', icon: Squares2X2Icon},
  {label: 'Settings', icon: Cog6ToothIcon},
];

// ---------------------------------------------------------------------------
// ProfileView — sidebar layout
// ---------------------------------------------------------------------------

export function ProfileView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (v: 'craft' | 'explore' | 'docs' | 'profile') => void;
}) {
  const [activeNav, setActiveNav] = useState('Profile');
  const [craftStatusFilter, setCraftStatusFilter] = useState('all');

  const craftStatusCounts = useMemo(
    () => ({
      published: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Published')
        .length,
      draft: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Draft').length,
      review: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'In Review').length,
    }),
    [],
  );

  const filteredCraftItems = useMemo(() => {
    if (craftStatusFilter === 'all') return PROFILE_CRAFT_ITEMS;
    return PROFILE_CRAFT_ITEMS.filter(
      item => item.status === craftStatusFilter,
    );
  }, [craftStatusFilter]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #fafafa)',
      }}>
      <AppTopNav
        activeView={activeView}
        setActiveView={setActiveView}
        activeTab="all"
        onActiveTabChange={() => setActiveView('craft')}
      />

      <div style={{flex: 1, display: 'flex', overflow: 'hidden'}}>
        {/* Sidebar */}
        <nav
          style={{
            width: 280,
            flexShrink: 0,
            paddingTop: 24,
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 24,
            borderRight:
              '1px solid var(--color-divider, #e5e5e5)',
            height: '100%',
            overflowY: 'auto' as const,
            backgroundColor: 'var(--color-background-body, #fff)',
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 20,
            }}>
            {/* Avatar + identity */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px 4px',
              }}>
              <XDSAvatar name="Alex Morgan" size="large" src={AVATAR_IMAGE} />
              <div style={{textAlign: 'center' as const}}>
                <XDSHeading level={3}>Alex Morgan</XDSHeading>
                <div style={{marginTop: 2}}>
                  <XDSText type="supporting" color="secondary">
                    alex.morgan@example.com
                  </XDSText>
                </div>
              </div>
            </div>

            <XDSDivider />

            {/* Nav items */}
            <XDSList density="spacious">
              {NAV_ITEMS.map(item => (
                <XDSListItem
                  key={item.label}
                  label={item.label}
                  startContent={
                    <item.icon style={{width: 20, height: 20}} />
                  }
                  isSelected={activeNav === item.label}
                  onClick={() => setActiveNav(item.label)}
                />
              ))}
            </XDSList>

            <XDSDivider />

            {/* Compact stats */}
            <div style={{padding: '0 16px'}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                <div style={{textAlign: 'center' as const}}>
                  <div style={{fontSize: 20, fontWeight: 700, lineHeight: 1}}>
                    {PROFILE_CRAFT_ITEMS.length}
                  </div>
                  <XDSText type="supporting" color="secondary">
                    Projects
                  </XDSText>
                </div>
                <div style={{textAlign: 'center' as const}}>
                  <div style={{fontSize: 20, fontWeight: 700, lineHeight: 1}}>
                    559
                  </div>
                  <XDSText type="supporting" color="secondary">
                    Uses
                  </XDSText>
                </div>
                <div style={{textAlign: 'center' as const}}>
                  <div style={{fontSize: 20, fontWeight: 700, lineHeight: 1}}>
                    12
                  </div>
                  <XDSText type="supporting" color="secondary">
                    Sessions
                  </XDSText>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            height: '100%',
          }}>
          <div
            style={{
              maxWidth: 900,
              padding: '24px 48px 64px',
              margin: '0 auto',
            }}>
            {/* ── Profile panel ── */}
            {activeNav === 'Profile' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 24,
                }}>
                <XDSHeading level={2}>Profile</XDSHeading>

                {/* Banner card */}
                <div
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    position: 'relative' as const,
                    background:
                      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                  }}>
                  <div style={{padding: '40px 32px 28px'}}>
                    <XDSAvatar
                      name="Alex Morgan"
                      size="large"
                      src={AVATAR_IMAGE}
                    />
                    <div style={{marginTop: 16}}>
                      <XDSText type="display-2">Alex Morgan</XDSText>
                    </div>
                    <div style={{marginTop: 4}}>
                      <XDSText type="body" color="secondary">
                        alex.morgan@example.com
                      </XDSText>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        marginTop: 12,
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                        <SparklesIcon
                          width={14}
                          height={14}
                          style={{color: '#888'}}
                        />
                        <XDSText type="supporting" color="secondary">
                          @alexmorgan
                        </XDSText>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                        <span style={{fontSize: 13, color: '#888'}}>
                          &#9679;
                        </span>
                        <XDSText type="supporting" color="secondary">
                          San Francisco
                        </XDSText>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                        <span style={{fontSize: 13, color: '#888'}}>
                          &#9679;
                        </span>
                        <XDSText type="supporting" color="secondary">
                          Joined Mar 2025
                        </XDSText>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      position: 'absolute' as const,
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}>
                    <XDSButton
                      label="Edit background"
                      variant="secondary"
                      size="sm"
                      icon={<UploadIcon width={14} height={14} />}
                    />
                  </div>
                </div>

                {/* Quick stats row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                  }}>
                  {[
                    {
                      label: 'Projects',
                      value: PROFILE_CRAFT_ITEMS.length,
                      change: '+1',
                    },
                    {label: 'Uses', value: 559, change: '↑12%'},
                    {label: 'Sessions', value: 12, change: '↑23%'},
                  ].map(stat => (
                    <XDSCard key={stat.label}>
                      <div style={{textAlign: 'center' as const}}>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 700,
                            lineHeight: 1,
                          }}>
                          {stat.value}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            marginTop: 6,
                          }}>
                          <XDSText type="supporting" color="secondary">
                            {stat.label}
                          </XDSText>
                          <span
                            style={{
                              color: '#2D8A4E',
                              fontSize: 11,
                              fontWeight: 600,
                            }}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </XDSCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── Craft panel ── */}
            {activeNav === 'Craft' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 20,
                }}>
                <XDSHeading level={2}>My Craft</XDSHeading>

                {/* Status filter pills */}
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap' as const,
                  }}>
                  {[
                    {
                      value: 'all',
                      label: `All (${PROFILE_CRAFT_ITEMS.length})`,
                    },
                    {
                      value: 'Published',
                      label: `Published (${craftStatusCounts.published})`,
                    },
                    {
                      value: 'Draft',
                      label: `Draft (${craftStatusCounts.draft})`,
                    },
                    {
                      value: 'In Review',
                      label: `In Review (${craftStatusCounts.review})`,
                    },
                  ].map(tab => (
                    <XDSButton
                      key={tab.value}
                      label={tab.label}
                      variant={
                        craftStatusFilter === tab.value
                          ? 'primary'
                          : 'secondary'
                      }
                      size="sm"
                      onClick={() => setCraftStatusFilter(tab.value)}
                    />
                  ))}
                </div>

                {/* Craft items grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16,
                  }}>
                  {filteredCraftItems.map(item => (
                    <XDSCard key={item.name} padding={0}>
                      <div
                        style={{
                          aspectRatio: '16 / 9',
                          overflow: 'hidden',
                          backgroundColor:
                            'var(--color-background-muted, #f0f0f0)',
                        }}>
                        <img
                          src={item.img}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top',
                            display: 'block',
                          }}
                        />
                      </div>
                      <div style={{padding: 16}}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}>
                          <XDSText type="body" weight="bold">
                            {item.name}
                          </XDSText>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              whiteSpace: 'nowrap' as const,
                              flexShrink: 0,
                              backgroundColor:
                                item.status === 'Published'
                                  ? '#ECFDF3'
                                  : item.status === 'In Review'
                                    ? '#FFFAEB'
                                    : '#F2F4F7',
                              color:
                                item.status === 'Published'
                                  ? '#027A48'
                                  : item.status === 'In Review'
                                    ? '#B54708'
                                    : '#667085',
                            }}>
                            {item.status}
                          </span>
                        </div>
                        <div style={{marginTop: 4}}>
                          <XDSText type="supporting" color="secondary">
                            {item.type}
                          </XDSText>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            marginTop: 12,
                          }}>
                          <XDSText type="supporting" color="secondary">
                            {item.used} uses
                          </XDSText>
                          <XDSText type="supporting" color="secondary">
                            {item.views} views
                          </XDSText>
                          <div style={{marginLeft: 'auto'}}>
                            <XDSText type="supporting" color="secondary">
                              {new Date(item.lastUpdated).toLocaleDateString(
                                'en-US',
                                {month: 'short', day: 'numeric'},
                              )}
                            </XDSText>
                          </div>
                        </div>
                      </div>
                    </XDSCard>
                  ))}
                  {filteredCraftItems.length === 0 && (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        padding: 32,
                        textAlign: 'center' as const,
                      }}>
                      <XDSText type="body" color="secondary">
                        No items match this filter.
                      </XDSText>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Bookmarks panel ── */}
            {activeNav === 'Bookmarks' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 20,
                }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <XDSHeading level={2}>Bookmarks</XDSHeading>
                  <XDSButton
                    label="New collection"
                    variant="secondary"
                    size="sm"
                    icon={
                      <span style={{fontSize: 16, lineHeight: 1}}>+</span>
                    }
                    isIconOnly
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                  }}>
                  {PROFILE_COLLECTIONS.map(collection => (
                    <div key={collection.name} style={{cursor: 'pointer'}}>
                      <div
                        style={{
                          aspectRatio: '4/3',
                          backgroundColor:
                            'var(--color-background-muted, #f0f0f0)',
                          borderRadius: 12,
                          marginBottom: 8,
                        }}
                      />
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: 6,
                          marginBottom: 8,
                        }}>
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            style={{
                              aspectRatio: '1',
                              backgroundColor:
                                'var(--color-background-muted, #f0f0f0)',
                              borderRadius: 8,
                            }}
                          />
                        ))}
                      </div>
                      <div style={{textAlign: 'center' as const}}>
                        <XDSText type="body" weight="semibold">
                          {collection.name}
                        </XDSText>
                        <div style={{marginTop: 0}}>
                          <XDSText type="supporting" color="secondary">
                            {collection.count} items
                          </XDSText>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Templates panel ── */}
            {activeNav === 'Templates' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 20,
                }}>
                <XDSHeading level={2}>Recent Templates</XDSHeading>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                  }}>
                  {TEMPLATES.slice(0, 6).map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      style={{
                        borderRadius: 14,
                        overflow: 'hidden',
                        border: '1px solid var(--color-divider, #eee)',
                        cursor: 'pointer',
                        backgroundColor:
                          'var(--color-background-body, #fff)',
                      }}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '4/3',
                          overflow: 'hidden',
                        }}>
                        <img
                          src={item.src}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top',
                            display: 'block',
                          }}
                        />
                      </div>
                      <div style={{padding: '10px 12px'}}>
                        <XDSText type="supporting" weight="bold">
                          {item.name}
                        </XDSText>
                        <div style={{marginTop: 2}}>
                          <XDSText type="supporting" color="secondary">
                            {item.author}
                          </XDSText>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Settings panel ── */}
            {activeNav === 'Settings' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 24,
                }}>
                <XDSHeading level={2}>Settings</XDSHeading>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: 0,
                  }}>
                  {[
                    {
                      label: 'Display name',
                      value: 'Alex Morgan',
                      action: 'Edit',
                    },
                    {
                      label: 'Email',
                      value: 'alex.morgan@example.com',
                      action: 'Edit',
                    },
                    {
                      label: 'Username',
                      value: '@alexmorgan',
                      action: 'Edit',
                    },
                    {label: 'Location', value: 'San Francisco', action: 'Edit'},
                    {label: 'Theme', value: 'Default', action: 'Change'},
                  ].map(row => (
                    <React.Fragment key={row.label}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          padding: '16px 0',
                        }}>
                        <div>
                          <XDSText type="body" weight="semibold" display="block">
                            {row.label}
                          </XDSText>
                          <XDSText
                            type="supporting"
                            color="secondary"
                            display="block">
                            {row.value}
                          </XDSText>
                        </div>
                        <XDSButton
                          label={row.action}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                      <XDSDivider />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
