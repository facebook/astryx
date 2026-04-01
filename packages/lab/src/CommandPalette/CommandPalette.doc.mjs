/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPalette',
  description:
    'A searchSource-driven command palette dialog. Provide a search source, get filtering, keyboard navigation, and selection for free. Uses the same XDSSearchSource interface as XDSTypeahead.',
  features: [
    'searchSource: Same XDSSearchSource interface as XDSTypeahead — static, async, or hybrid',
    'Progressive disclosure: No children = default rendering; children render function = full control',
    'Auto-grouping: Items with auxiliaryData.group are auto-grouped in default rendering',
    'createStaticSource: Utility for static lists with optional keyword matching',
    'Async support: isBusy context signal + spinner in input while search resolves',
    'Keyboard navigation: Arrow keys, Enter to select, Escape to close',
    'Picker mode: value/onValueChange for persistent selection',
  ],
  examples: [
    {
      label: 'Simplest — default rendering',
      code: `import {XDSCommandPalette, XDSCommandPaletteInput, XDSCommandPaletteFooter} from '@xds/lab';
import {createStaticSource} from '@xds/core/Typeahead';
import {useState} from 'react';

const source = createStaticSource([
  {id: 'home', label: 'Home'},
  {id: 'settings', label: 'Settings'},
]);

function Example() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <XDSCommandPalette
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      searchSource={source}
      input={<XDSCommandPaletteInput placeholder="Search..." />}
      footer={<XDSCommandPaletteFooter />}
    />
  );
}`,
    },
    {
      label: 'Custom rendering with groups',
      code: `import {XDSCommandPalette, XDSCommandPaletteInput, XDSCommandPaletteItem, XDSCommandPaletteGroup} from '@xds/lab';
import {createStaticSource} from '@xds/core/Typeahead';

<XDSCommandPalette
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  searchSource={source}
  input={<XDSCommandPaletteInput placeholder="Search..." />}>
  {(items) => {
    const grouped = items.filter(i => i.auxiliaryData?.group === 'Navigation');
    return (
      <XDSCommandPaletteGroup heading="Navigation">
        {grouped.map(item => (
          <XDSCommandPaletteItem key={item.id} value={item.id}>
            {item.label}
          </XDSCommandPaletteItem>
        ))}
      </XDSCommandPaletteGroup>
    );
  }}
</XDSCommandPalette>`,
    },
  ],
  props: {
    isOpen: {
      type: 'boolean',
      required: true,
      description: 'Whether the command palette is open.',
    },
    onOpenChange: {
      type: '(isOpen: boolean) => void',
      required: true,
      description: 'Called when the palette visibility changes.',
    },
    searchSource: {
      type: 'XDSSearchSource<T>',
      required: true,
      description: 'Search source providing items via search(query) and bootstrap(). Use createStaticSource for static lists.',
    },
    input: {
      type: 'ReactNode',
      description: 'Input slot — typically XDSCommandPaletteInput.',
    },
    footer: {
      type: 'ReactNode',
      description: 'Footer slot — typically XDSCommandPaletteFooter.',
    },
    children: {
      type: '(items: T[]) => ReactNode',
      description: 'Custom render function. When omitted, default rendering is used (label text, auto-grouped by auxiliaryData.group).',
    },
    value: {
      type: 'string',
      description: 'Controlled selected value for picker mode.',
    },
    onValueChange: {
      type: '(value: string) => void',
      description: 'Called when the selected value changes.',
    },
    label: {
      type: 'string',
      default: "'Command palette'",
      description: 'Accessible label for the dialog.',
    },
    width: {
      type: 'number | string',
      default: '640',
      description: 'Width of the dialog.',
    },
    maxHeight: {
      type: 'number | string',
      default: '480',
      description: 'Maximum height of the dialog.',
    },
  },
};
