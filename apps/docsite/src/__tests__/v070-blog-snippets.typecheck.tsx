// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Banner} from '@astryxdesign/core/Banner';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Typeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  markdownSoftBreaksPlugin,
  markdownSourceLinesPlugin,
} from '@astryxdesign/core/Markdown/plugins';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';
import {useAnnounce} from '@astryxdesign/core/hooks';

const styles = stylex.create({
  projectName: {width: '100%'},
  assigneeField: {width: '100%'},
  series: {backgroundColor: dataVars['--color-data-categorical-blue']},
});

const peopleSource = createStaticSource([
  {id: 'ada', label: 'Ada'},
  {id: 'grace', label: 'Grace'},
]);
const labelActions = [{label: 'Bug'}, {label: 'Feature'}];

export function Forms() {
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState<{id: string; label: string} | null>(
    null,
  );
  return (
    <>
      <TextInput
        label="Project name"
        value={name}
        onChange={setName}
        controlXstyle={styles.projectName}
      />
      <Typeahead
        label="Assignee"
        searchSource={peopleSource}
        value={assignee}
        onChange={setAssignee}
        containerXstyle={styles.assigneeField}
        emptySearchText="No people found"
      />
    </>
  );
}

function createLabel() {}
function CustomEdgeToEdgeFilters() {
  return null;
}
export function Overlays() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <DropdownMenu
        button={{label: 'Labels'}}
        header={
          <TextInput label="Filter labels" value={query} onChange={setQuery} />
        }
        footer={<Button label="Create label" onClick={createLabel} />}
        items={labelActions}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Filters"
        padding={0}>
        <CustomEdgeToEdgeFilters />
      </BottomSheet>
    </>
  );
}

const releaseNotes = '# Release';
export function Content() {
  return (
    <Markdown plugins={[markdownSoftBreaksPlugin, markdownSourceLinesPlugin]}>
      {releaseNotes}
    </Markdown>
  );
}

async function save() {}
export function Accessibility() {
  const announce = useAnnounce();
  async function saveSettings() {
    await save();
    announce('Settings saved');
  }
  void saveSettings;
  return <Banner status="success" title="Settings saved" />;
}

void styles.series;
