// Copyright (c) Meta Platforms, Inc. and affiliates.
"use client";

import {useState, useRef} from "react";
import * as stylex from "@stylexjs/stylex";
import {XDSVStack, XDSHStack} from "@xds/core/Layout";
import {XDSButton} from "@xds/core/Button";
import {XDSHeading, XDSText} from "@xds/core/Text";
import {XDSBanner} from "@xds/core/Banner";
import {XDSCollapsible} from "@xds/core/Collapsible";
import {XDSToken} from "@xds/core/Token";
import {XDSSkeleton} from "@xds/core/Skeleton";
import {XDSTreeList} from "@xds/core/TreeList";
import {XDSDialog, XDSDialogHeader} from "@xds/core/Dialog";
import {XDSDropdownMenu} from "@xds/core/DropdownMenu";
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from "@xds/core/SideNav";
import {XDSCard} from "@xds/core/Card";
import {XDSBadge} from "@xds/core/Badge";
import {HomeIcon, FolderIcon, Cog6ToothIcon} from "@heroicons/react/20/solid";
import {
  durationVars,
  easeVars,
  spacingVars,
  colorVars,
  radiusVars,
} from "@xds/core/theme/tokens.stylex";

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  page: {
    padding: spacingVars["--spacing-8"],
    maxWidth: "1100px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px",
    background: colorVars["--color-border"],
    borderRadius: radiusVars["--radius-container"],
    overflow: "hidden",
    marginBottom: spacingVars["--spacing-6"],
  },
  side: {
    background: colorVars["--color-background-surface"],
    padding: spacingVars["--spacing-6"],
    display: "flex",
    flexDirection: "column",
    gap: spacingVars["--spacing-4"],
    minHeight: "200px",
  },
  sideLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: colorVars["--color-text-secondary"],
  },
  currentLabel: {
    color: colorVars["--color-warning"],
  },
  proposedLabel: {
    color: colorVars["--color-success"],
  },
  section: {
    marginBottom: spacingVars["--spacing-8"],
  },
  note: {
    fontSize: "13px",
    color: colorVars["--color-text-secondary"],
    marginBottom: spacingVars["--spacing-4"],
    paddingLeft: spacingVars["--spacing-3"],
    borderLeft: `2px solid ${colorVars["--color-border"]}`,
  },
  tokenArea: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacingVars["--spacing-1"],
    minHeight: "40px",
    alignItems: "center",
  },
  // Proposed motion overrides
  proposedCollapsibleContent: {
    display: "grid",
    gridTemplateRows: "0fr",
    transitionProperty: "grid-template-rows",
    transitionDuration: durationVars["--duration-medium"],
    transitionTimingFunction: easeVars["--ease-standard"],
    overflow: "hidden",
  },
  proposedCollapsibleContentOpen: {
    gridTemplateRows: "1fr",
  },
  proposedCollapsibleInner: {
    minHeight: 0,
    overflow: "hidden",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: durationVars["--duration-fast-max"],
    transitionTimingFunction: easeVars["--ease-standard"],
    transitionDelay: "80ms",
  },
  proposedCollapsibleInnerOpen: {
    opacity: 1,
  },
  // Banner dismiss animation
  bannerWrapper: {
    display: "grid",
    gridTemplateRows: "1fr",
    transitionProperty: "grid-template-rows",
    transitionDuration: durationVars["--duration-fast-max"],
    transitionTimingFunction: easeVars["--ease-standard"],
    transitionDelay: "150ms",
  },
  bannerWrapperDismissed: {
    gridTemplateRows: "0fr",
  },
  bannerInner: {
    minHeight: 0,
    overflow: "hidden",
    opacity: 1,
    transitionProperty: "opacity",
    transitionDuration: durationVars["--duration-fast"],
    transitionTimingFunction: easeVars["--ease-standard"],
  },
  bannerInnerDismissed: {
    opacity: 0,
  },
  // Token animations
  tokenEnter: {
    animationName: stylex.keyframes({
      from: {opacity: 0, transform: "scale(0.85)"},
      to: {opacity: 1, transform: "scale(1)"},
    }),
    animationDuration: durationVars["--duration-fast"],
    animationTimingFunction: easeVars["--ease-standard"],
    animationFillMode: "both",
  },
  tokenExit: {
    animationName: stylex.keyframes({
      from: {opacity: 1, transform: "scale(1)"},
      to: {opacity: 0, transform: "scale(0.85)"},
    }),
    animationDuration: durationVars["--duration-fast"],
    animationTimingFunction: easeVars["--ease-standard"],
    animationFillMode: "forwards",
  },
  // Skeleton proposed
  skeletonProposed: {
    animationName: stylex.keyframes({
      "0%, 100%": {opacity: 0.3},
      "50%": {opacity: 0.7},
    }),
    animationDuration: "1.5s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  // Dropdown exit
  dropdownExit: {
    animationName: stylex.keyframes({
      from: {opacity: 1},
      to: {opacity: 0},
    }),
    animationDuration: "100ms",
    animationTimingFunction: easeVars["--ease-standard"],
    animationFillMode: "forwards",
  },
  // SideNav collapse width animation
  sidenavWrapper: {
    transitionProperty: "width",
    transitionDuration: durationVars["--duration-medium"],
    transitionTimingFunction: easeVars["--ease-standard"],
    overflow: "hidden",
  },
  sidenavExpanded: {
    width: "240px",
  },
  sidenavCollapsed: {
    width: "56px",
  },
  sidenavArea: {
    display: "flex",
    gap: spacingVars["--spacing-4"],
    height: "300px",
    border: `1px solid ${colorVars["--color-border"]}`,
    borderRadius: radiusVars["--radius-container"],
    overflow: "hidden",
  },
  sidenavContent: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacingVars["--spacing-4"],
  },
});

