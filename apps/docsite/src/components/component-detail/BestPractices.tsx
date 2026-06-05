// Copyright (c) Meta Platforms, Inc. and affiliates.

import {XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {BestPracticesBlock} from '../docs/BestPracticesBlock';
import type {BestPractice} from '../../generated/componentRegistry';

interface BestPracticesProps {
  practices: BestPractice[];
}

export function BestPractices({practices}: BestPracticesProps) {
  if (practices.length === 0) {
    return null;
  }

  return (
    <XDSSection>
      <XDSVStack gap={4}>
        <XDSHeading level={2} type="display-3">
          Best practices
        </XDSHeading>
        <BestPracticesBlock items={practices} />
      </XDSVStack>
    </XDSSection>
  );
}
