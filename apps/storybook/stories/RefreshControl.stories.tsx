// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useCallback, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {RefreshControl} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {List, ListItem} from '@astryxdesign/core/List';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';

interface StoryArgs {
  /** How long a refresh takes, in ms. */
  refreshMs: number;
  /** Rows in the list. */
  rows: number;
}

const meta: Meta<StoryArgs> = {
  title: 'Lab/RefreshControl',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    refreshMs: 1500,
    rows: 40,
  },
  argTypes: {
    refreshMs: {control: {type: 'number', min: 0, step: 100}},
    rows: {control: {type: 'number', min: 1, step: 1}},
  },
};

export default meta;

type Story = StoryObj<StoryArgs>;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

function useInbox(refreshMs: number) {
  const [count, setCount] = useState(0);
  const onRefresh = useCallback(async () => {
    await wait(refreshMs);
    setCount(value => value + 1);
  }, [refreshMs]);
  return {count, onRefresh};
}

function Messages({rows, count}: {rows: number; count: number}) {
  return (
    <List header={`Inbox (refreshed ${count} times)`}>
      {Array.from({length: rows}, (_, index) => (
        <ListItem
          key={index}
          label={`Message ${index + 1}`}
          description={
            index === 0 ? `Refresh ${count}` : 'Pull down at the top to refresh'
          }
        />
      ))}
    </List>
  );
}

/**
 * The usual case: a list in a scroll area. Pull the list down past the top on
 * a touch screen; past the trigger the refresh starts with the finger down.
 */
export const InAScrollArea: Story = {
  render: function InAScrollAreaStory({refreshMs, rows}) {
    const {count, onRefresh} = useInbox(refreshMs);
    return (
      <div data-refresh-count={count} style={{height: '100dvh'}}>
        <ScrollableArea label="Inbox" height="100%">
          <RefreshControl onRefresh={onRefresh} title="Pull to refresh">
            <Messages rows={rows} count={count} />
          </RefreshControl>
        </ScrollableArea>
      </div>
    );
  },
};

/**
 * On the page itself: the document scrolls, and the page's own pull to
 * reload is replaced by the refresh while the control is mounted.
 */
export const OnThePage: Story = {
  render: function OnThePageStory({refreshMs, rows}) {
    const {count, onRefresh} = useInbox(refreshMs);
    return (
      <div data-refresh-count={count}>
        <RefreshControl onRefresh={onRefresh}>
          <Messages rows={rows} count={count} />
        </RefreshControl>
      </div>
    );
  },
};

/**
 * Controlled: the button refreshes too (the pull has no keyboard or
 * screen-reader equivalent), and the app sets `isRefreshing` itself.
 */
export const Controlled: Story = {
  render: function ControlledStory({refreshMs, rows}) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [count, setCount] = useState(0);
    const refresh = useCallback(() => {
      setIsRefreshing(true);
      void wait(refreshMs).then(() => {
        setCount(value => value + 1);
        setIsRefreshing(false);
      });
    }, [refreshMs]);
    return (
      <div
        data-refresh-count={count}
        style={{height: '100dvh', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: 8}}>
          <Button label="Refresh" onClick={refresh} isDisabled={isRefreshing} />
        </div>
        <div style={{flex: 1, minHeight: 0}}>
          <ScrollableArea label="Inbox" height="100%">
            <RefreshControl
              onRefresh={refresh}
              isRefreshing={isRefreshing}
              title={`Updated ${count} times`}>
              <Messages rows={rows} count={count} />
            </RefreshControl>
          </ScrollableArea>
        </div>
      </div>
    );
  },
};

/** A list shorter than the screen still pulls. */
export const ShortList: Story = {
  args: {rows: 3},
  render: function ShortListStory({refreshMs, rows}) {
    const {count, onRefresh} = useInbox(refreshMs);
    return (
      <div data-refresh-count={count} style={{height: '100dvh'}}>
        <ScrollableArea label="Inbox" height="100%">
          <RefreshControl onRefresh={onRefresh}>
            <Messages rows={rows} count={count} />
          </RefreshControl>
        </ScrollableArea>
      </div>
    );
  },
};
