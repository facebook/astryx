'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';

const folders = [
  {label: 'Documents', active: false},
  {label: 'Projects', active: true},
  {label: 'Downloads', active: false},
];

export default function LayoutDualPanelLayout() {
  return (
    <XDSCard width="100%" maxWidth={800} height={400}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <div style={{fontWeight: 600, fontSize: 18}}>File Browser</div>
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
              Folders
            </div>
            {folders.map((folder) => (
              <div
                key={folder.label}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  ...(folder.active ? {fontWeight: 500} : {}),
                }}>
                {folder.label}
              </div>
            ))}
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
              Files
            </div>
            <div
              style={{
                borderRadius: 8,
                padding: 16,
                fontSize: 14,
                backgroundColor: 'rgba(0,0,0,0.04)',
              }}>
              Select a folder to view its contents
            </div>
          </XDSLayoutContent>
        }
        end={
          <XDSLayoutPanel hasDivider>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
              Details
            </div>
            <p style={{fontSize: 14, lineHeight: 1.5, margin: 0}}>
              Select a file to view details
            </p>
          </XDSLayoutPanel>
        }
      />
    </XDSCard>
  );
}