// =============================================================================
// Demo Components
// =============================================================================

function SectionHeader({title, badge}: {title: string; badge: string}) {
  return (
    <XDSHStack gap={2} align="center">
      <XDSHeading level={3}>{title}</XDSHeading>
      <XDSBadge label={badge} />
    </XDSHStack>
  );
}

// --- Demo 1: Collapsible ---
function CollapsibleDemo() {
  const [proposedOpen, setProposedOpen] = useState(false);

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="1. Collapsible Content" badge="Consistency" />
      <p {...stylex.props(styles.note)}>
        XDS already uses grid-template-rows in CodeBlock + ChatToolCalls. The generic Collapsible still uses display: none.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <XDSCard>
            <XDSCollapsible trigger="Show details" defaultIsOpen={false}>
              <XDSText type="body">
                This content appears and disappears instantly via display: none/block.
                The chevron rotates smoothly but the content itself snaps into place.
              </XDSText>
            </XDSCollapsible>
          </XDSCard>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <XDSCard>
            <button
              onClick={() => setProposedOpen(!proposedOpen)}
              style={{
                all: "unset",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
              }}>
              <span>Show details</span>
              <span style={{
                transition: "transform 175ms cubic-bezier(0.24, 1, 0.4, 1)",
                transform: proposedOpen ? "rotate(180deg)" : "rotate(0deg)",
                fontSize: "12px",
              }}>▼</span>
            </button>
            <div {...stylex.props(
              styles.proposedCollapsibleContent,
              proposedOpen && styles.proposedCollapsibleContentOpen,
            )}>
              <div {...stylex.props(
                styles.proposedCollapsibleInner,
                proposedOpen && styles.proposedCollapsibleInnerOpen,
              )}>
                <div style={{paddingTop: "12px"}}>
                  <XDSText type="body">
                    This content slides open smoothly using grid-template-rows: 0fr → 1fr
                    with staggered opacity. The same pattern already proven in ChatComposerDrawer.
                  </XDSText>
                </div>
              </div>
            </div>
          </XDSCard>
        </div>
      </div>
    </div>
  );
}

