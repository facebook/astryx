// Copyright (c) Meta Platforms, Inc. and affiliates.
import {useState} from 'react';
import {render, screen, cleanup} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {Table} from './Table';

const columns = [{key: 'id', header: 'ID'}];
afterEach(cleanup);

describe('Table opt-in plugin protocol', () => {
  it('passes one type-preserving canonical identity to row transforms', () => {
    const contexts: unknown[] = [];
    const plugin = {
      rowModel: 'flat' as const,
      wholeRowOwner: 'activation' as const,
      transformBodyRow(props: any, _item: any, _index: number, context: any) {
        contexts.push(context);
        return props;
      },
    };
    render(<Table data={[{id: 0}, {id: '0'}]} columns={columns} idKey={item => item.id} plugins={{activation: plugin}} />);
    expect(contexts).toMatchObject([
      {key: 0, identityStatus: 'valid', kind: 'product', logicalIndex: 0},
      {key: '0', identityStatus: 'valid', kind: 'product', logicalIndex: 1},
    ]);
  });

  it('marks both canonical duplicates invalid without hiding ordinary rows', () => {
    const contexts: any[] = [];
    const plugin = {
      rowModel: 'flat' as const, wholeRowOwner: 'activation' as const,
      transformBodyRow(props: any, _item: any, _index: number, context: any) {contexts.push(context); return props;},
    };
    render(<Table data={[{id: 42}, {id: '42'}]} columns={columns} idKey="id" plugins={{activation: plugin}} />);
    expect(contexts.map(context => context?.identityStatus)).toEqual(['duplicate', 'duplicate']);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('rejects competing whole-row owners in either record order', () => {
    for (const reversed of [false, true]) {
      let allowed: boolean | undefined;
      const a = {rowModel: 'flat' as const, wholeRowOwner: 'activation' as const,
        transformBodyRow(props: any, _item: any, _index: number, context: any) {allowed = context?.render.canActivate;return props;}};
      const b = {rowModel: 'flat' as const, wholeRowOwner: 'expansion' as const};
      render(<Table data={[{id: 'a'}]} columns={columns} idKey="id" plugins={reversed ? {b, a} : {a, b}} />);
      expect(allowed).toBe(false);
      cleanup();
    }
  });

  it('derives children mode for wrapper contributions', () => {
    let mode: string | undefined;
    render(<Table plugins={{load: {rowModel: 'flat', transformScrollWrapper(props: any, context: any) {mode=context?.mode;return props;}}}}><tbody><tr><td>Custom</td></tr></tbody></Table>);
    expect(mode).toBe('children');
  });

  it('reacts to a stable loading source before rendering the default empty state', () => {
    let notify: (() => void) | undefined;
    let snapshot = {isLoading: true};
    const source = {subscribe(fn: () => void) {notify=fn;return () => {notify=undefined;};},getSnapshot: () => snapshot,getServerSnapshot: () => snapshot};
    function Host() {
      const [, bump] = useState(0);
      return <><button onClick={() => {snapshot={isLoading:false};notify?.();bump(n=>n+1);}}>Settle</button><Table data={[]} columns={columns} plugins={{load: {rowModel:'flat', renderState: source}}} /></>;
    }
    const {rerender} = render(<Host />);
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
    snapshot={isLoading:false};
    rerender(<Host />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
