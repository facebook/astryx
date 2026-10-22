// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs find-a-component/by-job`: the Core component for each
 * common job, one table per family of jobs. Each row names components only;
 * their props live in `astryx component <Name>`.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'by-job',
  placement: {parent: 'namespace:find-a-component', slot: 'guides', order: 10},
  title: 'Components by job',
  category: 'guide',
  description:
    'The Core component for each job: overlays, feedback, data display, choices, text input, navigation, disclosure, media, copy, and charts.',
  keywords: ['what do I use', 'component for a job', 'kpi'],
  sections: [
    {
      id: 'how-to-read',
      title: 'How to read this map',
      content: [
        {
          type: 'prose',
          text: 'Find the job, take the first component in its row, then run `astryx component <Name> --dense` for props and examples. A later name in a row covers a narrower case. Every name here is a Core component unless the row says hook.',
        },
      ],
    },
    {
      id: 'overlays',
      title: 'Overlays',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            ['Ask for input or show a task on top of the page', 'Dialog'],
            ['Confirm a destructive or final action', 'AlertDialog'],
            [
              'Side panel that slides in over the page',
              'Drawer, BottomSheet on narrow screens',
            ],
            [
              'Rich content anchored to a trigger',
              'Popover, HoverCard on hover',
            ],
            ['Short label for an icon or control', 'Tooltip'],
            [
              'List of actions from a button or right click',
              'DropdownMenu, ContextMenu, MoreMenu',
            ],
            ['Search every action by keyboard', 'CommandPalette'],
          ],
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            ['Brief notice that goes away on its own', 'Toast'],
            ['Message that stays at the top of a page or section', 'Banner'],
            ['Known progress', 'ProgressBar, Stepper for steps'],
            ['Unknown wait', 'Spinner, Skeleton while content loads'],
            ['Nothing to show yet, or no results', 'EmptyState'],
            ['Status or count beside a label', 'Badge, StatusDot'],
          ],
        },
      ],
    },
    {
      id: 'data-display',
      title: 'Data display',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            ['Rows and columns, sorting, selection', 'Table'],
            [
              'A list of items',
              'List, OverflowList for a row that hides what does not fit',
            ],
            ['Label and value pairs', 'MetadataList'],
            [
              'A group of related content',
              'Card, ClickableCard when the whole card is a link',
            ],
            ['A person or entity', 'Avatar, AvatarGroup'],
            ['Nested items that expand', 'TreeList'],
            ['A date or time as people read it', 'Timestamp'],
          ],
        },
      ],
    },
    {
      id: 'choices',
      title: 'Choose one or many',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            [
              'One choice from a list',
              'Selector, Typeahead for a large or async list',
            ],
            ['One choice with rich custom rows', 'ComplexSelector'],
            [
              'Several choices from a list',
              'MultiSelector, Tokenizer for removable chips',
            ],
            [
              'One choice from a few, all visible',
              'RadioList, SegmentedControl for 2 to 5 short options',
            ],
            ['Several choices from a few, all visible', 'CheckboxList'],
            ['On or off', 'Switch, CheckboxInput inside a form'],
            ['Pick from cards', 'SelectableCard'],
            ['Filter by several fields at once', 'PowerSearch'],
          ],
        },
      ],
    },
    {
      id: 'text-input',
      title: 'Text and value input',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            [
              'One line of text',
              'TextInput, InputGroup to attach text or buttons',
            ],
            ['Several lines', 'TextArea'],
            ['A number', 'NumberInput, Slider for a range'],
            [
              'A date, time, or range',
              'DateInput, TimeInput, DateTimeInput, DateRangeInput, Calendar',
            ],
            ['A file', 'FileInput'],
            [
              'Label, help, and error around any input',
              'Field, FormLayout for the whole form',
            ],
          ],
        },
      ],
    },
    {
      id: 'navigation',
      title: 'Navigation',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            [
              'Switch between views in one place',
              'TabList with Tab, TabMenu when tabs overflow',
            ],
            ['Where am I in a hierarchy', 'Breadcrumbs'],
            ['Page through results', 'Pagination'],
            [
              'App navigation',
              'SideNav, TopNav, MobileNav, all inside AppShell',
            ],
            ['A link in text', 'Link'],
          ],
        },
      ],
    },
    {
      id: 'disclosure-and-media',
      title: 'Disclosure and media',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            [
              'Show and hide a section',
              'Collapsible, CollapsibleGroup for an accordion',
            ],
            ['An image at a fixed shape', 'Thumbnail, AspectRatio'],
            ['Full-screen image viewer', 'Lightbox'],
            ['Slides one at a time', 'Carousel'],
          ],
        },
      ],
    },
    {
      id: 'text-and-copy',
      title: 'Text and copy',
      content: [
        {
          type: 'table',
          headers: ['Job', 'Use'],
          rows: [
            ['Body text and titles', 'Text, Heading'],
            ['Rendered markdown', 'Markdown'],
            [
              'Code inline or in a block',
              'Code, CodeBlock (it has a copy button)',
            ],
            ['A keyboard shortcut', 'Kbd'],
            [
              'A copy button for any value',
              'IconButton with the useClipboard hook (`astryx hook useClipboard`)',
            ],
          ],
        },
      ],
    },
    {
      id: 'charts-and-trends',
      title: 'Charts and trends',
      content: [
        {
          type: 'prose',
          text: 'Core has no chart component. Draw the series with your chart library and color it with the data visualization tokens in {@link generic:all-tokens}. For a KPI with a trend, put the value in Heading, the change in Text or Badge, and the target in ProgressBar. `astryx build "analytics dashboard"` returns a page template that already lays these out.',
        },
      ],
    },
  ],
};
