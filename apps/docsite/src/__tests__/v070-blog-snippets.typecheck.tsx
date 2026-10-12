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
  createMarkdownFenceTransform,
  createMarkdownFrontmatter,
  createMarkdownHeadingLinks,
  createMarkdownPlugin,
  createMarkdownTextTransform,
  markdownSoftBreaksPlugin,
  markdownSourceLinesPlugin,
  type MarkdownExtensionNode,
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

const source = '# Release';

const frontmatter = createMarkdownFrontmatter({
  name: 'release-notes',
  parse: fields => ({
    title: typeof fields.title === 'string' ? fields.title : 'Untitled',
    status: typeof fields.status === 'string' ? fields.status : 'draft',
  }),
});

const specLinks = createMarkdownPlugin({
  name: 'spec-links',
  apiVersion: 1,
  transform: createMarkdownTextTransform({
    pattern: /\bAST-(\d{3})\b/g,
    requiredSubstrings: ['AST-'],
    replace: match => ({
      type: 'link',
      url: `/specs/${match[0]}`,
      children: [{type: 'text', value: match[0]}],
    }),
  }),
});

type CalloutNode = MarkdownExtensionNode<
  'callouts',
  'callout',
  {readonly title: string; readonly body: string},
  'block'
>;

const callouts = createMarkdownPlugin<'callouts', CalloutNode>({
  name: 'callouts',
  apiVersion: 1,
  transform: createMarkdownFenceTransform({
    languages: ['callout'],
    createNode: ({code}) => {
      const [title, ...body] = code.split('\n');
      return {
        type: 'extension',
        plugin: 'callouts',
        name: 'callout',
        display: 'block',
        data: {title, body: body.join(' ')},
      };
    },
  }),
  renderers: {
    callout: {
      render: ({node}) => (
        <Banner
          status="warning"
          title={node.data.title}
          description={node.data.body}
        />
      ),
      toText: node => `${node.data.title}\n${node.data.body}`,
    },
  },
});

const headingLinks = createMarkdownHeadingLinks({
  permalinkBaseUrl: 'https://astryx.atmeta.com/blog/astryx-v0-7-0',
});

function ProductMath({
  source,
  display,
}: {
  source: string;
  display: 'inline' | 'block';
}) {
  return display === 'block' ? <div>{source}</div> : <span>{source}</span>;
}

function MathExpression({
  value,
  display,
}: {
  value: string;
  display: 'inline' | 'block';
}) {
  return <ProductMath source={value} display={display} />;
}

export function Content() {
  const result = frontmatter.parse(source);
  void result;
  return (
    <>
      <Markdown plugins={[markdownSoftBreaksPlugin]}>{source}</Markdown>
      <Markdown plugins={[frontmatter.plugin]}>{source}</Markdown>
      <Markdown plugins={[specLinks]}>{source}</Markdown>
      <Markdown plugins={[callouts]}>{source}</Markdown>
      <Markdown plugins={[headingLinks]}>{source}</Markdown>
      <Markdown plugins={[markdownSourceLinesPlugin]}>{source}</Markdown>
      <Markdown components={{math: MathExpression}}>{source}</Markdown>
    </>
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
