'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {XDSIconButton} from '@xds/core/IconButton';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  LinkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export default function CenterHorizontal() {
  return (
    <XDSCard width={480} padding={2}>
      <XDSStack direction="horizontal" vAlign="center">
        <XDSStack direction="horizontal" gap={0}>
          <XDSIconButton
            label="Bold"
            icon={<XDSIcon icon={BoldIcon} />}
            variant="ghost"
            size="sm"
          />
          <XDSIconButton
            label="Italic"
            icon={<XDSIcon icon={ItalicIcon} />}
            variant="ghost"
            size="sm"
          />
          <XDSIconButton
            label="Underline"
            icon={<XDSIcon icon={UnderlineIcon} />}
            variant="ghost"
            size="sm"
          />
          <XDSIconButton
            label="List"
            icon={<XDSIcon icon={ListBulletIcon} />}
            variant="ghost"
            size="sm"
          />
          <XDSIconButton
            label="Link"
            icon={<XDSIcon icon={LinkIcon} />}
            variant="ghost"
            size="sm"
          />
          <XDSIconButton
            label="Image"
            icon={<XDSIcon icon={PhotoIcon} />}
            variant="ghost"
            size="sm"
          />
        </XDSStack>
        <XDSCenter axis="horizontal">
          <XDSText type="supporting" color="secondary">
            Draft — Untitled Document
          </XDSText>
        </XDSCenter>
      </XDSStack>
    </XDSCard>
  );
}
