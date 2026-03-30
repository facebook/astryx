'use client';
import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSDivider} from '@xds/core';

const SECTIONS = [
  'General',
  'Inventory',
  'Catalog',
  'Pricing',
  'Media',
  'Notifications',
  'Integrations',
  'Feature Flags',
];

export function ProductSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState('General');
  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={(_: boolean) => onClose()}
      purpose="info"
      width={800}
      maxHeight={560}>
      <XDSDialogHeader
        title="Product Settings"
        subtitle="Configure this workspace. Changes save immediately."
        onOpenChange={(_: boolean) => onClose()}
      />
      <XDSDivider />
      <div style={{display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0}}>
        <div
          style={{
            width: 192,
            flexShrink: 0,
            borderRight: '1px solid #E5E7EB',
            overflowY: 'auto',
            padding: 8,
          }}>
          {SECTIONS.map(s => (
            <div
              key={s}
              onClick={() => setActive(s)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 2,
                backgroundColor: active === s ? '#EEF2FF' : 'transparent',
                color: active === s ? '#4F46E5' : '#374151',
                fontWeight: active === s ? 600 : 400,
              }}>
              {s}
            </div>
          ))}
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
          <div style={{fontSize: 18, fontWeight: 600}}>{active}</div>
          <div style={{fontSize: 14, color: '#6B7280'}}>
            Configure {active.toLowerCase()} settings for this workspace.
          </div>
          <div style={{height: 1, backgroundColor: '#E5E7EB'}} />
          {[
            ['Default view', 'Grid'],
            ['Items per page', '24'],
            ['Currency', 'Symbol ($)'],
            ['Sort order', 'Newest first'],
            ['Sync frequency', 'Hourly'],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBlock: 12,
                borderBottom: '1px solid #F3F4F6',
              }}>
              <span style={{fontSize: 14, color: '#111827'}}>{label}</span>
              <span
                style={{
                  padding: '6px 10px',
                  border: '1px solid #D1D5DB',
                  borderRadius: 6,
                  fontSize: 14,
                  backgroundColor: '#F9FAFB',
                  color: '#374151',
                }}>
                {val}
              </span>
            </div>
          ))}
          {[
            ['Low stock alerts', true],
            ['Track by variant', true],
            ['Show compare-at', true],
            ['Google sync', false],
            ['AI descriptions', false],
          ].map(([label, on]) => (
            <div
              key={String(label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBlock: 12,
                borderBottom: '1px solid #F3F4F6',
              }}>
              <span style={{fontSize: 14, color: '#111827'}}>{label}</span>
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: on ? '#0064E0' : '#D1D5DB',
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
            </div>
          ))}
        </div>
      </div>
    </XDSDialog>
  );
}
