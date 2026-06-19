// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  XDSVStack,
  XDSHStack,
  XDSStack,
  XDSStackItem,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSlider} from '@xds/core/Slider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSPopover} from '@xds/core/Popover';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Styles — width constraints + reduced motion demo primitive
// =============================================================================

const styles = stylex.create({
  pageContainer: {
    maxWidth: 960,
    paddingInline: spacingVars['--spacing-6'],
    paddingBlock: spacingVars['--spacing-6'],
  },
  maxW300: {
    maxWidth: 300,
  },
  maxW220: {
    maxWidth: 220,
  },
  textInputItem: {
    maxWidth: 300,
  },
  ballLane: {
    position: 'relative',
    height: 48,
    paddingBlock: spacingVars['--spacing-2'],
  },
  ball: {
    width: 32,
    height: 32,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent'],
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transform: 'translateX(0)',
  },
  ballEnd: {
    transform: 'translateX(280px)',
  },
  ballReduced: {
    transitionDuration: '0ms',
  },
});

// =============================================================================
// Navigation & Overlays
// =============================================================================

function NavigationOverlaysCard() {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <XDSCard>
        <XDSVStack gap={4}>
          <XDSText type="label" display="block">
            Navigation & Overlays
          </XDSText>
          <XDSVStack gap={2}>
            <XDSText type="supporting" color="secondary" display="block">
              Modal — backdrop fade and content entry · duration-medium-max
            </XDSText>
            <XDSHStack gap={2}>
              <XDSButton
                label="Open modal"
                onClick={() => setModalOpen(true)}
              />
            </XDSHStack>
          </XDSVStack>
        </XDSVStack>
      </XDSCard>
      <XDSDialog isOpen={modalOpen} onOpenChange={setModalOpen} width={420}>
        <XDSLayout
          header={
            <XDSLayoutHeader hasDivider padding={4}>
              <XDSHeading level={3}>Confirm action</XDSHeading>
            </XDSLayoutHeader>
          }
          content={
            <XDSLayoutContent padding={4}>
              <XDSText type="body" color="secondary">
                The dialog uses the active theme&apos;s motion tokens for entry
                and dismiss. Backdrop and content animate together.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider padding={4}>
              <XDSHStack gap={2}>
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                />
                <XDSButton
                  label="Confirm"
                  variant="primary"
                  onClick={() => setModalOpen(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

// =============================================================================
// Micro-Interactions
// =============================================================================

function PopoverDemoContent() {
  return (
    <XDSCard variant="transparent" padding={3} maxWidth={220}>
      <XDSVStack gap={1}>
        <XDSText type="label">Popover</XDSText>
        <XDSText type="supporting" color="secondary">
          Uses duration-fast-max. Fades and translates toward the trigger.
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}

function HoverCardDemoContent() {
  return (
    <XDSCard variant="transparent" padding={3} maxWidth={220}>
      <XDSVStack gap={1}>
        <XDSText type="label">HoverCard</XDSText>
        <XDSText type="supporting" color="secondary">
          Hover to trigger · duration-fast-max
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}

function MicroInteractionsCard() {
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(true);
  const [check1, setCheck1] = React.useState(false);
  const [check2, setCheck2] = React.useState(true);
  const [check3, setCheck3] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [selectorValue, setSelectorValue] = React.useState('Apple');
  const [emailValue, setEmailValue] = React.useState('ted@example.com');
  const [showStatus, setShowStatus] = React.useState(false);

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Micro-Interactions
        </XDSText>

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Buttons — hover, press, focus · duration-fast · Dropdown ·
            duration-fast-max
          </XDSText>
          <XDSHStack gap={2} wrap="wrap">
            <XDSButton label="Primary" variant="primary" onClick={() => {}} />
            <XDSButton
              label="Secondary"
              variant="secondary"
              onClick={() => {}}
            />
            <XDSButton label="Ghost" variant="ghost" onClick={() => {}} />
            <XDSButton
              label="Destructive"
              variant="destructive"
              onClick={() => {}}
            />
            <XDSDropdownMenu
              button={{label: 'Dropdown', variant: 'secondary'}}
              items={[
                {label: 'Edit', onClick: () => {}},
                {label: 'Duplicate', onClick: () => {}},
                {type: 'divider'},
                {label: 'Delete', onClick: () => {}},
              ]}
            />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Popover · HoverCard · Tooltip — fade + translate · duration-fast-max
            · direction-aware
          </XDSText>
          <XDSHStack gap={2} vAlign="center" wrap="wrap">
            <XDSPopover
              content={<PopoverDemoContent />}
              placement="below"
              hasCloseButton={false}>
              <XDSButton label="Below" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSPopover
              content={<PopoverDemoContent />}
              placement="above"
              hasCloseButton={false}>
              <XDSButton label="Above" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSPopover
              content={<PopoverDemoContent />}
              placement="end"
              hasCloseButton={false}>
              <XDSButton label="End" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSPopover
              content={<PopoverDemoContent />}
              placement="start"
              hasCloseButton={false}>
              <XDSButton label="Start" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSHoverCard content={<HoverCardDemoContent />} placement="below">
              <XDSButton label="HoverCard" variant="secondary" size="sm" />
            </XDSHoverCard>
            <XDSTooltip content="Tooltip · duration-fast-max">
              <XDSButton label="Tooltip" variant="secondary" size="sm" />
            </XDSTooltip>
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Switches — thumb slide, track color · duration-fast
          </XDSText>
          <XDSHStack gap={4}>
            <XDSSwitch
              label="Notifications"
              value={switch1}
              onChange={setSwitch1}
            />
            <XDSSwitch label="Sync" value={switch2} onChange={setSwitch2} />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Checkboxes — check transition · duration-fast
          </XDSText>
          <XDSHStack gap={6}>
            <XDSCheckboxInput
              label="Option A"
              value={check1}
              onChange={setCheck1}
            />
            <XDSCheckboxInput
              label="Option B"
              value={check2}
              onChange={setCheck2}
            />
            <XDSCheckboxInput
              label="Option C"
              value={check3}
              onChange={setCheck3}
            />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Slider — thumb travel · duration-fast · value tooltip ·
            duration-fast-min
          </XDSText>
          <XDSSlider
            label="Volume"
            value={sliderValue}
            onChange={setSliderValue}
            min={0}
            max={100}
            xstyle={styles.maxW300}
          />
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Input validation — status message entry · duration-fast-max
          </XDSText>
          <XDSHStack gap={3} vAlign="end">
            <XDSStackItem size="fill" xstyle={styles.textInputItem}>
              <XDSTextInput
                label="Email"
                value={emailValue}
                onChange={setEmailValue}
                placeholder="Enter email..."
                status={
                  showStatus
                    ? {type: 'success', message: 'Email verified'}
                    : undefined
                }
              />
            </XDSStackItem>
            <XDSButton
              label={showStatus ? 'Clear' : 'Validate'}
              variant={showStatus ? 'ghost' : 'secondary'}
              onClick={() => setShowStatus(v => !v)}
            />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Selector — open/close, chevron rotation · duration-fast-max
          </XDSText>
          <XDSSelector
            label="Fruit"
            options={['Apple', 'Banana', 'Orange', 'Mango']}
            value={selectorValue}
            onChange={setSelectorValue}
            xstyle={styles.maxW220}
          />
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Loading & Status
// =============================================================================

function LoadingStatusCard() {
  const [progressValue, setProgressValue] = React.useState(65);

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Loading & Status
        </XDSText>

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Spinners — continuous rotation · duration-medium-max
          </XDSText>
          <XDSHStack gap={4} vAlign="center">
            <XDSSpinner size="sm" />
            <XDSSpinner size="md" />
            <XDSSpinner size="lg" />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Skeletons — pulsing opacity with stagger · duration-medium-max
          </XDSText>
          <XDSVStack gap={2}>
            <XDSHStack gap={3} vAlign="center">
              <XDSSkeleton width={40} height={40} radius="rounded" index={0} />
              <XDSStackItem size="fill">
                <XDSVStack gap={1}>
                  <XDSSkeleton width={160} height={14} index={1} />
                  <XDSSkeleton width={100} height={10} index={2} />
                </XDSVStack>
              </XDSStackItem>
            </XDSHStack>
            <XDSSkeleton width="100%" height={12} index={3} />
            <XDSSkeleton width="80%" height={12} index={4} />
            <XDSSkeleton width="60%" height={12} index={5} />
          </XDSVStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Progress — determinate: duration-medium · indeterminate: continuous
          </XDSText>
          <XDSVStack gap={3}>
            <XDSProgressBar value={progressValue} label={`${progressValue}%`} />
            <XDSHStack gap={2}>
              {[0, 25, 50, 75, 100].map(v => (
                <XDSButton
                  key={v}
                  label={`${v}%`}
                  variant="ghost"
                  size="sm"
                  onClick={() => setProgressValue(v)}
                />
              ))}
            </XDSHStack>
          </XDSVStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Status dots — continuous pulse · 2s loop
          </XDSText>
          <XDSHStack gap={4} vAlign="center">
            <XDSHStack gap={2} vAlign="center">
              <XDSStatusDot variant="success" label="Online" isPulsing />
              <XDSText type="body">Online</XDSText>
            </XDSHStack>
            <XDSHStack gap={2} vAlign="center">
              <XDSStatusDot variant="warning" label="Away" isPulsing />
              <XDSText type="body">Away</XDSText>
            </XDSHStack>
            <XDSHStack gap={2} vAlign="center">
              <XDSStatusDot variant="error" label="Busy" isPulsing />
              <XDSText type="body">Busy</XDSText>
            </XDSHStack>
          </XDSHStack>
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Surface Interactions
// =============================================================================

function SurfaceInteractionsCard() {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Surface Interactions
        </XDSText>

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            Tabs — color, active indicator · duration-fast
          </XDSText>
          <XDSTabList value={activeTab} onChange={setActiveTab}>
            <XDSTab value="overview" label="Overview" />
            <XDSTab value="analytics" label="Analytics" />
            <XDSTab value="reports" label="Reports" />
            <XDSTab value="settings" label="Settings" />
          </XDSTabList>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            List items — background hover · duration-fast-min
          </XDSText>
          <XDSList density="balanced" hasDividers>
            <XDSListItem
              label="Dashboard"
              description="View your metrics"
              onClick={() => {}}
            />
            <XDSListItem
              label="Projects"
              description="Manage active projects"
              onClick={() => {}}
            />
            <XDSListItem
              label="Settings"
              description="Configure preferences"
              onClick={() => {}}
            />
          </XDSList>
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Reduced Motion
// =============================================================================

function ReducedMotionCard() {
  const [simulateReduced, setSimulateReduced] = React.useState(false);
  const [moved, setMoved] = React.useState(false);

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Reduced Motion
        </XDSText>

        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" display="block">
            
            Honor the OS-level prefers-reduced-motion setting; replace movement
            with instant state changes. Toggle the switch to simulate.
          </XDSText>
          <XDSVStack gap={3}>
            <XDSStack xstyle={styles.ballLane}>
              <XDSStack
                xstyle={[
                  styles.ball,
                  moved && styles.ballEnd,
                  simulateReduced && styles.ballReduced,
                ]}
              />
            </XDSStack>
            <XDSHStack gap={3} vAlign="center">
              <XDSButton
                label={moved ? 'Reset' : 'Move'}
                variant="primary"
                size="sm"
                onClick={() => setMoved(m => !m)}
              />
              <XDSSwitch
                label="Simulate reduced motion"
                value={simulateReduced}
                onChange={setSimulateReduced}
              />
            </XDSHStack>
          </XDSVStack>
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function MotionExamplesPage() {
  return (
    <XDSVStack gap={6} xstyle={styles.pageContainer}>
      <XDSVStack gap={2}>
        <XDSHeading level={1}>Motion Examples</XDSHeading>
        <XDSText type="body" color="secondary">
          How XDS components apply duration and easing tokens. Each section
          calls out which tokens drive the motion so you can see the scale in
          action.
        </XDSText>
      </XDSVStack>

      <XDSVStack gap={4}>
        <NavigationOverlaysCard />
        <MicroInteractionsCard />
        <LoadingStatusCard />
        <SurfaceInteractionsCard />
        <ReducedMotionCard />
      </XDSVStack>
    </XDSVStack>
  );
}
