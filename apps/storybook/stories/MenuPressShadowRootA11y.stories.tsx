// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuPressShadowRootA11y.stories.tsx
 * @input Uses Selector from core, React DOM's createRoot, an open shadow root
 * @output The fixture the menu-press shadow-root spec drives in a real
 *   browser: a Selector rendered inside an open shadow root, with its value
 *   printed outside it.
 * @position The reproduction path for
 *   `packages/core/src/hooks/__tests__/MenuPressShadowRoot.a11y.chromium.spec.ts`.
 *
 * Inside a shadow root `document.elementFromPoint` answers with the shadow
 * host, so a menu that hit-tests through the document never finds the row
 * under a released pointer. Unstyled on purpose: the hit test, not the paint,
 * is under test.
 *
 * SYNC: The spec navigates to this story id by name.
 */

import type {Meta, StoryObj} from '@storybook/react';
import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Selector} from '@astryxdesign/core/Selector';

const meta: Meta = {
  title: 'a11y/Menu press in a shadow root',
  tags: ['no-visual'],
};

export default meta;

function ShadowSelector({onChange}: {onChange: (value: string) => void}) {
  const [value, setValue] = useState('');
  return (
    <Selector
      label="Fruit"
      options={['Apple', 'Banana', 'Orange']}
      value={value}
      onChange={next => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

export const SelectorInShadowRoot: StoryObj = {
  render: function SelectorInShadowRootStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState('');
    useEffect(() => {
      const host = hostRef.current;
      if (host == null) {
        return;
      }
      const shadow = host.shadowRoot ?? host.attachShadow({mode: 'open'});
      const container = document.createElement('div');
      shadow.append(container);
      const root = createRoot(container);
      root.render(<ShadowSelector onChange={setValue} />);
      return () => {
        root.unmount();
        container.remove();
      };
    }, []);
    return (
      <>
        <div ref={hostRef} data-testid="shadow-host" />
        <output data-testid="selected-value">{value}</output>
      </>
    );
  },
};
