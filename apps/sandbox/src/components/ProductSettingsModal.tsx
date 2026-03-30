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
      <div style={{display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0}}>
        {/* Section nav */}
        <div
          style={{
            width: 192,
            flexShrink: 0,
            borderRight: '1px solid #E5E7EB',
            overflowY: 'auto',
            padding: '8px',
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
        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
          <div style={{fontSize: 18, fontWeight: 600, color: '#0A1317'}}>
            {active}
          </div>
          <div style={{fontSize: 14, color: '#6B7280'}}>
            Configure {active.toLowerCase()} settings for this product
            workspace.
          </div>
          <div style={{height: 1, backgroundColor: '#E5E7EB'}} />
          {/* Static setting rows */}
          {[
            ['Default view', 'Grid'],
            ['Items per page', '24'],
            ['Currency', 'Symbol ($)'],
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
              <div style={{fontSize: 14, color: '#111827'}}>{label}</div>
              <div
                style={{
                  padding: '6px 10px',
                  border: '1px solid #D1D5DB',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#374151',
                  backgroundColor: '#F9FAFB',
                }}>
                {val}
              </div>
            </div>
          ))}
          {[
            ['Low stock alerts', 'on'],
            ['Track by variant', 'on'],
            ['Show compare-at', 'on'],
          ].map(([label, state]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBlock: 12,
                borderBottom: '1px solid #F3F4F6',
              }}>
              <div style={{fontSize: 14, color: '#111827'}}>{label}</div>
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: state === 'on' ? '#0064E0' : '#D1D5DB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: state === 'on' ? 'flex-end' : 'flex-start',
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