// --- Demo 2: Token Enter/Exit ---
function TokenDemo() {
  const [currentTokens, setCurrentTokens] = useState(["Design", "Motion"]);
  const [proposedTokens, setProposedTokens] = useState(["Design", "Motion"]);
  const [exitingTokens, setExitingTokens] = useState<string[]>([]);
  const names = ["React", "TypeScript", "Figma", "CSS", "A11y", "XDS", "Spring"];
  const indexRef = useRef(0);

  const addCurrent = () => {
    const name = names[indexRef.current % names.length];
    indexRef.current++;
    setCurrentTokens((prev) => [...prev, name]);
  };

  const addProposed = () => {
    const name = names[indexRef.current % names.length];
    indexRef.current++;
    setProposedTokens((prev) => [...prev, name]);
  };

  const removeCurrent = (name: string) => {
    setCurrentTokens((prev) => prev.filter((t) => t !== name));
  };

  const removeProposed = (name: string) => {
    setExitingTokens((prev) => [...prev, name]);
    setTimeout(() => {
      setProposedTokens((prev) => prev.filter((t) => t !== name));
      setExitingTokens((prev) => prev.filter((t) => t !== name));
    }, 175);
  };

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="2. Token Enter & Exit" badge="Motion Gap" />
      <p {...stylex.props(styles.note)}>
        Tokens in a Tokenizer pop in/out instantly. A scale + opacity animation provides visual confirmation.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <div {...stylex.props(styles.tokenArea)}>
            {currentTokens.map((t, i) => (
              <XDSToken key={t + i} label={t} onRemove={() => removeCurrent(t)} />
            ))}
          </div>
          <XDSButton label="+ Add token" variant="secondary" size="sm" onClick={addCurrent} />
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <div {...stylex.props(styles.tokenArea)}>
            {proposedTokens.map((t, i) => (
              <span
                key={t + i}
                {...stylex.props(
                  exitingTokens.includes(t) ? styles.tokenExit : styles.tokenEnter,
                )}>
                <XDSToken label={t} onRemove={() => removeProposed(t)} />
              </span>
            ))}
          </div>
          <XDSButton label="+ Add token" variant="secondary" size="sm" onClick={addProposed} />
        </div>
      </div>
    </div>
  );
}

// --- Demo 3: Banner Dismiss ---
function BannerDemo() {
  const [currentVisible, setCurrentVisible] = useState(true);
  const [proposedDismissed, setProposedDismissed] = useState(false);

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="3. Banner Dismiss" badge="Motion Gap" />
      <p {...stylex.props(styles.note)}>
        Banner dismissal returns null — the element vanishes and everything below shifts up instantly.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          {currentVisible && (
            <XDSBanner
              status="info"
              title="Update available"
              description="A new version is ready to install."
              isDismissable
              onDismiss={() => setCurrentVisible(false)}
            />
          )}
          {!currentVisible && (
            <XDSButton label="Reset" variant="secondary" size="sm" onClick={() => setCurrentVisible(true)} />
          )}
          <XDSText type="body">Content below the banner</XDSText>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <div {...stylex.props(
            styles.bannerWrapper,
            proposedDismissed && styles.bannerWrapperDismissed,
          )}>
            <div {...stylex.props(
              styles.bannerInner,
              proposedDismissed && styles.bannerInnerDismissed,
            )}>
              <XDSBanner
                status="info"
                title="Update available"
                description="A new version is ready to install."
                isDismissable
                onDismiss={() => setProposedDismissed(true)}
              />
            </div>
          </div>
          {proposedDismissed && (
            <XDSButton label="Reset" variant="secondary" size="sm" onClick={() => setProposedDismissed(false)} />
          )}
          <XDSText type="body">Content below the banner</XDSText>
        </div>
      </div>
    </div>
  );
}

// --- Demo 4: Button Loading ---
function ButtonLoadingDemo() {
  const [currentLoading, setCurrentLoading] = useState(false);
  const [proposedLoading, setProposedLoading] = useState(false);

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="4. Button Loading State" badge="Polish" />
      <p {...stylex.props(styles.note)}>
        Button&apos;s loading state swaps label for spinner instantly. A crossfade makes the transition intentional.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <XDSButton
            label="Save changes"
            isLoading={currentLoading}
            onClick={() => {
              setCurrentLoading(true);
              setTimeout(() => setCurrentLoading(false), 2000);
            }}
          />
          <XDSText type="supporting">Click to trigger loading state</XDSText>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <XDSButton
            label="Save changes"
            isLoading={proposedLoading}
            onClick={() => {
              setProposedLoading(true);
              setTimeout(() => setProposedLoading(false), 2000);
            }}
          />
          <XDSText type="supporting">
            (Same component — crossfade would require internal change to XDSButton)
          </XDSText>
        </div>
      </div>
    </div>
  );
}

