'use client';

import React, {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {createStaticSource} from '@xds/core/Typeahead';
import {PUBLISH_TAGS} from './constants';

// ---------------------------------------------------------------------------
// InlinePublishPanel — publish flow rendered inline in the left panel
// ---------------------------------------------------------------------------

export function InlinePublishPanel({
  templateName,
  isVisible: _isVisible,
  onBack,
  onPublish,
}: {
  templateName: string;
  isVisible: boolean;
  onBack: () => void;
  onPublish?: () => void;
}) {
  const [name, setName] = useState(templateName);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([] as {id: string; label: string}[]);
  const tagSource = createStaticSource(
    PUBLISH_TAGS.map(t => ({id: t, label: t})),
  );

  return (
    <>
      <style>
        {
          '@keyframes publishFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }'
        }
      </style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 20,
          overflowY: 'auto' as const,
          flex: 1,
          margin: 16,
          animation: 'publishFadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
        {/* Header */}
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 8}}>
          <XDSHeading level={2}>Publish to community</XDSHeading>
          <XDSText type="body" color="secondary">
            Share your work so others on the team can use it as a starting
            point.
          </XDSText>
        </div>

        {/* Template name input */}
        <XDSTextInput
          label="Template name"
          value={name}
          onChange={v => setName(v)}
          size="lg"
        />

        {/* Description textarea */}
        <XDSTextArea
          label="Description"
          placeholder="Describe what makes this template unique..."
          value={description}
          onChange={v => setDescription(v)}
          rows={3}
        />

        {/* Tags */}
        <XDSTokenizer
          label="Tags"
          searchSource={tagSource}
          value={tags}
          onChange={items => setTags(items)}
          placeholder="Add tags..."
          hasEntriesOnFocus
          hasCreate
          size="md"
        />

        {/* Publish / Cancel buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
            marginTop: 'auto',
          }}>
          <XDSText
            type="supporting"
            color="secondary"
            style={{textAlign: 'center' as const}}>
            Your template will go through a review process before appearing in
            the community grid.{' '}
            <XDSLink
              label="Learn more"
              href="#"
              onClick={e => e.preventDefault()}>
              Learn more
            </XDSLink>
          </XDSText>
          <XDSButton
            variant="primary"
            label="Submit template"
            size="lg"
            onClick={onPublish}
            style={{width: '100%'}}
          />
          <XDSButton
            variant="secondary"
            label="Go back to editing"
            size="lg"
            onClick={onBack}
            style={{width: '100%'}}
          />
        </div>
      </div>
    </>
  );
}
