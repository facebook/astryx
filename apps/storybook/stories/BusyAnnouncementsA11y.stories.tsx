// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BusyAnnouncementsA11y.stories.tsx
 * @input Real busy controls, native Dialog, and a manually settled search source
 * @output Repeatable page/modal busy-start and palette bootstrap scenarios
 * @position AST-086 routing fixtures; real-AT revalidation entry points for AST-009
 */

import {StrictMode, useMemo, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Dialog} from '@astryxdesign/core/Dialog';
import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';

const meta: Meta = {
  title: 'a11y/Busy announcements',
  tags: ['no-visual'],
};
export default meta;

function BusyControls({modal = false}: {modal?: boolean}) {
  const [isBusy, setIsBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const [control, setControl] = useState('TextInput');
  const content = (
    <div data-busy-fixture>
      <label>
        Busy control
        <select
          value={control}
          onChange={event => setControl(event.target.value)}>
          <option>TextInput</option>
          <option>Switch</option>
          <option>CheckboxInput</option>
          <option>Native date</option>
          <option>Touch date</option>
        </select>
      </label>
      {control === 'TextInput' ? (
        <TextInput label="Email" value="" isLoading={isBusy} />
      ) : control === 'Switch' ? (
        <Switch label="Enable" value={false} isLoading={isBusy} />
      ) : control === 'CheckboxInput' ? (
        <CheckboxInput label="Accept" value={false} isLoading={isBusy} />
      ) : (
        <DateInput
          label="Date"
          presentation={control === 'Native date' ? 'native' : 'bottom-sheet'}
          isLoading={isBusy}
        />
      )}
      <button type="button" onClick={() => setIsBusy(!isBusy)}>
        {isBusy ? 'Finish work' : 'Start work'}
      </button>
      <button type="button" onClick={() => setRevision(revision + 1)}>
        Rerender
      </button>
      <span data-revision>{revision}</span>
    </div>
  );
  return modal ? (
    <Dialog isOpen onOpenChange={() => {}} aria-label="Busy controls">
      {content}
    </Dialog>
  ) : (
    content
  );
}

export const PageControls: StoryObj = {
  render: () => (
    <StrictMode>
      <BusyControls />
    </StrictMode>
  ),
};

export const InitiallyBusyModal: StoryObj = {
  render: () => (
    <StrictMode>
      <BusyControls modal />
    </StrictMode>
  ),
};

function PaletteLoads() {
  const [isOpen, setIsOpen] = useState(true);
  const pending = useRef<((items: SearchableItem[]) => void)[]>([]);
  const source = useMemo<SearchSource>(() => {
    const request = async () =>
      new Promise<SearchableItem[]>(resolve => {
        pending.current.push(resolve);
      });
    return {bootstrap: request, search: request};
  }, []);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open palette
      </button>
      <CommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
        footer={
          <button
            type="button"
            onClick={() => {
              pending.current
                .splice(0)
                .forEach(resolve => resolve([{id: 'one', label: 'One'}]));
            }}>
            Finish load
          </button>
        }
      />
    </>
  );
}

export const PaletteBusyStarts: StoryObj = {
  render: () => (
    <StrictMode>
      <PaletteLoads />
    </StrictMode>
  ),
};
