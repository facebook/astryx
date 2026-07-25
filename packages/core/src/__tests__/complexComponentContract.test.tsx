// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as DropdownMenuDocs} from '../DropdownMenu/DropdownMenu.doc.mjs';
import {docs as HoverCardDocs} from '../HoverCard/HoverCard.doc.mjs';
import {docs as LayoutDocs} from '../Layout/Layout.doc.mjs';
import {docs as LightboxDocs} from '../Lightbox/Lightbox.doc.mjs';
import {docs as LinkDocs} from '../Link/Link.doc.mjs';
import {docs as MultiSelectorDocs} from '../MultiSelector/MultiSelector.doc.mjs';
import {docs as PowerSearchDocs} from '../PowerSearch/PowerSearch.doc.mjs';
import {docs as TokenizerDocs} from '../Tokenizer/Tokenizer.doc.mjs';
import {docs as TooltipDocs} from '../Tooltip/Tooltip.doc.mjs';
import {docs as TypeaheadDocs} from '../Typeahead/Typeahead.doc.mjs';

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

describe('Complex Component API Contract Drift (#4163)', () => {
  it('documents search and tokenizer props across input components', () => {
    const multiProps = getProps(MultiSelectorDocs).map(p => p.name);
    const tokProps = getProps(TokenizerDocs).map(p => p.name);
    const powerProps = getProps(PowerSearchDocs).map(p => p.name);
    const typeProps = getProps(TypeaheadDocs).map(p => p.name);

    expect(multiProps).toContain('startIcon');
    expect(multiProps).toContain('hasClear');
    expect(multiProps).toContain('isDefaultOpen');

    expect(tokProps).toContain('startIcon');
    expect(tokProps).toContain('tokenOverflowBehavior');

    expect(powerProps).toContain('startIcon');
    expect(powerProps).toContain('menuWidth');
    expect(powerProps).toContain('maxOperatorMenuItems');
    expect(powerProps).toContain('tokenOverflowBehavior');

    expect(typeProps).toContain('startIcon');
  });

  it('documents Layout and DropdownMenu layout props', () => {
    const layoutProps = getProps(LayoutDocs).map(p => p.name);
    const dropProps = getProps(DropdownMenuDocs).map(p => p.name);

    expect(layoutProps).toContain('contentWidth');
    expect(layoutProps).toContain('padding');
    expect(layoutProps).toContain('defaultHasDividers');

    expect(dropProps).toContain('placement');
  });

  it('documents HoverCard and Tooltip open state props', () => {
    const hoverProps = getProps(HoverCardDocs).map(p => p.name);
    const toolProps = getProps(TooltipDocs).map(p => p.name);

    expect(hoverProps).toContain('isOpen');
    expect(toolProps).toContain('isOpen');
  });

  it('documents Link typography and Lightbox gallery props', () => {
    const linkProps = getProps(LinkDocs).map(p => p.name);
    const lightProps = getProps(LightboxDocs).map(p => p.name);

    expect(linkProps).toContain('size');
    expect(linkProps).toContain('weight');
    expect(linkProps).toContain('color');
    expect(linkProps).toContain('display');
    expect(linkProps).toContain('maxLines');

    expect(lightProps).toContain('defaultIndex');
    expect(lightProps).toContain('hasAutoPlay');
  });
});
