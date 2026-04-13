'use client';

import {useState} from 'react';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSSwitch} from '@xds/core/Switch';

const BAR_HEIGHTS = [28, 40, 22, 48, 34, 18, 44, 30];

export default function ShowcaseComponentsPage() {
  const [lightMode, setLightMode] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [compact, setCompact] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#e8e0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 280px 340px',
          gridTemplateRows: 'auto auto',
          gap: 18,
        }}>
        {/* Card 1: Hero — left column, spans 2 rows */}
        <div
          style={{
            backgroundColor: '#f0eafc',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
            gridRow: 'span 2',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
          }}>
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Build with XDS</XDSHeading>
            <XDSText type="body" color="secondary">
              Open source components for Nest and beyond
            </XDSText>
          </XDSVStack>
          <XDSHStack gap={2}>
            <XDSButton label="Get started" variant="primary" size="md" />
            <XDSButton label="Read docs" variant="secondary" size="md" />
          </XDSHStack>
        </div>

        {/* Card 2: Settings — middle column, row 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <XDSVStack gap={4}>
            <XDSText type="body" weight="bold">
              Settings
            </XDSText>
            <XDSSwitch
              label="Light mode"
              value={lightMode}
              onChange={setLightMode}
            />
            <XDSSwitch
              label="Animations"
              value={animations}
              onChange={setAnimations}
            />
            <XDSSwitch label="Compact" value={compact} onChange={setCompact} />
          </XDSVStack>
        </div>

        {/* Card 3: Stats — right column, row 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <XDSVStack gap={3}>
            <XDSHeading level={3}>Components</XDSHeading>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1,
                color: '#111',
              }}>
              48
            </div>
            <XDSText type="supporting" color="secondary">
              +12 this quarter
            </XDSText>
            <XDSHStack gap={1} vAlign="end">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 3,
                    width: 20,
                    height: h,
                    backgroundColor: '#6366f1',
                  }}
                />
              ))}
            </XDSHStack>
            <XDSText type="supporting" color="secondary">
              Coverage → 87%
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Adoption → 92%
            </XDSText>
          </XDSVStack>
        </div>

        {/* Card 4: Badges — middle column, row 2 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <XDSVStack gap={3}>
            <XDSHStack gap={2}>
              <XDSBadge label="v0.0.8 Released" variant="success" />
            </XDSHStack>
            <XDSHStack gap={2}>
              <XDSBadge label="Open Source" variant="info" />
            </XDSHStack>
            <XDSHStack gap={2}>
              <XDSBadge label="AI Ready" variant="warning" />
            </XDSHStack>
          </XDSVStack>
        </div>

        {/* Card 5: Avatars — right column, row 2 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <XDSVStack gap={3}>
            <XDSHStack gap={2}>
              <XDSAvatar name="Ruby C" />
              <XDSAvatar name="Cindy Z" />
              <XDSAvatar name="Alex M" />
              <XDSAvatar name="Sam K" />
              <XDSAvatar name="+3" />
            </XDSHStack>
            <XDSText type="supporting" color="secondary">
              XDS Core Team
            </XDSText>
          </XDSVStack>
        </div>
      </div>
    </div>
  );
}
