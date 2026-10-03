// Copyright (c) Meta Platforms, Inc. and affiliates.
// Shared pieces of the candidate-API stubs. Everything not overridden by an
// arm comes straight from the real core sources, so an output that imports a
// real component (Icon, IconButton, Button) typechecks against the real
// surface. The MultiSelector surface is narrowed to what the reference page
// documents, so a prop the page never mentioned is a type error — the
// deterministic half of the hallucination signal.
import type {ReactNode} from 'react';

export type BaseOptionData = {
  value: string;
  label?: string;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type BaseProps<Opt extends BaseOptionData> = {
  label: string;
  options: ReadonlyArray<string | Opt>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hasSearch?: boolean;
  hasSelectAll?: boolean;
  isDisabled?: boolean;
  emptyText?: ReactNode;
  renderOption?: (option: Opt) => ReactNode;
};
