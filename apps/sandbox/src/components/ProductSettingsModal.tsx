'use client';
import {useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSDivider} from '@xds/core';
import {XDSSelector} from '@xds/core/Selector';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
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

const styles = stylex.create({
  dialogBody: {display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0},
  sectionNav: {
    width: 192,
    flexShrink: 0,
    borderInlineEnd: `1px solid ${colorVars['--color-border']}`,
    overflowY: 'auto',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: spacingVars['--spacing-6'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
  },
  sectionHeader: {marginBlockEnd: spacingVars['--spacing-3']},
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
  },
  settingLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    flex: 1,
    minWidth: 0,
  },
  settingControl: {flexShrink: 0, minWidth: 180},
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacingVars['--spacing-3'],
  },
  previewTile: {
    borderRadius: radiusVars['--radius-element'],
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
  },
  previewTileActive: {borderColor: colorVars['--color-accent']},
  previewInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute' as const,
    inset: 0,
  },
  previewLabel: {
    paddingBlock: spacingVars['--spacing-2'],
    textAlign: 'center' as const,
  },
});

interface SettingsState {
  defaultView: string;
  itemsPerPage: string;
  currencyDisplay: string;
  lowStockAlerts: boolean;
  lowStockThreshold: string;
  trackByVariant: boolean;
  defaultSort: string;
  showOutOfStock: boolean;
  dataDensity: string;
  showCompareAt: boolean;
  taxDisplay: string;
  priceRounding: string;
  imageRatio: string;
  imageZoom: boolean;
  notifyOrders: boolean;
  notifyReviews: boolean;
  notifyPriceChange: boolean;
  googleSync: boolean;
  metaSync: boolean;
  syncFrequency: string;
  aiDescriptions: boolean;
  bulkVariantEditor: boolean;
  advancedAnalytics: boolean;
}
type UpdateFn = (key: keyof SettingsState, value: string | boolean) => void;
const DEFAULTS: SettingsState = {
  defaultView: 'grid',
  itemsPerPage: '24',
  currencyDisplay: 'Symbol ($)',
  lowStockAlerts: true,
  lowStockThreshold: '10',
  trackByVariant: true,
  defaultSort: 'Newest first',
  showOutOfStock: false,
  dataDensity: 'Comfortable',
  showCompareAt: true,
  taxDisplay: 'Excluding tax',
  priceRounding: 'None',
  imageRatio: 'Square (1:1)',
  imageZoom: true,
  notifyOrders: true,
  notifyReviews: false,
  notifyPriceChange: false,
  googleSync: false,
  metaSync: false,
  syncFrequency: 'Hourly',
  aiDescriptions: false,
  bulkVariantEditor: false,
  advancedAnalytics: false,
};

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

