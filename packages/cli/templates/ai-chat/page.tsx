'use client';

import React, {useState} from 'react';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {XDSButton} from '@xds/core/Button';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  HomeIcon,
  FolderIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CubeIcon,
  Cog6ToothIcon,
  SparklesIcon as HeroSparklesIcon,
  PencilIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';

// ============= ICONS (inline SVG for portability) =============

function SparklesIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-primary, #5B5BD6)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
    </svg>
  );
}

function WritingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  );
}

function CodingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ResearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CreativeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-7 7c0 3.5 2.5 6 4 7.5.5.5 1 1 1 1.5v2h4v-2c0-.5.5-1 1-1.5 1.5-1.5 4-4 4-7.5a7 7 0 0 0-7-7z" />
      <path d="M10 22h4" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function AtomIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <circle cx="12" cy="12" r="1" />
      <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
      <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />
    </svg>
  );
}

// Mode options for the dropdown
const MODE_OPTIONS = [
  {key: 'auto', label: 'Auto', icon: HeroSparklesIcon},
  {key: 'writing', label: 'Writing', icon: PencilIcon},
  {key: 'coding', label: 'Coding', icon: CodeBracketIcon},
  {key: 'research', label: 'Research', icon: MagnifyingGlassIcon},
  {key: 'creative', label: 'Creative', icon: PaintBrushIcon},
  {key: 'sensitive', label: 'Sensitive', icon: ShieldCheckIcon},
  {key: 'deep', label: 'Deep Mode', icon: CpuChipIcon},
] as const;

function MicIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function AtSignIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

// ============= SIDENAV =============

function AIChatSideNav() {
  const [active, setActive] = useState('dashboard');
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
          headingHref="/"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected={active === 'dashboard'}
          onClick={() => setActive('dashboard')}
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          isSelected={active === 'projects'}
          onClick={() => setActive('projects')}
          endContent={<XDSBadge label="3" />}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
        <XDSSideNavItem
          label="Team"
          icon={UserGroupIcon}
          isSelected={active === 'team'}
          onClick={() => setActive('team')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem
          label="All Documents"
          icon={DocumentTextIcon}
          isSelected={active === 'documents'}
          onClick={() => setActive('documents')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// ============= MAIN COMPONENT =============

export default function AIChatTemplate() {
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState('auto');
  const activeMode = MODE_OPTIONS.find(m => m.key === mode) ?? MODE_OPTIONS[0];

  return (
    <XDSAppShell sideNav={<AIChatSideNav />} variant="elevated">
      <XDSVStack
        gap={5}
        style={{
          maxWidth: 720,
          margin: '0 auto',
          paddingTop: 'min(20vh, 200px)',
          paddingBottom: 48,
          paddingInline: 24,
          minHeight: '100%',
          justifyContent: 'center',
        }}>
        {/* Greeting */}
        <XDSVStack gap={1}>
          <XDSHStack gap={2} vAlign="center">
            <SparklesIcon />
            <XDSText type="large" weight="semibold">
              Hi, Kenton
            </XDSText>
          </XDSHStack>
          <XDSHeading level={1}>Where should we start?</XDSHeading>
        </XDSVStack>

        {/* Composer */}
        <XDSChatComposer
          onSubmit={() => {}}
          placeholder="Ask anything"
          input={<XDSChatComposerInput style={{minHeight: '44px'}} />}
          headerActions={
            <>
              <XDSButton
                label="Mention"
                variant="ghost"
                size="sm"
                icon={<AtSignIcon />}
                isIconOnly
              />
              <XDSButton
                label="Attach"
                variant="ghost"
                size="sm"
                icon={<PaperclipIcon />}
                isIconOnly
              />
            </>
          }
          footerActions={
            <>
              <XDSDropdownMenu
                button={{
                  label: activeMode.label,
                  variant: 'ghost',
                  size: 'md',
                  icon: <AtomIcon />,
                  children: activeMode.label,
                }}
                items={MODE_OPTIONS.map(opt => ({
                  label: opt.label,
                  icon: opt.icon,
                  onClick: () => setMode(opt.key),
                }))}
              />
              <XDSDropdownMenu
                button={{
                  label: 'Settings',
                  variant: 'ghost',
                  size: 'md',
                  icon: <Cog6ToothIcon style={{width: 16, height: 16}} />,
                  children: 'Settings',
                }}
                items={[
                  {label: 'Preferences', onClick: () => {}},
                  {label: 'Keyboard shortcuts', onClick: () => {}},
                  {label: 'About', onClick: () => {}},
                ]}
              />
            </>
          }
          sendActions={
            <XDSButton
              label="Voice input"
              variant="ghost"
              size="md"
              icon={<MicIcon />}
              isIconOnly
            />
          }
        />

        {/* Category toggle buttons */}
        <XDSHStack gap={2} style={{flexWrap: 'wrap'}}>
          <XDSToggleButton
            label="Writing"
            icon={<WritingIcon />}
            isPressed={selected === 'writing'}
            onPressedChange={() =>
              setSelected(prev => (prev === 'writing' ? null : 'writing'))
            }
          />
          <XDSToggleButton
            label="Coding"
            icon={<CodingIcon />}
            isPressed={selected === 'coding'}
            onPressedChange={() =>
              setSelected(prev => (prev === 'coding' ? null : 'coding'))
            }
          />
          <XDSToggleButton
            label="Research"
            icon={<ResearchIcon />}
            isPressed={selected === 'research'}
            onPressedChange={() =>
              setSelected(prev => (prev === 'research' ? null : 'research'))
            }
          />
          <XDSToggleButton
            label="Creative"
            icon={<CreativeIcon />}
            isPressed={selected === 'creative'}
            onPressedChange={() =>
              setSelected(prev => (prev === 'creative' ? null : 'creative'))
            }
          />
        </XDSHStack>
      </XDSVStack>
    </XDSAppShell>
  );
}
