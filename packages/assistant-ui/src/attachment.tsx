// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file attachment.tsx
 * @input Uses assistant-ui attachment state and Astryx Thumbnail/Token
 * @output Exports ready attachment, composer, and message attachment adapters
 * @position Runtime-to-presentation bridge for assistant-ui attachments
 */

import {useEffect, useState, type FC} from 'react';
import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAttachment,
  useAttachmentRuntime,
} from '@assistant-ui/react';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Token} from '@astryxdesign/core/Token';
import {TooltipIconButton} from './tooltip-icon-button';

function useFileURL(file: File | undefined): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (file == null) {
      setUrl(undefined);
      return;
    }
    const nextURL = URL.createObjectURL(file);
    setUrl(nextURL);
    return () => URL.revokeObjectURL(nextURL);
  }, [file]);

  return url;
}

function useAttachmentImageSource(): {
  file: File | undefined;
  source: string | undefined;
} {
  const type = useAttachment(state => state.type);
  const file = useAttachment(state => state.file);
  const content = useAttachment(state => state.content);
  if (type !== 'image') {
    return {file: undefined, source: undefined};
  }
  const imagePart = content?.find(part => part.type === 'image');
  return {
    file,
    source: imagePart?.type === 'image' ? imagePart.image : undefined,
  };
}

export interface AttachmentProps {
  removable?: boolean;
}

export const Attachment: FC<AttachmentProps> = ({removable = false}) => {
  const name = useAttachment(state => state.name);
  const status = useAttachment(state => state.status);
  const runtime = useAttachmentRuntime();
  const {file, source} = useAttachmentImageSource();
  const objectURL = useFileURL(file);
  const imageSource = objectURL ?? source;
  const isLoading = status.type === 'running';

  const content =
    imageSource != null ? (
      <Thumbnail
        alt={name}
        isLoading={isLoading}
        label={name}
        onRemove={removable ? () => void runtime.remove() : undefined}
        showRemoveOn="always"
        src={imageSource}
      />
    ) : (
      <Token
        endContent={
          isLoading ? (
            <Spinner aria-label={`Attaching ${name}`} size="sm" />
          ) : undefined
        }
        icon={<Icon color="secondary" icon="info" size="sm" />}
        isDisabled={isLoading}
        label={name}
        onRemove={removable ? () => void runtime.remove() : undefined}
        size="sm"
      />
    );

  return <AttachmentPrimitive.Root asChild>{content}</AttachmentPrimitive.Root>;
};

Attachment.displayName = 'Attachment';

export const ComposerAttachment: FC = () => <Attachment removable />;

export const MessageAttachment: FC = () => <Attachment />;

export const ComposerAttachments: FC = () => (
  <HStack aria-label="Attachments" gap={1} isScrollable wrap="nowrap">
    <ComposerPrimitive.Attachments
      components={{Attachment: ComposerAttachment}}
    />
  </HStack>
);

export const UserMessageAttachments: FC = () => (
  <HStack aria-label="Message attachments" gap={1} justify="end" wrap="wrap">
    <MessagePrimitive.Attachments
      components={{Attachment: MessageAttachment}}
    />
  </HStack>
);

export const ComposerAddAttachment: FC<{
  isDisabled?: boolean;
  multiple?: boolean;
}> = ({isDisabled, multiple = true}) => (
  <ComposerPrimitive.AddAttachment
    asChild
    disabled={isDisabled}
    multiple={multiple}>
    <TooltipIconButton
      isDisabled={isDisabled}
      size="md"
      tooltip="Add attachment">
      <Icon icon="info" size="sm" />
    </TooltipIconButton>
  </ComposerPrimitive.AddAttachment>
);
