'use client';

import {useState} from 'react';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDivider} from '@xds/core';
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  CreditCardIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentIcon,
  ServerIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  container: {
    maxWidth: 960,
  },
  scenario: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scenarioInner: {
    padding: 16,
  },
  scenarioLabel: {
    padding: '8px 12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666',
  },
  flex1: {
    flex: 1,
    minWidth: 0,
  },
  sideNavContainer: {
    width: '100%',
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sideNavWithListContainer: {
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'auto',
  },
  navWrapper: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bgStripe: {
    background:
      'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,255,0.03) 3px, rgba(0,0,255,0.03) 4px)',
    backgroundSize: '100% 4px',
  },
  listInSidebar: {
    padding: '0 8px 8px',
  },
  resizable: {
    resize: 'horizontal',
    overflow: 'auto',
    minWidth: 200,
    maxWidth: '100%',
    borderRight: '3px solid #ccc',
    paddingRight: 8,
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const noop = () => {};

function ScenarioBox({
  label,
  verdict,
  resizable = true,
  children,
}: {
  label: string;
  verdict: string;
  resizable?: boolean;
  children: React.ReactNode;
}) {
  const inner = (
    <div {...stylex.props(styles.scenarioInner, styles.bgStripe)}>
      {children}
    </div>
  );

  return (
    <div {...stylex.props(styles.scenario)}>
      <div {...stylex.props(styles.scenarioLabel)}>
        {verdict} {label}
        {resizable && (
          <span style={{float: 'right', opacity: 0.5}}>
            ↔ drag right edge to resize
          </span>
        )}
      </div>
      {resizable ? (
        <div {...stylex.props(styles.resizable)}>{inner}</div>
      ) : (
        inner
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VerticalRhythmPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('tab1');
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [selector, setSelector] = useState<string | undefined>(undefined);

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={8}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Vertical Rhythm Audit</XDSHeading>
          <XDSText type="body" color="secondary">
            Visual testing of sizing compositions between 32px controls and 36px
            content rows. 4px grid lines shown in background. Drag the right
            edge of each scenario to resize and inspect how start/end content
            compresses.
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Size tokens: sm=28px, md=32px, lg=36px. Controls default to md
            (32px). List/menu/nav items land at 36px (8px pad + 20px text). All
            list items are interactive — hover to see visual boundaries.
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 1: Peer control alignment ─────────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>
            1. Peer Control Alignment (32px tier)
          </XDSHeading>
          <XDSText type="supporting" color="secondary">
            All controls at default md size should be the same height.
          </XDSText>

          <ScenarioBox
            label="Button + TextInput + Selector side by side"
            verdict="✅">
            <XDSHStack gap={2} vAlign="center">
              <XDSButton label="Submit" variant="primary" />
              <XDSTextInput
                label="Search"
                isLabelHidden
                placeholder="Search..."
                value={search}
                onChange={setSearch}
              />
              <XDSSelector
                label="Status"
                isLabelHidden
                options={['Active', 'Inactive', 'Pending']}
                value={selector}
                onChange={setSelector}
                placeholder="Status"
              />
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox label="Button + Tab row" verdict="✅">
            <XDSHStack gap={2} vAlign="center">
              <XDSTabList value={tab} onChange={setTab}>
                <XDSTab value="tab1" label="Overview" />
                <XDSTab value="tab2" label="Details" />
                <XDSTab value="tab3" label="Activity" />
              </XDSTabList>
              <XDSButton label="Add new" variant="primary" size="md" />
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox
            label="All three button sizes: sm (28) / md (32) / lg (36)"
            verdict="📏 Reference">
            <XDSHStack gap={2} vAlign="center">
              <XDSButton label="Small 28px" size="sm" />
              <XDSButton label="Medium 32px" size="md" />
              <XDSButton label="Large 36px" size="lg" />
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox
            label="Pagination buttons alongside regular buttons"
            verdict="✅">
            <XDSHStack gap={2} vAlign="center">
              <XDSPagination page={page} totalPages={10} onChange={setPage} />
              <XDSButton label="Export" variant="secondary" />
            </XDSHStack>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 2: Content row alignment ──────────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>
            2. Content Row Alignment (36px tier)
          </XDSHeading>
          <XDSText type="supporting" color="secondary">
            List items, menu items, and nav items all naturally land at 36px.
            Hover to see boundaries.
          </XDSText>

          <ScenarioBox
            label="ListItem (balanced) — single line rows"
            verdict="✅ 36px each">
            <XDSList>
              <XDSListItem label="Dashboard" onClick={noop} />
              <XDSListItem label="Settings" onClick={noop} />
              <XDSListItem label="Users" onClick={noop} />
            </XDSList>
          </ScenarioBox>

          <ScenarioBox
            label="ListItem (compact) — 28px rows matching sm controls"
            verdict="✅ 28px each">
            <XDSList density="compact">
              <XDSListItem label="Dashboard" onClick={noop} />
              <XDSListItem label="Settings" onClick={noop} />
              <XDSListItem label="Users" onClick={noop} />
            </XDSList>
          </ScenarioBox>

          <ScenarioBox
            label="ListItem (spacious) — taller rows"
            verdict="📏 ~45px each">
            <XDSList density="spacious">
              <XDSListItem label="Dashboard" onClick={noop} />
              <XDSListItem label="Settings" onClick={noop} />
              <XDSListItem label="Users" onClick={noop} />
            </XDSList>
          </ScenarioBox>

          <ScenarioBox
            label="DropdownMenu items (click to open)"
            verdict="✅ 36px per item">
            <XDSDropdownMenu
              button={{label: 'Actions', variant: 'secondary'}}
              items={[
                {label: 'Edit', onClick: noop},
                {label: 'Duplicate', onClick: noop},
                {label: 'Archive', onClick: noop},
              ]}
            />
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 3: Controls nested in content rows ────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>3. Controls Inside Content Rows</XDSHeading>
          <XDSText type="supporting" color="secondary">
            32px controls inside 36px content rows should have natural
            clearance. Hover rows to see boundary vs nested control.
          </XDSText>

          <ScenarioBox
            label="Button (md/32px) in ListItem endContent"
            verdict="✅ 2px clearance per side">
            <XDSList>
              <XDSListItem
                label="Notifications"
                onClick={noop}
                endContent={<XDSButton label="Configure" size="md" />}
              />
              <XDSListItem
                label="Privacy"
                onClick={noop}
                endContent={<XDSButton label="Edit" size="md" />}
              />
            </XDSList>
          </ScenarioBox>

          <ScenarioBox
            label="Button (sm/28px) in ListItem endContent"
            verdict="✅ More breathing room">
            <XDSList>
              <XDSListItem
                label="Notifications"
                onClick={noop}
                endContent={<XDSButton label="Configure" size="sm" />}
              />
              <XDSListItem
                label="Privacy"
                onClick={noop}
                endContent={<XDSButton label="Edit" size="sm" />}
              />
            </XDSList>
          </ScenarioBox>

          <ScenarioBox
            label="Badge inside Button endSlot"
            verdict="✅ Badge (20px) centered in 32px button">
            <XDSHStack gap={2} vAlign="center">
              <XDSButton label="Messages" endSlot={<XDSBadge label={3} />} />
              <XDSButton
                label="Alerts"
                variant="primary"
                endSlot={<XDSBadge label="New" />}
              />
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox
            label="Icon button in ListItem endContent"
            verdict="✅ 32px square in 36px row">
            <XDSList>
              <XDSListItem
                label="API Keys"
                onClick={noop}
                endContent={
                  <XDSButton
                    label="More options"
                    icon={<XDSIcon icon={EllipsisHorizontalIcon} />}
                    variant="ghost"
                    size="md"
                  />
                }
              />
              <XDSListItem
                label="Webhooks"
                onClick={noop}
                endContent={
                  <XDSButton
                    label="More options"
                    icon={<XDSIcon icon={EllipsisHorizontalIcon} />}
                    variant="ghost"
                    size="md"
                  />
                }
              />
            </XDSList>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 4: Cross-tier peer composition ────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>4. Cross-Tier Peer Composition</XDSHeading>
          <XDSText type="supporting" color="secondary">
            What happens when 32px controls and 36px content rows are side by
            side as peers.
          </XDSText>

          <ScenarioBox
            label="Button (lg/36px) alongside ListItem (balanced/36px)"
            verdict="✅ Escape hatch — both 36px">
            <XDSHStack gap={2} vAlign="start">
              <XDSButton label="Large action" variant="primary" size="lg" />
              <div {...stylex.props(styles.flex1)}>
                <XDSList>
                  <XDSListItem
                    label="Item aligned with lg button"
                    onClick={noop}
                  />
                </XDSList>
              </div>
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox
            label="Button (md/32px) next to ListItem (balanced/36px) — default mismatch"
            verdict="⚠️ 4px height difference">
            <XDSHStack gap={2} vAlign="start">
              <XDSButton label="Action" variant="primary" size="md" />
              <div {...stylex.props(styles.flex1)}>
                <XDSList>
                  <XDSListItem label="Item next to md button" onClick={noop} />
                </XDSList>
              </div>
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox
            label="Compact ListItem (28px) next to Button (sm/28px)"
            verdict="✅ Dense pairing">
            <XDSHStack gap={2} vAlign="start">
              <XDSButton label="Small" size="sm" />
              <div {...stylex.props(styles.flex1)}>
                <XDSList density="compact">
                  <XDSListItem
                    label="Compact item next to sm button"
                    onClick={noop}
                  />
                </XDSList>
              </div>
            </XDSHStack>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 5: Input inside list row ──────────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>5. Inline Editing Scenarios</XDSHeading>
          <XDSText type="supporting" color="secondary">
            TextInput/Selector placed inside list rows for inline editing.
            Resize to see how label and controls compress.
          </XDSText>

          <ScenarioBox
            label="TextInput (md/32px) in ListItem endContent"
            verdict="✅ Fits in 36px row">
            <XDSList>
              <XDSListItem
                label="Display Name"
                onClick={noop}
                endContent={
                  <XDSTextInput
                    label="Name"
                    isLabelHidden
                    placeholder="Enter name"
                    value={name}
                    onChange={setName}
                  />
                }
              />
              <XDSListItem
                label="Timezone"
                onClick={noop}
                endContent={
                  <XDSSelector
                    label="Zone"
                    isLabelHidden
                    options={['UTC', 'PST', 'EST', 'CET']}
                    value={selector}
                    onChange={setSelector}
                    placeholder="Select"
                  />
                }
              />
            </XDSList>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 6: Inline padding / text alignment ─────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>
            6. Inline Padding &amp; Text Alignment
          </XDSHeading>
          <XDSText type="supporting" color="secondary">
            Checking whether text start positions align when different
            components are stacked vertically.
          </XDSText>

          <ScenarioBox
            label="DropdownMenu container (4px) + item (8px) vs ListItem (12px)"
            verdict="✅ Both 12px from edge">
            <XDSVStack gap={4}>
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  Standalone List (12px paddingInline):
                </XDSText>
                <XDSList>
                  <XDSListItem label="Settings" onClick={noop} />
                  <XDSListItem label="Preferences" onClick={noop} />
                </XDSList>
              </XDSVStack>
              <XDSVStack gap={1}>
                <XDSText type="supporting" weight="bold">
                  DropdownMenu (open to compare item padding):
                </XDSText>
                <XDSDropdownMenu
                  button={{label: 'Menu', variant: 'secondary'}}
                  items={[
                    {label: 'Settings', onClick: noop},
                    {label: 'Preferences', onClick: noop},
                  ]}
                />
              </XDSVStack>
            </XDSVStack>
          </ScenarioBox>

          <ScenarioBox
            label="SideNavItem (8px pad) vs ListItem (12px pad) in same panel"
            verdict="⚠️ 4px text-start offset">
            <div {...stylex.props(styles.sideNavWithListContainer)}>
              <XDSSideNav>
                <XDSSideNavSection title="Navigation">
                  <XDSSideNavItem
                    label="Dashboard"
                    icon={HomeIcon}
                    isSelected
                  />
                  <XDSSideNavItem label="Analytics" icon={ChartBarIcon} />
                  <XDSSideNavItem label="Reports" icon={DocumentIcon} />
                </XDSSideNavSection>
              </XDSSideNav>
              <div {...stylex.props(styles.listInSidebar)}>
                <XDSText type="supporting" weight="bold" color="secondary">
                  List items in the same sidebar:
                </XDSText>
                <XDSList>
                  <XDSListItem label="Recent: Q4 Report" onClick={noop} />
                  <XDSListItem label="Recent: Team Metrics" onClick={noop} />
                  <XDSListItem label="Recent: API Usage" onClick={noop} />
                </XDSList>
              </div>
            </div>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 7: TopNav compositions ────────────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>7. TopNav Compositions</XDSHeading>
          <XDSText type="supporting" color="secondary">
            32px controls centered in 48px TopNav bar.
          </XDSText>

          <ScenarioBox
            label="TopNav with Button + TextInput in end slot"
            verdict="✅ 8px breathing room per side"
            resizable={false}>
            <div {...stylex.props(styles.navWrapper)}>
              <XDSTopNav
                label="App with search"
                heading={<XDSTopNavHeading heading="My App" />}
                startContent={
                  <>
                    <XDSTopNavItem label="Home" href="#" isSelected />
                    <XDSTopNavItem label="Projects" href="#" />
                  </>
                }
                endContent={
                  <>
                    <XDSTextInput
                      label="Search"
                      isLabelHidden
                      placeholder="Search..."
                      value={search}
                      onChange={setSearch}
                    />
                    <XDSButton
                      label="Settings"
                      icon={<XDSIcon icon={Cog6ToothIcon} />}
                      variant="ghost"
                    />
                  </>
                }
              />
            </div>
          </ScenarioBox>

          <ScenarioBox
            label="TopNav with Tabs in center + Button in end"
            verdict="✅ Tabs (32px) centered in 48px bar"
            resizable={false}>
            <div {...stylex.props(styles.navWrapper)}>
              <XDSTopNav
                label="Tab navigation"
                heading={<XDSTopNavHeading heading="Dashboard" />}
                centerContent={
                  <XDSTabList value={tab} onChange={setTab}>
                    <XDSTab value="tab1" label="Overview" />
                    <XDSTab value="tab2" label="Analytics" />
                    <XDSTab value="tab3" label="Reports" />
                  </XDSTabList>
                }
                endContent={
                  <XDSButton label="New Report" variant="primary" size="md" />
                }
              />
            </div>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 8: SideNav compositions ───────────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>8. SideNav Compositions</XDSHeading>
          <XDSText type="supporting" color="secondary">
            Nav items (36px) with nested children and varying density.
          </XDSText>

          <ScenarioBox
            label="Standard SideNav with sections"
            verdict="✅ Consistent 36px rows">
            <div {...stylex.props(styles.sideNavContainer)}>
              <XDSSideNav>
                <XDSSideNavSection title="Main">
                  <XDSSideNavItem
                    label="Dashboard"
                    icon={HomeIcon}
                    isSelected
                  />
                  <XDSSideNavItem label="Projects" icon={FolderIcon} />
                  <XDSSideNavItem label="Teams" icon={UsersIcon} />
                </XDSSideNavSection>
                <XDSSideNavSection title="Settings">
                  <XDSSideNavItem label="General" icon={Cog6ToothIcon} />
                  <XDSSideNavItem label="Integrations" icon={PuzzlePieceIcon} />
                  <XDSSideNavItem label="Billing" icon={CreditCardIcon} />
                </XDSSideNavSection>
              </XDSSideNav>
            </div>
          </ScenarioBox>

          <ScenarioBox
            label="SideNav items with endContent buttons"
            verdict="✅ sm icon buttons in 36px nav rows">
            <div {...stylex.props(styles.sideNavContainer)}>
              <XDSSideNav>
                <XDSSideNavSection title="Workspace">
                  <XDSSideNavItem
                    label="Projects"
                    icon={FolderIcon}
                    endContent={
                      <XDSButton
                        label="Add"
                        icon={<XDSIcon icon={PlusIcon} />}
                        variant="ghost"
                        size="sm"
                      />
                    }
                  />
                  <XDSSideNavItem
                    label="Teams"
                    icon={UsersIcon}
                    endContent={<XDSBadge label={5} />}
                  />
                  <XDSSideNavItem label="Settings" icon={Cog6ToothIcon} />
                </XDSSideNavSection>
              </XDSSideNav>
            </div>
          </ScenarioBox>
        </XDSVStack>

        <XDSDivider />

        {/* ── SECTION 9: Realistic compositions ─────────────────── */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>9. Realistic Compositions</XDSHeading>
          <XDSText type="supporting" color="secondary">
            How these elements actually compose in real app layouts. Resize to
            see how content reflows at narrow widths.
          </XDSText>

          <ScenarioBox
            label="Toolbar: Tabs + Search + Button + Dropdown"
            verdict="✅ All controls 32px">
            <XDSHStack gap={2} vAlign="center">
              <XDSTabList value={tab} onChange={setTab}>
                <XDSTab value="tab1" label="All" />
                <XDSTab value="tab2" label="Active" />
                <XDSTab value="tab3" label="Archived" />
              </XDSTabList>
              <div style={{flex: 1}} />
              <XDSTextInput
                label="Search"
                isLabelHidden
                placeholder="Filter..."
                value={search}
                onChange={setSearch}
              />
              <XDSDropdownMenu
                button={{label: 'Sort', variant: 'secondary'}}
                items={[
                  {label: 'Name A-Z', onClick: noop},
                  {label: 'Date created', onClick: noop},
                  {label: 'Last modified', onClick: noop},
                ]}
              />
              <XDSButton label="Create" variant="primary" />
            </XDSHStack>
          </ScenarioBox>

          <ScenarioBox
            label="List with mixed actions — buttons, badges, selectors"
            verdict="✅ 32px controls nested in 36px rows">
            <XDSList hasDividers>
              <XDSListItem
                label="Production"
                onClick={noop}
                startContent={<XDSIcon icon={ServerIcon} color="primary" />}
                endContent={<XDSBadge variant="success" label="Healthy" />}
              />
              <XDSListItem
                label="Staging"
                onClick={noop}
                startContent={<XDSIcon icon={ServerIcon} color="primary" />}
                endContent={<XDSBadge variant="warning" label="Degraded" />}
              />
              <XDSListItem
                label="Development"
                onClick={noop}
                startContent={<XDSIcon icon={ServerIcon} color="primary" />}
                endContent={
                  <XDSHStack gap={2} vAlign="center">
                    <XDSBadge variant="error" label="Down" />
                    <XDSButton label="Restart" size="sm" variant="primary" />
                  </XDSHStack>
                }
              />
            </XDSList>
          </ScenarioBox>

          <ScenarioBox
            label="Settings page: form controls + list in same view"
            verdict="✅ Controls 32px, list rows 36px">
            <XDSVStack gap={4}>
              <XDSHStack gap={2} vAlign="end">
                <div {...stylex.props(styles.flex1)}>
                  <XDSTextInput
                    label="Project Name"
                    value={name}
                    onChange={setName}
                    placeholder="My Project"
                  />
                </div>
                <XDSSelector
                  label="Visibility"
                  options={['Public', 'Private', 'Internal']}
                  value={selector}
                  onChange={setSelector}
                  placeholder="Choose"
                />
                <XDSButton label="Save" variant="primary" />
              </XDSHStack>
              <XDSDivider />
              <XDSVStack gap={2}>
                <XDSHeading level={3}>Team Members</XDSHeading>
                <XDSList hasDividers>
                  <XDSListItem
                    label="Alice Chen"
                    onClick={noop}
                    endContent={
                      <XDSButton label="Remove" size="sm" variant="ghost" />
                    }
                  />
                  <XDSListItem
                    label="Bob Park"
                    onClick={noop}
                    endContent={
                      <XDSButton label="Remove" size="sm" variant="ghost" />
                    }
                  />
                  <XDSListItem
                    label="Carol Wu"
                    onClick={noop}
                    endContent={
                      <XDSButton label="Remove" size="sm" variant="ghost" />
                    }
                  />
                </XDSList>
              </XDSVStack>
            </XDSVStack>
          </ScenarioBox>

          <ScenarioBox
            label="Pagination below a list"
            verdict="✅ 32px pagination below 36px rows">
            <XDSVStack gap={3}>
              <XDSList hasDividers>
                <XDSListItem label="Item 1" onClick={noop} />
                <XDSListItem label="Item 2" onClick={noop} />
                <XDSListItem label="Item 3" onClick={noop} />
              </XDSList>
              <XDSHStack gap={0} hAlign="center">
                <XDSPagination page={page} totalPages={10} onChange={setPage} />
              </XDSHStack>
            </XDSVStack>
          </ScenarioBox>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
