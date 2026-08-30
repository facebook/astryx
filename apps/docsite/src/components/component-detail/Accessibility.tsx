// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading, Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import type {AccessibilityRequirement} from '../../generated/componentRegistry';
import {MarkdownText} from '../MarkdownText';

interface AccessibilityProps {
  requirements: AccessibilityRequirement[];
}

export function Accessibility({requirements}: AccessibilityProps) {
  if (requirements.length === 0) {
    return null;
  }

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={2} type="display-3">
          Accessibility
        </Heading>
        <Text type="large" weight="normal">
          Requirements and supported content combinations to preserve when using
          this component.
        </Text>
      </VStack>

      <VStack gap={3}>
        {requirements.map((requirement, index) => (
          <Card key={`${requirement.name}-${index}`}>
            <VStack gap={2}>
              <Heading level={3}>{requirement.name}</Heading>
              <MarkdownText>{requirement.description}</MarkdownText>
            </VStack>
          </Card>
        ))}
      </VStack>
    </VStack>
  );
}
