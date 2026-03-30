'use client';
import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';
import {
  CogIcon,
  BoxIcon,
  TagIcon,
  PhotoIcon,
  BellIcon,
  LinkIcon,
  BeakerIcon,
} from './SettingsIcons';

const s = stylex.create({
  body: {display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0},
  nav: {
    width: 192,
    flexShrink: 0,
    borderInlineEnd: `1px solid ${colorVars['--color-border']}`,
    overflowY: 'auto',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: spacingVars['--spacing-6'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
  },
  rowLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    flex: 1,
  },
  rowControl: {flexShrink: 0, minWidth: 160},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacingVars['--spacing-3'],
  },
  tile: {
    borderRadius: radiusVars['--radius-element'],
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
  },
  tileActive: {borderColor: colorVars['--color-accent']},
  tileInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute' as const,
    inset: 0,
  },
  tileLabel: {
    paddingBlock: spacingVars['--spacing-2'],
    textAlign: 'center' as const,
  },
});

function Toggle({on}: {on: boolean}) {
  return (
    <div
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        backgroundColor: on ? '#0064E0' : '#CCD3DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        padding: 2,
        boxSizing: 'border-box',
      }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      />
    </div>
  );
}

function Dropdown({value}: {value: string}) {
  return (
    <div
      style={{
        padding: '6px 10px',
        border: '1px solid #CCD3DB',
        borderRadius: 6,
        fontSize: 14,
        backgroundColor: 'white',
        color: '#0A1317',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
      <span>{value}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="#606770"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function Row({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div {...stylex.props(s.row)}>
        <div {...stylex.props(s.rowLabel)}>
          <XDSText type="body">{label}</XDSText>
          {desc && (
            <XDSText type="supporting" color="secondary">
              {desc}
            </XDSText>
          )}
        </div>
        <div {...stylex.props(s.rowControl)}>{children}</div>
      </div>
      <XDSDivider />
    </>
  );
}

function GridSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{width: 28, height: 28}}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function ListSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{width: 28, height: 28}}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
function KanbanSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{width: 28, height: 28}}>
      <rect x="3" y="3" width="5" height="14" rx="1" />
      <rect x="10" y="3" width="5" height="10" rx="1" />
      <rect x="17" y="3" width="5" height="18" rx="1" />
    </svg>
  );
}

const SECTIONS = [
  {id: 'general', label: 'General', Icon: CogIcon},
  {id: 'inventory', label: 'Inventory', Icon: BoxIcon},
  {id: 'catalog', label: 'Catalog', Icon: TagIcon},
  {id: 'pricing', label: 'Pricing', Icon: TagIcon},
  {id: 'media', label: 'Media', Icon: PhotoIcon},
  {id: 'notifications', label: 'Notifications', Icon: BellIcon},
  {id: 'integrations', label: 'Integrations', Icon: LinkIcon},
  {id: 'feature-flags', label: 'Feature Flags', Icon: BeakerIcon},
];

