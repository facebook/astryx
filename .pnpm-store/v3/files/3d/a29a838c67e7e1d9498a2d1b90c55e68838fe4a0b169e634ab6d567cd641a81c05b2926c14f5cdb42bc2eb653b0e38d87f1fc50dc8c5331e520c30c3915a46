import { instrument } from '@storybook/instrumenter';
import '@storybook/test';

var runStep=instrument({step:(label,play,context)=>play(context)},{intercept:!0}).step,parameters={throwPlayFunctionExceptions:!1};

export { parameters, runStep };
