// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Switch} from '@astryxdesign/core/Switch';

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
          <VStack gap={4}>
            <Heading level={2}>Build with Astryx</Heading>
            <Text type="body" color="secondary">
              Open source components for the web and beyond
            </Text>
          </VStack>
          <HStack gap={2}>
            <Button label="Get started" variant="primary" size="md" />
            <Button label="Read docs" variant="secondary" size="md" />
          </HStack>
        </div>

        {/* Card 2: Settings — middle column, row 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <VStack gap={4}>
            <Text type="body" weight="bold">
              Settings
            </Text>
            <Switch
              label="Light mode"
              value={lightMode}
              onChange={setLightMode}
            />
            <Switch
              label="Animations"
              value={animations}
              onChange={setAnimations}
            />
            <Switch label="Compact" value={compact} onChange={setCompact} />
          </VStack>
        </div>

        {/* Card 3: Stats — right column, row 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <VStack gap={3}>
            <Heading level={3}>Components</Heading>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1,
                color: '#111',
              }}>
              48
            </div>
            <Text type="supporting" color="secondary">
              +12 this quarter
            </Text>
            <HStack gap={1} vAlign="end">
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
            </HStack>
            <Text type="supporting" color="secondary">
              Coverage → 87%
            </Text>
            <Text type="supporting" color="secondary">
              Adoption → 92%
            </Text>
          </VStack>
        </div>

        {/* Card 4: Badges — middle column, row 2 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <VStack gap={3}>
            <HStack gap={2}>
              <Badge label="v0.0.8 Released" variant="success" />
            </HStack>
            <HStack gap={2}>
              <Badge label="Open Source" variant="info" />
            </HStack>
            <HStack gap={2}>
              <Badge label="AI Ready" variant="warning" />
            </HStack>
          </VStack>
        </div>

        {/* Card 5: Avatars — right column, row 2 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
          <VStack gap={3}>
            <HStack gap={2}>
              <Avatar name="Ruby C" />
              <Avatar name="Cindy Z" />
              <Avatar name="Alex M" />
              <Avatar name="Sam K" />
              <Avatar name="+3" />
            </HStack>
            <Text type="supporting" color="secondary">
              Astryx Core Team
            </Text>
          </VStack>
        </div>
      </div>
    </div>
  );
}
