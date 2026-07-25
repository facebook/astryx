// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as ButtonDocs} from '../Button/Button.doc.mjs';
import {docs as ContextMenuDocs} from '../ContextMenu/ContextMenu.doc.mjs';
import {docs as DialogDocs} from '../Dialog/Dialog.doc.mjs';
import {docs as LinkDocs} from '../Link/Link.doc.mjs';
import {docs as MoreMenuDocs} from '../MoreMenu/MoreMenu.doc.mjs';
import {docs as NumberInputDocs} from '../NumberInput/NumberInput.doc.mjs';
import {docs as PowerSearchDocs} from '../PowerSearch/PowerSearch.doc.mjs';
import {docs as SelectorDocs} from '../Selector/Selector.doc.mjs';
import {docs as TextInputDocs} from '../TextInput/TextInput.doc.mjs';
import {docs as ToastDocs} from '../Toast/Toast.doc.mjs';
import {docs as TokenizerDocs} from '../Tokenizer/Tokenizer.doc.mjs';

function getProps(docs: Record<string, unknown>): {name: string}[] {
  return (
    (docs.props as {name: string}[]) ||
    (
      docs.components as {
        props: {name: string}[];
      }[]
    )?.[0]?.props ||
    []
  );
}

describe('API Contract Drift Audit (#4163)', () => {
  it('documents Button link mode props', () => {
    const props = getProps(ButtonDocs).map(p => p.name);
    expect(props).toContain('href');
    expect(props).toContain('as');
    expect(props).toContain('target');
    expect(props).toContain('rel');
  });

  it('documents Toast onDismiss callback', () => {
    const props = getProps(ToastDocs).map(p => p.name);
    expect(props).toContain('onDismiss');
  });

  it('documents ContextMenu and MoreMenu onOpenChange callback', () => {
    const contextProps = getProps(ContextMenuDocs).map(p => p.name);
    const moreProps = getProps(MoreMenuDocs).map(p => p.name);
    expect(contextProps).toContain('onOpenChange');
    expect(moreProps).toContain('onOpenChange');
  });

  it('documents Selector startIcon and isLoading props', () => {
    const props = getProps(SelectorDocs).map(p => p.name);
    expect(props).toContain('startIcon');
    expect(props).toContain('isLoading');
  });

  it('documents TextInput and NumberInput onEnter / onKeyDown callbacks', () => {
    const textProps = getProps(TextInputDocs).map(p => p.name);
    const numProps = getProps(NumberInputDocs).map(p => p.name);
    expect(textProps).toContain('onEnter');
    expect(textProps).toContain('onKeyDown');
    expect(numProps).toContain('onEnter');
    expect(numProps).toContain('onKeyDown');
  });

  it('documents PowerSearch and Tokenizer onFocus / onBlur callbacks', () => {
    const powerProps = getProps(PowerSearchDocs).map(p => p.name);
    const tokProps = getProps(TokenizerDocs).map(p => p.name);
    expect(powerProps).toContain('onFocus');
    expect(powerProps).toContain('onBlur');
    expect(tokProps).toContain('onFocus');
    expect(tokProps).toContain('onBlur');
  });

  it('documents Link download / referrerPolicy and Dialog padding props', () => {
    const linkProps = getProps(LinkDocs).map(p => p.name);
    const dialogProps = getProps(DialogDocs).map(p => p.name);
    expect(linkProps).toContain('download');
    expect(linkProps).toContain('referrerPolicy');
    expect(dialogProps).toContain('padding');
  });
});