// --- Demo 5: Layer Exit (Dropdown) ---
function DropdownDemo() {
  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="5. Dropdown Close" badge="Motion Gap" />
      <p {...stylex.props(styles.note)}>
        Layers animate in but vanish on close. Open and close these to feel the asymmetry (current) vs. subtle fade (proposed — requires layerAnimations change).
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <XDSDropdownMenu
            button={{label: "Actions", variant: "secondary", size: "sm"}}
            items={[
              {label: "Edit"},
              {label: "Duplicate"},
              {label: "Archive"},
              {label: "Delete"},
            ]}
          />
          <XDSText type="supporting">Open → close quickly to feel the instant vanish</XDSText>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <XDSDropdownMenu
            button={{label: "Actions", variant: "secondary", size: "sm"}}
            items={[
              {label: "Edit"},
              {label: "Duplicate"},
              {label: "Archive"},
              {label: "Delete"},
            ]}
          />
          <XDSText type="supporting">
            (Same component — exit fade requires layerAnimations.stylex.ts change)
          </XDSText>
        </div>
      </div>
    </div>
  );
}

// --- Demo 6: Skeleton ---
function SkeletonDemo() {
  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="6. Skeleton Pulse" badge="Polish" />
      <p {...stylex.props(styles.note)}>
        Current uses steps(10, end) creating mechanical stutter. Proposed uses smooth ease-in-out breathe.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <XDSVStack gap={2}>
            <XDSSkeleton width="80%" height={16} />
            <XDSSkeleton width="60%" height={16} index={1} />
            <XDSSkeleton width="70%" height={16} index={2} />
            <XDSSkeleton width={40} height={40} radius="rounded" index={3} />
          </XDSVStack>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <XDSVStack gap={2}>
            <div {...stylex.props(styles.skeletonProposed)} style={{width: "80%", height: 16, borderRadius: 6, background: "var(--color-skeleton)"}} />
            <div {...stylex.props(styles.skeletonProposed)} style={{width: "60%", height: 16, borderRadius: 6, background: "var(--color-skeleton)", animationDelay: "200ms"}} />
            <div {...stylex.props(styles.skeletonProposed)} style={{width: "70%", height: 16, borderRadius: 6, background: "var(--color-skeleton)", animationDelay: "400ms"}} />
            <div {...stylex.props(styles.skeletonProposed)} style={{width: 40, height: 40, borderRadius: "50%", background: "var(--color-skeleton)", animationDelay: "600ms"}} />
          </XDSVStack>
        </div>
      </div>
    </div>
  );
}

// --- Demo 7: TreeList ---
function TreeListDemo() {
  const treeData = [
    {
      id: "src",
      label: "src",
      children: [
        {
          id: "components",
          label: "components",
          children: [
            {id: "button", label: "Button.tsx"},
            {id: "dialog", label: "Dialog.tsx"},
            {id: "toast", label: "Toast.tsx"},
          ],
        },
        {id: "index", label: "index.ts"},
        {id: "utils", label: "utils.ts"},
      ],
    },
    {
      id: "tests",
      label: "tests",
      children: [
        {id: "button-test", label: "Button.test.tsx"},
        {id: "dialog-test", label: "Dialog.test.tsx"},
      ],
    },
  ];

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="7. TreeList Expand" badge="Polish" />
      <p {...stylex.props(styles.note)}>
        Tree children appear via conditional render. A fast height animation removes the pop. 
        Debatable for rapid navigation — per frequency rule, power users may prefer instant.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <XDSCard>
            <XDSTreeList items={treeData} density="compact" />
          </XDSCard>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <XDSCard>
            <XDSTreeList items={treeData} density="compact" />
          </XDSCard>
          <XDSText type="supporting">
            (Same component — height animation requires XDSTreeListItem internal change)
          </XDSText>
        </div>
      </div>
    </div>
  );
}

// --- Demo 8: Dialog ---
function DialogDemo() {
  const [currentOpen, setCurrentOpen] = useState(false);
  const [proposedOpen, setProposedOpen] = useState(false);

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="8. Dialog Open/Close" badge="Existing ✓" />
      <p {...stylex.props(styles.note)}>
        Dialog already has directional entry animation from trigger position. Close uses a JS setTimeout workaround.
        Proposed: use allow-discrete + @starting-style for pure CSS close animation (like TopNavMegaMenu).
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <XDSButton label="Open Dialog" variant="secondary" size="sm" onClick={() => setCurrentOpen(true)} />
          <XDSDialog isOpen={currentOpen} onOpenChange={() => setCurrentOpen(false)} purpose="info">
            <XDSDialogHeader title="Confirm action" />
            <XDSVStack gap={3}>
              <XDSText type="body">This dialog has directional entry animation already. Close it to see the exit.</XDSText>
              <XDSButton label="Close" onClick={() => setCurrentOpen(false)} />
            </XDSVStack>
          </XDSDialog>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <XDSButton label="Open Dialog" variant="secondary" size="sm" onClick={() => setProposedOpen(true)} />
          <XDSDialog isOpen={proposedOpen} onOpenChange={() => setProposedOpen(false)} purpose="info">
            <XDSDialogHeader title="Confirm action" />
            <XDSVStack gap={3}>
              <XDSText type="body">Same dialog — the exit animation improvement requires internal change (allow-discrete on ::backdrop + content).</XDSText>
              <XDSButton label="Close" onClick={() => setProposedOpen(false)} />
            </XDSVStack>
          </XDSDialog>
        </div>
      </div>
    </div>
  );
}

