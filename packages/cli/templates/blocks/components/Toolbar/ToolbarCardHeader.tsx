'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function ToolbarCardHeader() {
  return (
    <XDSCard width={600}>
      <XDSToolbar
        label="User list actions"
        size="sm"
        dividers={['bottom']}
        startContent={<XDSHeading level={4}>Users</XDSHeading>}
        endContent={
          <>
            <XDSButton
              label="Filter"
              variant="ghost"
              size="sm"
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
                  <path d="M1.5 3h13L9.5 9v4l-3 1.5V9L1.5 3z" />
                </svg>
              }
              isIconOnly
            />
            <XDSButton
              label="Add user"
              size="sm"
              icon={
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              }
              isIconOnly
            />
          </>
        }
      />
      <XDSSection>
        <XDSText type="body">Table rows go here...</XDSText>
      </XDSSection>
    </XDSCard>
  );
}
