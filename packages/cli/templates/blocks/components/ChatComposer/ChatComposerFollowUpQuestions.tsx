'use client';

import {useState} from 'react';
import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSButton} from '@xds/core/Button';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';

const ChevronLeftIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ChevronRightIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const questions = [
  {
    question: 'What would you like to work on?',
    options: [
      {key: 'A', label: 'Build out the new inbox page template'},
      {key: 'B', label: 'Fix existing templates for rubric compliance'},
      {key: 'C', label: 'Work on the Button component'},
      {key: 'D', label: 'Explore or understand the codebase'},
    ],
  },
  {
    question: 'How familiar are you with the codebase?',
    options: [
      {key: 'A', label: 'Brand new \u2014 never seen it'},
      {key: 'B', label: 'Somewhat familiar \u2014 browsed a few files'},
    ],
  },
  {
    question: 'Do you want a guided walkthrough or just the answer?',
    options: [
      {key: 'A', label: 'Guided walkthrough with explanations'},
      {key: 'B', label: 'Just give me the answer'},
    ],
  },
];

export default function ChatComposerFollowUpQuestions() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const q = questions[currentQ];
  const selected = answers[currentQ] ?? null;

  return (
    <XDSChatComposer
      onSubmit={value => {
        console.log('Submit:', value, '| Answers:', answers);
      }}
      placeholder="Add context or just pick an option above\u2026"
      drawer={
        <XDSChatComposerDrawer count={questions.length} label="Questions">
          <div style={{width: '100%'}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBlockEnd: 4,
              }}>
              <XDSButton
                label="Previous question"
                variant="ghost"
                size="sm"
                icon={ChevronLeftIcon}
                isIconOnly
                isDisabled={currentQ === 0}
                onClick={() => setCurrentQ(i => i - 1)}
              />
              <XDSText color="secondary">
                {currentQ + 1} of {questions.length}
              </XDSText>
              <XDSButton
                label="Next question"
                variant="ghost"
                size="sm"
                icon={ChevronRightIcon}
                isIconOnly
                isDisabled={currentQ === questions.length - 1}
                onClick={() => setCurrentQ(i => i + 1)}
              />
            </div>
            <XDSList>
              <XDSListItem
                label={
                  <XDSText weight="bold">
                    {currentQ + 1}. {q.question}
                  </XDSText>
                }
              />
              {q.options.map(opt => (
                <XDSListItem
                  key={opt.key}
                  label={opt.label}
                  startContent={
                    <XDSBadge
                      variant={selected === opt.key ? 'info' : 'neutral'}
                      label={opt.key}
                    />
                  }
                  isSelected={selected === opt.key}
                  onClick={() =>
                    setAnswers(prev => ({...prev, [currentQ]: opt.key}))
                  }
                />
              ))}
            </XDSList>
          </div>
        </XDSChatComposerDrawer>
      }
      footerActions={<XDSButton label="Skip all" variant="ghost" size="md" />}
    />
  );
}
