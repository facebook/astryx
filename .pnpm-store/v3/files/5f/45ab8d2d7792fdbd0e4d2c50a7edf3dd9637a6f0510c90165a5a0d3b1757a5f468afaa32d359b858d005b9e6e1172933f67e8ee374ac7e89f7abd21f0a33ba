import * as core_dist_types from 'storybook/internal/types';

declare const PARAM_KEY = "actions";
declare const ADDON_ID = "storybook/actions";
declare const PANEL_ID = "storybook/actions/panel";
declare const EVENT_ID = "storybook/actions/action-event";
declare const CLEAR_ID = "storybook/actions/action-clear";
declare const CYCLIC_KEY = "$___storybook.isCyclic";

interface Options$1 {
    allowRegExp: boolean;
    allowFunction: boolean;
    allowSymbol: boolean;
    allowDate: boolean;
    allowUndefined: boolean;
    allowClass: boolean;
    allowError: boolean;
    maxDepth: number;
    space: number | undefined;
    lazyEval: boolean;
}

interface Options {
    depth: number;
    clearOnStoryChange: boolean;
    limit: number;
    implicit: boolean;
    id: string;
}
type ActionOptions = Partial<Options> & Partial<Options$1>;

interface ActionDisplay {
    id: string;
    data: {
        name: string;
        args: any[];
    };
    count: number;
    options: ActionOptions;
}

type HandlerFunction = (...args: any[]) => void;

type ActionsMap<T extends string = string> = Record<T, HandlerFunction>;

interface ActionsFunction {
    <T extends string>(handlerMap: Record<T, string>, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(...handlers: T[]): ActionsMap<T>;
    <T extends string>(handler1: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, handler5: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, handler5: T, handler6: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, handler5: T, handler6: T, handler7: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, handler5: T, handler6: T, handler7: T, handler8: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, handler5: T, handler6: T, handler7: T, handler8: T, handler9: T, options?: ActionOptions): ActionsMap<T>;
    <T extends string>(handler1: T, handler2: T, handler3: T, handler4: T, handler5: T, handler6: T, handler7: T, handler8: T, handler9: T, handler10: T, options?: ActionOptions): ActionsMap<T>;
}

type DecoratorFunction = (args: any[]) => any[];

declare function action(name: string, options?: ActionOptions): HandlerFunction;

declare const actions: ActionsFunction;

declare const config: ActionOptions;
declare const configureActions: (options?: ActionOptions) => void;

interface ActionsParameters {
    /**
     * Actions configuration
     *
     * @see https://storybook.js.org/docs/essentials/actions#parameters
     */
    actions: {
        /**
         * Create actions for each arg that matches the regex. (**NOT recommended, see below**)
         *
         * This is quite useful when your component has dozens (or hundreds) of methods and you do not
         * want to manually apply the fn utility for each of those methods. However, this is not the
         * recommended way of writing actions. That's because automatically inferred args are not
         * available as spies in your play function. If you use argTypesRegex and your stories have play
         * functions, you will need to also define args with the fn utility to test them in your play
         * function.
         *
         * @example `argTypesRegex: '^on.*'`
         */
        argTypesRegex?: string;
        /** Remove the addon panel and disable the addon's behavior */
        disable?: boolean;
        /**
         * Binds a standard HTML event handler to the outermost HTML element rendered by your component
         * and triggers an action when the event is called for a given selector. The format is
         * `<eventname> <selector>`. The selector is optional; it defaults to all elements.
         *
         * **To enable this feature, you must use the `withActions` decorator.**
         *
         * @example `handles: ['mouseover', 'click .btn']`
         *
         * @see https://storybook.js.org/docs/essentials/actions#action-event-handlers
         */
        handles?: string[];
    };
}

declare const _default: () => core_dist_types.ProjectAnnotations<core_dist_types.Renderer>;

export { ADDON_ID, ActionDisplay, ActionOptions, ActionsFunction, ActionsMap, ActionsParameters, CLEAR_ID, CYCLIC_KEY, DecoratorFunction, EVENT_ID, HandlerFunction, PANEL_ID, PARAM_KEY, action, actions, config, configureActions, _default as default };
