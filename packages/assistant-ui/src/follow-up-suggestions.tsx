// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file follow-up-suggestions.tsx
 * @input Uses assistant-ui suggestion primitives and Astryx Button/HStack
 * @output Exports FollowUpSuggestions
 * @position Ready composition for runtime-provided follow-up prompts
 */

import type {FC} from 'react';
import {SuggestionPrimitive, ThreadPrimitive} from '@assistant-ui/react';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/HStack';

export interface FollowUpSuggestionsProps {
  label?: string;
  send?: boolean;
}

export const FollowUpSuggestions: FC<FollowUpSuggestionsProps> = ({
  label = 'Suggested follow-up prompts',
  send = true,
}) => (
  <HStack aria-label={label} as="nav" gap={1} justify="center" wrap="wrap">
    <ThreadPrimitive.Suggestions>
      {() => (
        <SuggestionPrimitive.Trigger asChild send={send}>
          <Button label="Use suggested prompt" size="sm" variant="ghost">
            <SuggestionPrimitive.Title />
          </Button>
        </SuggestionPrimitive.Trigger>
      )}
    </ThreadPrimitive.Suggestions>
  </HStack>
);
