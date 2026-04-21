'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function ToolbarPageHeader() {
  return (
    <XDSCard>
      <XDSToolbar
        label="Page navigation"
        dividers={['bottom']}
        startContent={
          <XDSButton
            label="Back to projects"
            variant="ghost"
            icon={
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            }
            isIconOnly
          />
        }
        centerContent={<XDSHeading level={3}>Project Settings</XDSHeading>}
        endContent={
          <>
            <XDSButton label="Reset" variant="ghost" />
            <XDSButton label="Save changes" />
          </>
        }
      />
      <XDSSection>
        <XDSText type="body">Settings form content...</XDSText>
      </XDSSection>
    </XDSCard>
  );
}
