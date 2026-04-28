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
    question: 'Which environment should this deploy to?',
    options: [
      {key: 'A', label: 'Production (requires approval)'},
      {key: 'B', label: 'Staging'},
      {key: 'C', label: 'Local development only'},
    ],
  },
  {
    question:
      'This will modify 12 files. How should I handle breaking changes?',
    options: [
      {key: 'A', label: 'Add a migration and keep backward compatibility'},
      {
        key: 'B',
        label: 'Breaking change is fine \u2014 bump the major version',
      },
    ],
  },
  {
    question: 'I found 3 existing implementations. Which one should I extend?',
    options: [
      {key: 'A', label: 'UserService in src/services/ (most recent)'},
      {key: 'B', label: 'UserManager in src/legacy/ (has more test coverage)'},
      {key: 'C', label: 'Neither \u2014 start fresh'},
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
      placeholder="Or describe what you need in your own words\u2026"
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
