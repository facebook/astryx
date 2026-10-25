// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonShell.test.tsx
 * @input Uses react-dom/server, react-dom/static, the server shells
 *   (ButtonShell.tsx, IconButtonShell.tsx) and the client Button/IconButton
 * @output Markup-parity tests: the server shell renders exactly what the client
 *   component renders, standalone and inside every provider Button reads
 * @position Testing; validates ButtonShell.tsx and ButtonContextGate.tsx.
 *   serverRender.test.ts proves the same shells run under the react-server
 *   React build and which client parts they reference.
 *
 * SYNC: When ButtonShell.tsx or ButtonContextGate.tsx changes, update the
 * prop matrix here.
 */

import {describe, it, expect, vi} from 'vitest';
import type {ReactElement, ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {prerender} from 'react-dom/static';
import {Button as ClientButton, type ButtonProps} from './Button';
import {Button as ServerButton, needsClientButton} from './ButtonShell';
import {IconButton as ClientIconButton} from '../IconButton/IconButton';
import {IconButton as ServerIconButton} from '../IconButton/IconButtonShell';
import {ButtonGroup} from '../ButtonGroup/ButtonGroup';
import {InputGroup} from '../InputGroup/InputGroup';
import {SizeProvider} from '../SizeContext/SizeContext';
import {LinkProvider} from '../Link/LinkProvider';
import {Badge} from '../Badge/Badge';
import {Icon} from '../Icon/Icon';

const svg = <svg data-testid="glyph" viewBox="0 0 16 16" />;

/** Data-only props: the shell renders these on the server. */
const PRESENTATIONAL: [string, ButtonProps][] = [
  ['defaults', {label: 'Save'}],
  ['primary', {label: 'Save', variant: 'primary'}],
  ['ghost (edge-compensation marker)', {label: 'More', variant: 'ghost'}],
  ['destructive lg', {label: 'Delete', variant: 'destructive', size: 'lg'}],
  ['sm', {label: 'Small', size: 'sm'}],
  ['icon and label', {label: 'Edit', icon: svg}],
  [
    'Astryx Icon in the slot (default size)',
    {label: 'Edit', icon: <Icon icon="check" />},
  ],
  ['icon-only', {label: 'Settings', icon: svg, isIconOnly: true}],
  ['end content', {label: 'Inbox', endContent: <Badge label={3} />}],
  ['children differ from label', {label: 'Save draft', children: 'Save'}],
  ['children equal label', {label: 'Save', children: 'Save'}],
  ['numeric width', {label: 'Wide', width: 160}],
  ['string width', {label: 'Full', width: '100%'}],
  ['elevation', {label: 'Float', elevation: 'med'}],
  ['disabled', {label: 'Off', isDisabled: true}],
  ['interruptible, idle', {label: 'Toggle', isInterruptible: true}],
  ['explicitly not loading', {label: 'Save', isLoading: false}],
  [
    'form attributes',
    {label: 'Send', type: 'submit', name: 'intent', value: 'send', form: 'f'},
  ],
  ['link', {label: 'Docs', href: '/docs'}],
  [
    'link with target and rel',
    {
      label: 'Site',
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener',
    },
  ],
  ['link, explicit native anchor', {label: 'Docs', href: '/docs', as: 'a'}],
  [
    'disabled link renders a button',
    {label: 'Docs', href: '/docs', isDisabled: true},
  ],
  ['rejected destination', {label: 'Bad', href: 'javascript:alert(1)'}],
  [
    'caller DOM props',
    {
      label: 'Save',
      className: 'mine',
      style: {marginTop: 4},
      id: 'save',
      'data-testid': 'save',
      'aria-describedby': 'hint',
      'aria-busy': true,
      'aria-disabled': true,
    },
  ],
];

/** Props that need the client Button, and why. */
const INTERACTIVE: [string, ButtonProps][] = [
  ['clickAction', {label: 'Save', clickAction: async () => {}}],
  ['isLoading', {label: 'Save', isLoading: true}],
  ['tooltip', {label: 'Save', tooltip: 'Saves the draft'}],
  ['ref', {label: 'Save', ref: {current: null}}],
  ['onClick', {label: 'Save', onClick: () => {}}],
  ['any event handler', {label: 'Save', onKeyDown: () => {}}],
  ['component as', {label: 'Docs', href: '/docs', as: () => null}],
];

/**
 * Static markup once every lazy client part has loaded, with React's Suspense
 * boundary comments removed. The first pass loads the parts; the second
 * renders with them in place, so no boundary is left pending or outlined.
 */
async function markup(element: ReactElement): Promise<string> {
  await new Response((await prerender(element)).prelude).text();
  const html = await new Response((await prerender(element)).prelude).text();
  return html.replace(/<!--\/?\$[!?]?-->/g, '');
}

function Wrapped({
  wrap,
  children,
}: {
  wrap: (node: ReactNode) => ReactNode;
  children: ReactNode;
}) {
  return <>{wrap(children)}</>;
}

describe('Button server shell', () => {
  it.each(PRESENTATIONAL)('renders %s on the server', (_name, props) => {
    expect(needsClientButton(props)).toBe(false);
    expect(renderToStaticMarkup(<ServerButton {...props} />)).toBe(
      renderToStaticMarkup(<ClientButton {...props} />),
    );
  });

  it('keeps unset interactive props off the DOM element', () => {
    // `clickAction={canSave ? save : undefined}` renders on the server; the
    // unset prop must not reach the <button> as an unknown attribute.
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const props: ButtonProps = {
      label: 'Save',
      clickAction: undefined,
      tooltip: undefined,
    };
    expect(needsClientButton(props)).toBe(false);
    expect(renderToStaticMarkup(<ServerButton {...props} />)).toBe(
      renderToStaticMarkup(<ClientButton {...props} />),
    );
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  // The shell hands these to the client Button unchanged, so equal markup is
  // expected by construction; what matters is that each is routed there.
  it.each(INTERACTIVE)('renders the client Button for %s', (_name, props) => {
    expect(needsClientButton(props)).toBe(true);
    const server = <ServerButton {...props} />;
    expect(renderToStaticMarkup(server)).toBe(
      renderToStaticMarkup(<ClientButton {...props} />),
    );
  });

  it('renders IconButton like the client IconButton', () => {
    for (const props of [
      {label: 'Settings', icon: svg},
      {
        label: 'Delete',
        icon: svg,
        variant: 'destructive' as const,
        size: 'sm' as const,
      },
      {label: 'Open', icon: svg, href: '/x'},
    ]) {
      expect(renderToStaticMarkup(<ServerIconButton {...props} />)).toBe(
        renderToStaticMarkup(<ClientIconButton {...props} />),
      );
    }
  });

  // A Server Component cannot read context; ButtonContextGate does, and the
  // client Button takes over wherever a provider changes the output.
  const PROVIDERS: [string, (node: ReactNode) => ReactNode][] = [
    [
      'a horizontal ButtonGroup',
      node => <ButtonGroup label="Actions">{node}</ButtonGroup>,
    ],
    [
      'a disabled vertical ButtonGroup',
      node => (
        <ButtonGroup label="Actions" orientation="vertical" isDisabled>
          {node}
        </ButtonGroup>
      ),
    ],
    ['a size provider', node => <SizeProvider value="sm">{node}</SizeProvider>],
    [
      'a null size provider',
      node => <SizeProvider value={null}>{node}</SizeProvider>,
    ],
    ['an InputGroup', node => <InputGroup label="Search">{node}</InputGroup>],
    [
      'a LinkProvider',
      node => (
        <LinkProvider
          component={({to: _to, ...rest}: {to?: unknown}) => (
            <a data-router="" {...rest} />
          )}>
          {node}
        </LinkProvider>
      ),
    ],
  ];

  const MEMBERS: ButtonProps[] = [
    {label: 'One'},
    {label: 'Two', variant: 'primary'},
    {label: 'Three', size: 'lg'},
    {label: 'Docs', href: '/docs'},
    {label: 'Docs', href: '/docs', as: 'a'},
  ];

  it.each(PROVIDERS)(
    'renders like the client Button inside %s',
    async (_name, wrap) => {
      // One member per render: past a size threshold React outlines a
      // Suspense boundary's content behind a script, which would compare
      // serialization instead of markup.
      for (const props of MEMBERS) {
        expect(
          await markup(
            <Wrapped wrap={wrap}>{<ServerButton {...props} />}</Wrapped>,
          ),
        ).toBe(
          await markup(
            <Wrapped wrap={wrap}>{<ClientButton {...props} />}</Wrapped>,
          ),
        );
      }
    },
  );

  it('renders a two-member ButtonGroup like the client one', async () => {
    const group = (members: ReactNode) => (
      <ButtonGroup label="Actions">{members}</ButtonGroup>
    );
    expect(
      await markup(
        group([
          <ServerButton key="a" label="A" />,
          <ServerButton key="b" label="B" />,
        ]),
      ),
    ).toBe(
      await markup(
        group([
          <ClientButton key="a" label="A" />,
          <ClientButton key="b" label="B" />,
        ]),
      ),
    );
  });

  it('keeps an explicit size inside a size provider without the client Button', async () => {
    // INV3 of the size cascade: explicit wins, so no hand-over is needed and
    // the server markup stands.
    expect(
      await markup(
        <SizeProvider value="sm">
          <ServerButton label="Big" size="lg" />
        </SizeProvider>,
      ),
    ).toBe(renderToStaticMarkup(<ClientButton label="Big" size="lg" />));
  });
});