// --- Demo 9: SideNav Collapse ---
function SideNavDemo() {
  const [currentCollapsed, setCurrentCollapsed] = useState(false);
  const [proposedCollapsed, setProposedCollapsed] = useState(false);

  return (
    <div {...stylex.props(styles.section)}>
      <SectionHeader title="9. SideNav Collapse" badge="Polish" />
      <p {...stylex.props(styles.note)}>
        The chevron rotates (animated), but the nav width change itself has no transition. 
        Adding a width transition makes the collapse feel connected to the chevron motion.
      </p>
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.currentLabel)}>XDS CURRENT</span>
          <div {...stylex.props(styles.sidenavArea)}>
            <div style={{width: currentCollapsed ? "56px" : "240px", overflow: "hidden", borderRight: "1px solid var(--color-border)"}}>
              <XDSSideNav collapsible>
                <XDSSideNavSection title="Navigation">
                  <XDSSideNavItem label="Dashboard" icon={<HomeIcon width={16} height={16} />} />
                  <XDSSideNavItem label="Projects" icon={<FolderIcon width={16} height={16} />} />
                  <XDSSideNavItem label="Settings" icon={<Cog6ToothIcon width={16} height={16} />} />
                </XDSSideNavSection>
              </XDSSideNav>
            </div>
            <div {...stylex.props(styles.sidenavContent)}>
              <XDSVStack gap={2} align="center">
                <XDSText type="body">Main content</XDSText>
                <XDSButton
                  label={currentCollapsed ? "Expand" : "Collapse"}
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentCollapsed(!currentCollapsed)}
                />
              </XDSVStack>
            </div>
          </div>
        </div>
        <div {...stylex.props(styles.side)}>
          <span {...stylex.props(styles.sideLabel, styles.proposedLabel)}>PROPOSED</span>
          <div {...stylex.props(styles.sidenavArea)}>
            <div {...stylex.props(
              styles.sidenavWrapper,
              proposedCollapsed ? styles.sidenavCollapsed : styles.sidenavExpanded,
            )}>
              <XDSSideNav collapsible>
                <XDSSideNavSection title="Navigation">
                  <XDSSideNavItem label="Dashboard" icon={<HomeIcon width={16} height={16} />} />
                  <XDSSideNavItem label="Projects" icon={<FolderIcon width={16} height={16} />} />
                  <XDSSideNavItem label="Settings" icon={<Cog6ToothIcon width={16} height={16} />} />
                </XDSSideNavSection>
              </XDSSideNav>
            </div>
            <div {...stylex.props(styles.sidenavContent)}>
              <XDSVStack gap={2} align="center">
                <XDSText type="body">Main content</XDSText>
                <XDSButton
                  label={proposedCollapsed ? "Expand" : "Collapse"}
                  variant="secondary"
                  size="sm"
                  onClick={() => setProposedCollapsed(!proposedCollapsed)}
                />
              </XDSVStack>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function MotionAuditPage() {
  return (
    <div {...stylex.props(styles.page)}>
      <XDSVStack gap={2}>
        <XDSHeading level={1}>Motion Gaps — Interactive Comparison</XDSHeading>
        <XDSText type="body">
          Real XDS components showing current behavior vs. proposed motion improvements.
          Interact with each to feel the difference.
        </XDSText>
      </XDSVStack>

      <div style={{marginTop: "48px"}}>
        <CollapsibleDemo />
        <TokenDemo />
        <BannerDemo />
        <ButtonLoadingDemo />
        <DropdownDemo />
        <SkeletonDemo />
        <TreeListDemo />
        <DialogDemo />
        <SideNavDemo />
      </div>
    </div>
  );
}
