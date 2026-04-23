'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  LinkIcon,
  StarIcon,
  BookmarkIcon,
  HeartIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  BoldIcon as BoldSolid,
  ItalicIcon as ItalicSolid,
  UnderlineIcon as UnderlineSolid,
  StarIcon as StarSolid,
  BookmarkIcon as BookmarkSolid,
  HeartIcon as HeartSolid,
} from '@heroicons/react/24/solid';

export default function ToggleButtonColor() {
  const [toolbar, setToolbar] = useState<Record<string, boolean>>({
    bold: true,
    italic: false,
    underline: true,
    strikethrough: false,
    link: false,
  });
  const toggleToolbar = (key: string) =>
    setToolbar(prev => ({...prev, [key]: !prev[key]}));

  const [reactions, setReactions] = useState<Record<string, boolean>>({
    star: false,
    heart: false,
    bookmark: true,
    bell: false,
  });
  const toggleReaction = (key: string) =>
    setReactions(prev => ({...prev, [key]: !prev[key]}));

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Toolbar
        </XDSText>
        <XDSStack direction="horizontal" gap={1}>
          <XDSToggleButton
            label="Bold"
            icon={<XDSIcon icon={BoldIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={BoldSolid} color="accent" />}
            isPressed={toolbar.bold}
            onPressedChange={() => toggleToolbar('bold')}
            isIconOnly
          />
          <XDSToggleButton
            label="Italic"
            icon={<XDSIcon icon={ItalicIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={ItalicSolid} color="accent" />}
            isPressed={toolbar.italic}
            onPressedChange={() => toggleToolbar('italic')}
            isIconOnly
          />
          <XDSToggleButton
            label="Underline"
            icon={<XDSIcon icon={UnderlineIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={UnderlineSolid} color="accent" />}
            isPressed={toolbar.underline}
            onPressedChange={() => toggleToolbar('underline')}
            isIconOnly
          />
          <XDSToggleButton
            label="Strikethrough"
            icon={<XDSIcon icon={StrikethroughIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={StrikethroughIcon} color="accent" />}
            isPressed={toolbar.strikethrough}
            onPressedChange={() => toggleToolbar('strikethrough')}
            isIconOnly
          />
          <XDSToggleButton
            label="Link"
            icon={<XDSIcon icon={LinkIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={LinkIcon} color="positive" />}
            isPressed={toolbar.link}
            onPressedChange={() => toggleToolbar('link')}
            isIconOnly
          />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Reactions
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSToggleButton
            label="Star"
            icon={<XDSIcon icon={StarIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={StarSolid} color="yellow" />}
            isPressed={reactions.star}
            onPressedChange={() => toggleReaction('star')}
            isIconOnly
          />
          <XDSToggleButton
            label="Like"
            icon={<XDSIcon icon={HeartIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={HeartSolid} color="red" />}
            isPressed={reactions.heart}
            onPressedChange={() => toggleReaction('heart')}
            isIconOnly
          />
          <XDSToggleButton
            label="Save"
            icon={<XDSIcon icon={BookmarkIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={BookmarkSolid} color="blue" />}
            isPressed={reactions.bookmark}
            onPressedChange={() => toggleReaction('bookmark')}
            isIconOnly
          />
          <XDSToggleButton
            label="Follow"
            icon={<XDSIcon icon={BellIcon} color="secondary" />}
            pressedIcon={<XDSIcon icon={BellIcon} color="accent" />}
            isPressed={reactions.bell}
            onPressedChange={() => toggleReaction('bell')}
            isIconOnly
          />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
