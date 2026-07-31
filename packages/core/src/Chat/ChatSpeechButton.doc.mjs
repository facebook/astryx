// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatSpeechButton',
  displayName: 'Chat Speech Button',
  group: 'Chat',
  category: 'Chat',
  isHiddenFromOverview: true,
  hidden: false,

  keywords: ['speech', 'text-to-speech', 'tts', 'speaker', 'voice', 'read aloud', 'speech-synthesis', 'voice-output', 'accessibility'],

  usage: {
    description:
      'ChatSpeechButton is a toggle button that reads a chat message aloud using the browser SpeechSynthesis API. It pairs with useChatSpeech to show a speaker icon when idle and animated sound-wave bars while speaking. Place it in the footer of a ChatMessage (for example inside ChatMessageMetadata) so assistant responses can be played back.',
    bestPractices: [
      {guidance: true, description: 'Place the speech button in the footer of an assistant ChatMessage, for example inside ChatMessageMetadata, so users can replay the response near where they read it.'},
      {guidance: true, description: 'Pass the plain text of the message as the text prop. Strip markdown first so the reader speaks "bold" rather than the asterisks around it.'},
      {guidance: true, description: 'Share a single useChatSpeech instance across messages so starting playback on one message stops the previous one. This keeps only one utterance speaking at a time.'},
      {guidance: false, description: "Don't render a speech button on every message without a way to stop it. The button toggles, so clicking again stops playback, but avoid stacking many independent speech hooks."},
      {guidance: false, description: "Don't forget the unsupported case. The button hides itself by default when the browser lacks SpeechSynthesis, but the message should still be readable without it."},
    ],
    anatomy: [
      {name: 'Speaker icon', required: true, description: 'Shown in the idle state. Indicates that clicking will read the message aloud.'},
      {name: 'Sound-wave bars', required: false, description: 'Animated bars that replace the icon while speaking. Click to stop playback.'},
      {name: 'Ghost button', required: true, description: 'The underlying Button with ghost variant and isIconOnly, providing the hit target and focus ring.'},
    ],
  },

  props: [
    {
      name: 'speech',
      type: 'UseChatSpeechReturn',
      description:
        'The return value from useChatSpeech. Controls button state: speaking, and the speak/stop actions.',
      required: true,
    },
    {
      name: 'text',
      type: 'string',
      description: 'The text read aloud when the button is pressed.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Button size. Matches ChatMessage density.',
      default: "'md'",
    },
    {
      name: 'isHiddenWhenUnsupported',
      type: 'boolean',
      description:
        'When true, renders nothing if the browser does not support SpeechSynthesis.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label override. Defaults to "Read aloud" or "Stop reading" based on state.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],

};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'ChatSpeechButton is a toggle button that reads a chat message aloud using the browser SpeechSynthesis API. It pairs with useChatSpeech to show a speaker icon when idle and animated sound-wave bars while speaking. Place it in the footer of a ChatMessage so assistant responses can be played back.',
    bestPractices: [
      {guidance: true, description: 'Place the speech button in the footer of an assistant ChatMessage, for example inside ChatMessageMetadata.'},
      {guidance: true, description: 'Pass the plain text of the message as the text prop. Strip markdown first.'},
      {guidance: true, description: 'Share a single useChatSpeech instance across messages so only one message speaks at a time.'},
      {guidance: false, description: "Don't stack many independent speech hooks without a way to stop playback."},
      {guidance: false, description: "Don't forget the unsupported case. The button auto-hides but the message should stay readable."},
    ],
  },
  propDescriptions: {
    speech: 'The return value from useChatSpeech. Controls button state.',
    text: 'The text read aloud when pressed.',
    size: 'Button size.',
    isHiddenWhenUnsupported: 'When true, renders nothing if SpeechSynthesis is unsupported.',
    label: 'Accessible label override.',
    xstyle: 'Additional StyleX styles.',
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'speaker toggle btn that reads a chat message aloud (TTS); idle=speaker icon, speaking=sound-wave bars; pairs w/ useChatSpeech',
  usage: {
    description:
      'Toggle button for text-to-speech playback of a chat message. Pairs with useChatSpeech. Shows speaker icon when idle, animated sound-wave bars when speaking. Goes in ChatMessage footer/metadata.',
    bestPractices: [
      {guidance: true, description: 'Place in assistant ChatMessage footer (e.g. ChatMessageMetadata).'},
      {guidance: true, description: 'Pass plain text (strip markdown) as the text prop.'},
      {guidance: true, description: 'Share one useChatSpeech instance so only one message speaks at a time.'},
      {guidance: false, description: "Don't stack many independent speech hooks with no stop path."},
      {guidance: false, description: "Don't forget unsupported case. Button auto-hides but message stays readable."},
    ],
  },
  propDescriptions: {
    speech: 'return from useChatSpeech; controls state',
    text: 'text read aloud on press',
    size: 'btn size',
    isHiddenWhenUnsupported: 'hide when SpeechSynthesis unsupported',
    label: 'a11y label override',
    xstyle: 'extra StyleX styles',
  },
};