const VIEW_MODES = [
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

function ViewModePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div {...stylex.props(styles.previewGrid)}>
      {VIEW_MODES.map(({id, label, bg, color, Icon}) => (
        <div
          key={id}
          {...stylex.props(
            styles.previewTile,
            value === id && styles.previewTileActive,
          )}
          onClick={() => onChange(id)}
          role="radio"
          aria-checked={value === id}
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onChange(id)}>
          <XDSAspectRatio ratio={16 / 9}>
            <div
              {...stylex.props(styles.previewInner)}
              style={{backgroundColor: bg, color}}>
              <Icon />
            </div>
          </XDSAspectRatio>
          <div {...stylex.props(styles.previewLabel)}>
            <XDSText type="supporting" color="secondary">
              {label}
            </XDSText>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div {...stylex.props(styles.settingRow)}>
        <div {...stylex.props(styles.settingLabel)}>
          <XDSText type="body">{label}</XDSText>
          {description && (
            <XDSText type="supporting" color="secondary">
              {description}
            </XDSText>
          )}
        </div>
        <div {...stylex.props(styles.settingControl)}>{children}</div>
      </div>
      <XDSDivider />
    </>
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

export function ProductSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState('general');
  const [s, setS] = useState<SettingsState>(DEFAULTS);
  const upd: UpdateFn = (k, v) => setS(prev => ({...prev, [k]: v}));

  const content = () => {
    switch (active) {
      case 'general':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>General</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Default behavior and display preferences.
              </XDSText>
            </div>
            <XDSText type="supporting" color="secondary" weight="semibold">
              Default product view
            </XDSText>
            <ViewModePicker
              value={s.defaultView}
              onChange={v => upd('defaultView', v)}
            />
            <XDSDivider />
            <SettingRow
              label="Items per page"
              description="Products loaded per page by default.">
              <XDSSelector
                label="Items per page"
                value={s.itemsPerPage}
                onChange={v => upd('itemsPerPage', v as string)}
                options={['12', '24', '48', '96']}
              />
            </SettingRow>
            <SettingRow
              label="Currency display"
              description="How prices appear throughout the catalog.">
              <XDSSelector
                label="Currency display"
                value={s.currencyDisplay}
                onChange={v => upd('currencyDisplay', v as string)}
                options={['Symbol ($)', 'Code (USD)', 'Name (US Dollar)']}
              />
            </SettingRow>
          </>
        );
      case 'inventory':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Inventory</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Stock alerts and tracking behavior.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="Low stock alerts"
              description="Warn when stock drops below threshold.">
              <XDSSwitch
                label="Low stock alerts"
                isSelected={s.lowStockAlerts}
                onChange={v => upd('lowStockAlerts', v)}
              />
            </SettingRow>
            <SettingRow
              label="Low stock threshold"
              description="Units remaining before alert triggers.">
              <XDSSelector
                label="Threshold"
                value={s.lowStockThreshold}
                onChange={v => upd('lowStockThreshold', v as string)}
                options={['5', '10', '20', '50']}
                isDisabled={!s.lowStockAlerts}
              />
            </SettingRow>
            <SettingRow
              label="Track by variant"
              description="Separate stock counts per SKU.">
              <XDSSwitch
                label="Track by variant"
                isSelected={s.trackByVariant}
                onChange={v => upd('trackByVariant', v)}
              />
            </SettingRow>
          </>
        );
      case 'catalog':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Catalog</XDSHeading>
              <XDSText type="supporting" color="secondary">
                How products are organized and displayed.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="Default sort order"
              description="Initial ordering of product listings.">
              <XDSSelector
                label="Sort order"
                value={s.defaultSort}
                onChange={v => upd('defaultSort', v as string)}
                options={[
                  'Newest first',
                  'Oldest first',
                  'Price: low to high',
                  'Price: high to low',
                  'Alphabetical',
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Show out-of-stock products"
              description="Display zero-inventory products.">
              <XDSSwitch
                label="Show out-of-stock"
                isSelected={s.showOutOfStock}
                onChange={v => upd('showOutOfStock', v)}
              />
            </SettingRow>
            <SettingRow
              label="Data density"
              description="Information shown in product rows.">
              <XDSSelector
                label="Data density"
                value={s.dataDensity}
                onChange={v => upd('dataDensity', v as string)}
                options={['Comfortable', 'Compact', 'Condensed']}
              />
            </SettingRow>
          </>
        );
      case 'pricing':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Pricing</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Price display and rounding rules.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="Show compare-at price"
              description="Show original when sale price is set.">
              <XDSSwitch
                label="Compare-at price"
                isSelected={s.showCompareAt}
                onChange={v => upd('showCompareAt', v)}
              />
            </SettingRow>
            <SettingRow
              label="Tax display"
              description="How tax is shown on product prices.">
              <XDSSelector
                label="Tax display"
                value={s.taxDisplay}
                onChange={v => upd('taxDisplay', v as string)}
                options={['Excluding tax', 'Including tax', 'Hidden']}
              />
            </SettingRow>
            <SettingRow
              label="Price rounding"
              description="Snap prices to nearest increment.">
              <XDSSelector
                label="Price rounding"
                value={s.priceRounding}
                onChange={v => upd('priceRounding', v as string)}
                options={['None', 'Nearest $0.99', 'Nearest $1', 'Nearest $5']}
              />
            </SettingRow>
          </>
        );
      case 'media':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Media</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Image behavior and thumbnail settings.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="Image aspect ratio"
              description="Default ratio for product thumbnails.">
              <XDSSelector
                label="Aspect ratio"
                value={s.imageRatio}
                onChange={v => upd('imageRatio', v as string)}
                options={[
                  'Square (1:1)',
                  'Portrait (3:4)',
                  'Landscape (4:3)',
                  'Widescreen (16:9)',
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Zoom on hover"
              description="Enlarge product image when hovering.">
              <XDSSwitch
                label="Zoom on hover"
                isSelected={s.imageZoom}
                onChange={v => upd('imageZoom', v)}
              />
            </SettingRow>
          </>
        );
      case 'notifications':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Notifications</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Which events trigger in-app alerts.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="New orders"
              description="Alert when a new order is placed.">
              <XDSSwitch
                label="New orders"
                isSelected={s.notifyOrders}
                onChange={v => upd('notifyOrders', v)}
              />
            </SettingRow>
            <SettingRow
              label="New reviews"
              description="Alert when a product gets a review.">
              <XDSSwitch
                label="New reviews"
                isSelected={s.notifyReviews}
                onChange={v => upd('notifyReviews', v)}
              />
            </SettingRow>
            <SettingRow
              label="Price changes"
              description="Alert when a tracked price changes.">
              <XDSSwitch
                label="Price changes"
                isSelected={s.notifyPriceChange}
                onChange={v => upd('notifyPriceChange', v)}
              />
            </SettingRow>
          </>
        );
      case 'integrations':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Integrations</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Connected services and sync options.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="Sync to Google Shopping"
              description="Auto-push to Google Merchant Center.">
              <XDSSwitch
                label="Google Shopping"
                isSelected={s.googleSync}
                onChange={v => upd('googleSync', v)}
              />
            </SettingRow>
            <SettingRow
              label="Sync to Meta Catalog"
              description="Auto-push to Meta Business catalog.">
              <XDSSwitch
                label="Meta Catalog"
                isSelected={s.metaSync}
                onChange={v => upd('metaSync', v)}
              />
            </SettingRow>
            <SettingRow
              label="Sync frequency"
              description="How often product data is pushed.">
              <XDSSelector
                label="Sync frequency"
                value={s.syncFrequency}
                onChange={v => upd('syncFrequency', v as string)}
                options={['Real-time', 'Every 15 min', 'Hourly', 'Daily']}
              />
            </SettingRow>
          </>
        );
      case 'feature-flags':
        return (
          <>
            <div {...stylex.props(styles.sectionHeader)}>
              <XDSHeading level={3}>Feature Flags</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Opt in to beta features for this workspace.
              </XDSText>
            </div>
            <XDSDivider />
            <SettingRow
              label="AI product descriptions"
              description="Beta: Generate descriptions with AI.">
              <XDSSwitch
                label="AI descriptions"
                isSelected={s.aiDescriptions}
                onChange={v => upd('aiDescriptions', v)}
              />
            </SettingRow>
            <SettingRow
              label="Bulk variant editor"
              description="Beta: Edit variants across products.">
              <XDSSwitch
                label="Bulk variant editor"
                isSelected={s.bulkVariantEditor}
                onChange={v => upd('bulkVariantEditor', v)}
              />
            </SettingRow>
            <SettingRow
              label="Advanced analytics"
              description="Beta: Extended performance metrics.">
              <XDSSwitch
                label="Advanced analytics"
                isSelected={s.advancedAnalytics}
                onChange={v => upd('advancedAnalytics', v)}
              />
            </SettingRow>
          </>
        );
      default:
        return null;
    }
  };

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
      <div {...stylex.props(styles.dialogBody)}>
        <div {...stylex.props(styles.sectionNav)}>
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
        <div {...stylex.props(styles.contentArea)}>{content()}</div>
      </div>
    </XDSDialog>
  );
}
