// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
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
    <Section>
      <VStack gap={4}>
        <Heading level={2} type="display-3">
          Best practices
        </Heading>
        <BestPracticesBlock items={practices} />
      </VStack>
    </Section>
  );
}
