// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Divider} from '@astryxdesign/core/Divider';
import {Layout, LayoutContent, LayoutFooter} from '@astryxdesign/core/Layout';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import type {StatusDotVariant} from '@astryxdesign/core/StatusDot';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Stack, VStack, HStack} from '@astryxdesign/core/Stack';
import {
  SparklesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  UserIcon,
  BuildingOffice2Icon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

type Conversation = {
  label: string;
  status: StatusDotVariant;
  statusLabel: string;
};

type Workspace = {
  name: string;
  icon: IconType;
  chats: Conversation[];
};

const WORKSPACES: Workspace[] = [
  {
    name: 'Personal',
    icon: UserIcon,
    chats: [
      {
        label: 'Weekend trip planning',
        status: 'success',
        statusLabel: 'Active',
      },
      {
        label: 'Recipe ideas for the week',
        status: 'neutral',
        statusLabel: 'Idle',
      },
      {
        label: 'Book recommendations',
        status: 'warning',
        statusLabel: 'Needs review',
      },
      {label: 'Home workout plan', status: 'neutral', statusLabel: 'Idle'},
    ],
  },
  {
    name: 'Acme Corp',
    icon: BuildingOffice2Icon,
    chats: [
      {label: 'Q3 roadmap draft', status: 'accent', statusLabel: 'In progress'},
      {
        label: 'Customer onboarding flow',
        status: 'success',
        statusLabel: 'Active',
      },
      {
        label: 'Pricing strategy review',
        status: 'warning',
        statusLabel: 'Needs review',
      },
      {label: 'Standup summary', status: 'neutral', statusLabel: 'Idle'},
    ],
  },
  {
    name: 'Open Source',
    icon: CodeBracketIcon,
    chats: [
      {
        label: 'StyleX migration notes',
        status: 'accent',
        statusLabel: 'In progress',
      },
      {
        label: 'Skeleton loading states',
        status: 'success',
        statusLabel: 'Active',
      },
      {label: 'Accessibility audit', status: 'error', statusLabel: 'Blocked'},
      {label: 'Release notes v4.0', status: 'neutral', statusLabel: 'Idle'},
    ],
  },
];

const SELECTED_CHAT = 'StyleX migration notes';

const MESSAGES = [
  {role: 'user', lines: [280, 180]},
  {role: 'assistant', lines: [560, 520, 420, 300]},
  {role: 'user', lines: [200]},
  {role: 'assistant', lines: [540, 580, 360]},
];

function ConversationItem({
  label,
  status,
  statusLabel,
  isSelected,
}: {
  label: string;
  status: StatusDotVariant;
  statusLabel: string;
  isSelected?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showMenu = isHovered || isMenuOpen;

  return (
    <Stack
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <SideNavItem
        label={label}
        href="#"
        isSelected={isSelected}
        icon={<StatusDot variant={status} label={statusLabel} />}
        endContent={
          showMenu ? (
            <MoreMenu
              size="sm"
              label="Conversation options"
              hasAutoFocus={false}
              onOpenChange={setIsMenuOpen}
              items={[
                {label: 'Pin', onClick: () => {}},
                {label: 'Rename', onClick: () => {}},
                {label: 'Archive', onClick: () => {}},
                {label: 'Delete', onClick: () => {}},
              ]}
            />
          ) : undefined
        }
      />
    </Stack>
  );
}

export default function ShellAIChat() {
  return (
    <AppShell
      contentPadding={0}
      sideNav={
        <SideNav
          collapsible
          resizable={{defaultWidth: 300, minWidth: 220, maxWidth: 420}}
          header={
            <SideNavHeading
              heading="AI Assistant"
              icon={<NavIcon icon={<Icon icon={SparklesIcon} size="sm" />} />}
              headingHref="#"
            />
          }
          footer={
            <SideNavSection title="Account" isHeaderHidden>
              <SideNavItem label="Settings" icon={Cog6ToothIcon} href="#" />
              <SideNavItem label="Sarah Chen" icon={UserCircleIcon} href="#" />
            </SideNavSection>
          }>
          <SideNavSection title="Menu" isHeaderHidden>
            <SideNavItem label="New chat" icon={PlusIcon} href="#" />
            <SideNavItem label="Search" icon={MagnifyingGlassIcon} href="#" />
            <SideNavItem label="Library" icon={BookOpenIcon} href="#" />
          </SideNavSection>
          <Divider />
          <SideNavSection title="Workspaces" isHeaderHidden>
            {WORKSPACES.map(workspace => (
              <SideNavItem
                key={workspace.name}
                label={workspace.name}
                icon={workspace.icon}
                collapsible={{defaultIsCollapsed: false}}>
                <VStack gap={0.5}>
                  {workspace.chats.map(chat => (
                    <ConversationItem
                      key={chat.label}
                      label={chat.label}
                      status={chat.status}
                      statusLabel={chat.statusLabel}
                      isSelected={chat.label === SELECTED_CHAT}
                    />
                  ))}
                </VStack>
              </SideNavItem>
            ))}
          </SideNavSection>
        </SideNav>
      }>
      <Layout
        height="fill"
        contentWidth={768}
        content={
          <LayoutContent padding={6}>
            <VStack gap={8}>
              {MESSAGES.map((message, mi) =>
                message.role === 'assistant' ? (
                  <HStack key={mi} gap={3} vAlign="start">
                    <Skeleton
                      width={32}
                      height={32}
                      radius="rounded"
                      index={0}
                    />
                    <VStack gap={2}>
                      {message.lines.map((width, li) => (
                        <Skeleton
                          key={li}
                          width={width}
                          height={14}
                          radius={2}
                          index={li}
                        />
                      ))}
                    </VStack>
                  </HStack>
                ) : (
                  <HStack key={mi} hAlign="end">
                    <VStack gap={2} hAlign="end">
                      {message.lines.map((width, li) => (
                        <Skeleton
                          key={li}
                          width={width}
                          height={14}
                          radius={2}
                          index={li}
                        />
                      ))}
                    </VStack>
                  </HStack>
                ),
              )}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <Skeleton width="100%" height={56} radius={4} index={0} />
          </LayoutFooter>
        }
      />
    </AppShell>
  );
}
