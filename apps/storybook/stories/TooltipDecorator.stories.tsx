// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TooltipDecorator.stories.tsx
 * @input Real Lexical decorator selection and Astryx Button tooltips.
 * @output A selectable image whose controls mount and unmount inside an editor.
 * @position Browser regression fixture for TooltipDecorator.a11y.browser.spec.ts.
 */

import {useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  DecoratorNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical';
import {Button} from '@astryxdesign/core/Button';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120"><rect width="240" height="120" fill="silver"/><path d="M0 120 80 30 140 90 180 50 240 120" fill="gray"/></svg>',
)}`;

function ImageControls({nodeKey}: {nodeKey: NodeKey}) {
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  return (
    <span>
      <img
        src={IMAGE}
        alt="Selectable landscape"
        width={240}
        height={120}
        onClick={() => {
          clearSelection();
          setSelected(true);
        }}
      />
      {isSelected && (
        <span>
          <Button label="Smaller" size="sm" tooltip="Narrow it" />
          <Button label="Larger" size="sm" tooltip="Widen it" />
        </span>
      )}
    </span>
  );
}

class ImageNode extends DecoratorNode<ReactNode> {
  static getType() {
    return 'tooltip-image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM() {
    const element = document.createElement('span');
    element.contentEditable = 'false';
    return element;
  }

  updateDOM() {
    return false;
  }

  static importJSON() {
    return new ImageNode();
  }

  exportJSON(): SerializedLexicalNode {
    return {...super.exportJSON(), type: 'tooltip-image', version: 1};
  }

  decorate() {
    return <ImageControls nodeKey={this.getKey()} />;
  }
}

export function TooltipDecoratorFixture({
  isReadOnly = false,
}: {
  isReadOnly?: boolean;
}) {
  const [isMounted, setMounted] = useState(true);
  return (
    <VStack gap={4}>
      <Text>
        Select the image, hover a control, then click the editor text.
      </Text>
      <HStack gap={2}>
        <Button label="Toggle editor" onClick={() => setMounted(!isMounted)} />
        <Button label="Outside control" tooltip="Outside the editor" />
      </HStack>
      {isMounted && (
        <LexicalComposer
          initialConfig={{
            namespace: 'TooltipDecorator',
            editable: !isReadOnly,
            nodes: [ImageNode],
            onError: error => {
              throw error;
            },
            editorState: () => {
              $getRoot().append(
                $createParagraphNode().append(
                  $createTextNode('Click this text to deselect the image.'),
                ),
                $createParagraphNode().append(new ImageNode()),
              );
            },
          }}>
          <section>
            <RichTextPlugin
              contentEditable={<ContentEditable aria-label="Image editor" />}
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </section>
        </LexicalComposer>
      )}
    </VStack>
  );
}

const meta: Meta = {
  title: 'Core/Tooltip',
  tags: ['no-visual'],
  parameters: {
    docs: {
      description: {
        component:
          'Select the image to mount its tooltipped controls, then click the text or toggle the editor off. The browser regression tests drive this real Lexical composition.',
      },
    },
  },
};
export default meta;

async function verifyDecoratorUnmount(
  canvasElement: HTMLElement,
  isReadOnly: boolean,
) {
  const canvas = within(canvasElement);
  await userEvent.click(
    await canvas.findByRole('img', {name: 'Selectable landscape'}),
  );
  const control = await canvas.findByRole('button', {name: 'Smaller'});
  const id = control.getAttribute('aria-describedby');
  await waitFor(() => expect(id && document.getElementById(id)).toBeTruthy());
  await userEvent.hover(control);
  await waitFor(() =>
    expect(document.getElementById(id ?? '')?.matches(':popover-open')).toBe(
      true,
    ),
  );
  await userEvent.click(
    isReadOnly
      ? canvas.getByRole('button', {name: 'Toggle editor'})
      : canvas.getByText('Click this text to deselect the image.', {
          exact: true,
        }),
  );
  await waitFor(() => {
    expect(canvas.queryByRole('button', {name: 'Smaller'})).toBeNull();
    expect(document.getElementById(id ?? '')).toBeNull();
  });
}

export const DecoratorSelection: StoryObj = {
  render: () => <TooltipDecoratorFixture />,
};

export const DecoratorReadOnly: StoryObj = {
  render: () => <TooltipDecoratorFixture isReadOnly />,
};

export const DecoratorUnmount: StoryObj = {
  render: () => <TooltipDecoratorFixture />,
  play: ({canvasElement}) => verifyDecoratorUnmount(canvasElement, false),
};

export const DecoratorReadOnlyUnmount: StoryObj = {
  render: () => <TooltipDecoratorFixture isReadOnly />,
  play: ({canvasElement}) => verifyDecoratorUnmount(canvasElement, true),
};