function GeneralContent() {
  const views = [
    {id: 'grid', label: 'Grid', bg: '#EEF2FF', color: '#4F46E5', Icon: GridSvg},
    {id: 'list', label: 'List', bg: '#F0FDF4', color: '#16A34A', Icon: ListSvg},
    {
      id: 'kanban',
      label: 'Kanban',
      bg: '#FFF7ED',
      color: '#EA580C',
      Icon: KanbanSvg,
    },
  ];
  return (
    <>
      <XDSHeading level={3}>General</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Default behavior and display preferences.
      </XDSText>
      <div style={{marginBlock: '16px 8px'}}>
        <XDSText type="supporting" color="secondary" weight="semibold">
          Default product view
        </XDSText>
      </div>
      <div {...stylex.props(s.grid)}>
        {views.map(({id, label, bg, color, Icon}) => (
          <div
            key={id}
            {...stylex.props(s.tile, id === 'grid' && s.tileActive)}>
            <div style={{position: 'relative', paddingTop: '56.25%'}}>
              <div
                {...stylex.props(s.tileInner)}
                style={{backgroundColor: bg, color}}>
                <Icon />
              </div>
            </div>
            <div {...stylex.props(s.tileLabel)}>
              <XDSText type="supporting" color="secondary">
                {label}
              </XDSText>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row label="Items per page" desc="Products loaded per page.">
        <Dropdown value="24" />
      </Row>
      <Row label="Currency display" desc="How prices appear in the catalog.">
        <Dropdown value="Symbol ($)" />
      </Row>
    </>
  );
}

const CONTENT: Record<string, React.ReactNode> = {
  general: <GeneralContent />,
  inventory: (
    <>
      <XDSHeading level={3}>Inventory</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Stock alerts and tracking behavior.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row
        label="Low stock alerts"
        desc="Warn when stock drops below threshold.">
        <Toggle on={true} />
      </Row>
      <Row
        label="Low stock threshold"
        desc="Units remaining before alert triggers.">
        <Dropdown value="10 units" />
      </Row>
      <Row label="Track by variant" desc="Separate stock counts per SKU.">
        <Toggle on={true} />
      </Row>
    </>
  ),
  catalog: (
    <>
      <XDSHeading level={3}>Catalog</XDSHeading>
      <XDSText type="supporting" color="secondary">
        How products are organized and displayed.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row label="Default sort order" desc="Initial ordering of listings.">
        <Dropdown value="Newest first" />
      </Row>
      <Row
        label="Show out-of-stock products"
        desc="Display zero-inventory products.">
        <Toggle on={false} />
      </Row>
      <Row label="Data density" desc="Information shown in product rows.">
        <Dropdown value="Comfortable" />
      </Row>
    </>
  ),
  pricing: (
    <>
      <XDSHeading level={3}>Pricing</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Price display and rounding rules.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row
        label="Show compare-at price"
        desc="Show original when sale price is set.">
        <Toggle on={true} />
      </Row>
      <Row label="Tax display" desc="How tax is shown on prices.">
        <Dropdown value="Excluding tax" />
      </Row>
      <Row label="Price rounding" desc="Snap prices to nearest increment.">
        <Dropdown value="None" />
      </Row>
    </>
  ),
  media: (
    <>
      <XDSHeading level={3}>Media</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Image behavior and thumbnail settings.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row label="Image aspect ratio" desc="Default ratio for thumbnails.">
        <Dropdown value="Square (1:1)" />
      </Row>
      <Row label="Zoom on hover" desc="Enlarge image when hovering.">
        <Toggle on={true} />
      </Row>
    </>
  ),
  notifications: (
    <>
      <XDSHeading level={3}>Notifications</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Which events trigger in-app alerts.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row label="New orders" desc="Alert when a new order is placed.">
        <Toggle on={true} />
      </Row>
      <Row label="New reviews" desc="Alert when a product gets a review.">
        <Toggle on={false} />
      </Row>
      <Row label="Price changes" desc="Alert when a tracked price changes.">
        <Toggle on={false} />
      </Row>
    </>
  ),
  integrations: (
    <>
      <XDSHeading level={3}>Integrations</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Connected services and sync options.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row
        label="Sync to Google Shopping"
        desc="Auto-push to Google Merchant Center.">
        <Toggle on={false} />
      </Row>
      <Row
        label="Sync to Meta Catalog"
        desc="Auto-push to Meta Business catalog.">
        <Toggle on={false} />
      </Row>
      <Row label="Sync frequency" desc="How often data is pushed.">
        <Dropdown value="Hourly" />
      </Row>
    </>
  ),
  'feature-flags': (
    <>
      <XDSHeading level={3}>Feature Flags</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Opt in to beta features for this workspace.
      </XDSText>
      <div style={{marginTop: 16}}>
        <XDSDivider />
      </div>
      <Row
        label="AI product descriptions"
        desc="Beta: Generate descriptions with AI.">
        <Toggle on={false} />
      </Row>
      <Row
        label="Bulk variant editor"
        desc="Beta: Edit variants across products.">
        <Toggle on={false} />
      </Row>
      <Row
        label="Advanced analytics"
        desc="Beta: Extended performance metrics.">
        <Toggle on={false} />
      </Row>
    </>
  ),
};

export function ProductSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState('general');
  return (
    <XDSDialog
      isOpen={isOpen}
      onClose={onClose}
      purpose="info"
      style={{
        width: 800,
        maxWidth: '95vw',
        height: 560,
        maxHeight: '90vh',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <XDSDialogHeader
        title="Product Settings"
        description="Configure this workspace. Changes save immediately."
        onClose={onClose}
        style={{padding: '20px 24px 16px', flexShrink: 0}}
      />
      <XDSDivider />
      <div {...stylex.props(s.body)}>
        <div {...stylex.props(s.nav)}>
          <XDSList>
            {SECTIONS.map(({id, label, Icon}) => (
              <XDSListItem
                key={id}
                label={label}
                isSelected={active === id}
                startContent={<Icon style={{width: 16, height: 16}} />}
                onClick={() => setActive(id)}
              />
            ))}
          </XDSList>
        </div>
        <div {...stylex.props(s.content)}>{CONTENT[active]}</div>
      </div>
    </XDSDialog>
  );
}
