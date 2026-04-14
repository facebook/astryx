'use client';

import React from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSBanner} from '@xds/core/Banner';
import {XDSDivider} from '@xds/core/Divider';
import {XDSToken} from '@xds/core/Token';
import {XDSTooltip} from '@xds/core/Tooltip';
import {DialogPreview} from './ProfileView';

export const COMPONENT_PREVIEWS: {[key: string]: React.ReactNode} = {
  button: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Variants</XDSHeading>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap' as const,
          marginBottom: 32,
        }}>
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Secondary" variant="secondary" />
        <XDSButton label="Ghost" variant="ghost" />
      </div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Sizes</XDSHeading>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap' as const,
        }}>
        <XDSButton label="Small" variant="primary" size="sm" />
        <XDSButton label="Medium" variant="primary" size="md" />
        <XDSButton label="Large" variant="primary" size="lg" />
      </div>
    </div>
  ),
  avatar: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Sizes</XDSHeading>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap' as const,
        }}>
        <XDSAvatar name="Alice" size="small" />
        <XDSAvatar name="Bob" size="medium" />
        <XDSAvatar name="Charlie" size="large" />
      </div>
    </div>
  ),
  badge: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Variants</XDSHeading>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap' as const,
        }}>
        <XDSBadge label="Default" />
        <XDSBadge label="Info" variant="info" />
        <XDSBadge label="Success" variant="success" />
        <XDSBadge label="Warning" variant="warning" />
        <XDSBadge label="Error" variant="error" />
      </div>
    </div>
  ),
  card: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Card</XDSHeading>
      </div>
      <div style={{maxWidth: 400}}>
        <XDSCard>
          <div style={{padding: 16}}>
            <XDSHeading level={4}>Card Title</XDSHeading>
            <div style={{marginTop: 8}}>
              <XDSText type="body" color="secondary">
                Cards are containers for grouping related content and actions.
                They provide a flexible surface for displaying information.
              </XDSText>
            </div>
          </div>
        </XDSCard>
      </div>
    </div>
  ),
  banner: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Status Variants</XDSHeading>
      </div>
      <div
        style={{display: 'flex', flexDirection: 'column' as const, gap: 12}}>
        <XDSBanner status="info" title="Information">
          <XDSText type="body">
            This is an informational banner message.
          </XDSText>
        </XDSBanner>
        <XDSBanner status="success" title="Success">
          <XDSText type="body">Operation completed successfully.</XDSText>
        </XDSBanner>
        <XDSBanner status="warning" title="Warning">
          <XDSText type="body">Please review before continuing.</XDSText>
        </XDSBanner>
      </div>
    </div>
  ),
  dialog: <DialogPreview />,
  text: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Typography Scale</XDSHeading>
      </div>
      <div
        style={{display: 'flex', flexDirection: 'column' as const, gap: 12}}>
        <XDSText type="display-1">Display 1</XDSText>
        <XDSText type="display-2">Display 2</XDSText>
        <XDSText type="display-3">Display 3</XDSText>
        <XDSHeading level={1}>Heading 1</XDSHeading>
        <XDSHeading level={2}>Heading 2</XDSHeading>
        <XDSHeading level={3}>Heading 3</XDSHeading>
        <XDSHeading level={4}>Heading 4</XDSHeading>
        <XDSText type="body">Body text</XDSText>
        <XDSText type="supporting">Supporting text</XDSText>
      </div>
    </div>
  ),
  divider: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Divider</XDSHeading>
      </div>
      <div
        style={{display: 'flex', flexDirection: 'column' as const, gap: 24}}>
        <div>
          <XDSText type="supporting" color="secondary">
            Subtle (default)
          </XDSText>
          <div style={{marginTop: 8}}>
            <XDSDivider />
          </div>
        </div>
        <div>
          <XDSText type="supporting" color="secondary">
            Strong
          </XDSText>
          <div style={{marginTop: 8}}>
            <XDSDivider variant="strong" />
          </div>
        </div>
        <div>
          <XDSText type="supporting" color="secondary">
            With label
          </XDSText>
          <div style={{marginTop: 8}}>
            <XDSDivider label="Section" />
          </div>
        </div>
      </div>
    </div>
  ),
  token: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Tokens</XDSHeading>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap' as const,
        }}>
        <XDSToken label="Design" />
        <XDSToken label="Engineering" />
        <XDSToken label="Product" />
        <XDSToken label="Research" />
      </div>
    </div>
  ),
  tooltip: (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Tooltip</XDSHeading>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap' as const,
        }}>
        <XDSTooltip content="Primary action">
          <XDSButton label="Hover me" variant="primary" />
        </XDSTooltip>
        <XDSTooltip content="Secondary action">
          <XDSButton label="Or me" variant="secondary" />
        </XDSTooltip>
        <XDSTooltip content="Ghost action">
          <XDSButton label="Or me" variant="ghost" />
        </XDSTooltip>
      </div>
    </div>
  ),
};
