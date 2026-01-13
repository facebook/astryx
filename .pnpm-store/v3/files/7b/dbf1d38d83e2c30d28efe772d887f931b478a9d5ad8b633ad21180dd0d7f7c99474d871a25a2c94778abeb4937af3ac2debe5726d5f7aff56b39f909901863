import { PresetProperty, Options } from 'storybook/internal/types';

declare const addons: PresetProperty<'addons'>;
declare const viteFinal: (config: any, options: Options) => Promise<any>;
declare const webpackX: any;
declare const docsX: any;
/**
 * If the user has not installed react explicitly in their project, the resolvedReact preset will
 * not be set. We then set it here in addon-docs to use addon-docs's react version that always
 * exists. This is just a fallback that never overrides the existing preset, but ensures that there
 * is always a resolved react.
 */
declare const resolvedReact: (existing: any) => Promise<{
    react: any;
    reactDom: any;
    mdx: any;
}>;
declare const optimizeViteDeps: string[];

export { addons, docsX as docs, optimizeViteDeps, resolvedReact, viteFinal, webpackX as webpack };
