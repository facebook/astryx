// Copyright (c) Meta Platforms, Inc. and affiliates.

const EFFECT_STATE_RULE = '@eslint-react/set-state-in-effect';
const DISABLE_DIRECTIVE =
  /^\s*eslint-disable(?:-next-line|-line)?\s+([\s\S]*?)\s*$/;

function targetsEffectStateRule(comment) {
  const match = DISABLE_DIRECTIVE.exec(comment.value);
  if (match == null) {
    return false;
  }

  const separator = match[1].indexOf('--');
  const ruleList = separator === -1 ? match[1] : match[1].slice(0, separator);
  return ruleList
    .split(',')
    .map(ruleId => ruleId.trim())
    .includes(EFFECT_STATE_RULE);
}

function hasReason(comment) {
  const match = DISABLE_DIRECTIVE.exec(comment.value);
  if (match == null) {
    return false;
  }

  const separator = match[1].indexOf('--');
  return separator !== -1 && match[1].slice(separator + 2).trim().length > 0;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require every set-state-in-effect disable to record why the Effect must own that state transition',
      category: 'Astryx Conventions',
      recommended: true,
    },
    messages: {
      missingReason:
        'Explain why this state transition must happen in an Effect after `--`. The reason should name the external system, measurement, or lifecycle boundary that makes render/event-time derivation insufficient.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        const source = context.sourceCode ?? context.getSourceCode();
        for (const comment of source.getAllComments()) {
          if (targetsEffectStateRule(comment) && !hasReason(comment)) {
            context.report({node: comment, messageId: 'missingReason'});
          }
        }
      },
    };
  },
};

export default rule;
