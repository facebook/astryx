// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function MoreMenuInToolbar() {
  return (
    <Card width="100%" height="100%" style={{marginTop: 100}}>
      <Toolbar
        label="Project actions"
        size="sm"
        dividers={['bottom']}
        startContent={
          <Button
            label="Back"
            variant="ghost"
            icon={<Icon icon={ArrowLeftIcon} />}
            isIconOnly
          />
        }
        centerContent={<Heading level={5}>Title</Heading>}
        endContent={
          <>
            <div style={{marginInlineEnd: 8}}>
              <MoreMenu
                label="More actions"
                size="sm"
                items={[
                  {label: 'Export', icon: ArrowDownTrayIcon, onClick: () => {}},
                  {label: 'Share', icon: ShareIcon, onClick: () => {}},
                  {type: 'divider'},
                  {label: 'Delete', icon: TrashIcon, onClick: () => {}},
                ]}
              />
            </div>
            <Button label="Discard" variant="secondary" size="sm" />
            <Button label="Save" variant="primary" size="sm" />
          </>
        }
      />
      <Section />
    </Card>
  );
}
