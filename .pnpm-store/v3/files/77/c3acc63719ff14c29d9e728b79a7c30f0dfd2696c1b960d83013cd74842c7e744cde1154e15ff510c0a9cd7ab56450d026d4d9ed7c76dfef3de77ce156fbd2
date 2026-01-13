import * as core_dist_types from 'storybook/internal/types';

interface Background {
    name: string;
    value: string;
}
interface GridConfig {
    cellAmount: number;
    cellSize: number;
    opacity: number;
    offsetX?: number;
    offsetY?: number;
}
type GlobalState = {
    value: string | undefined;
    grid: boolean;
};
interface BackgroundsParameters {
    /**
     * Backgrounds configuration
     *
     * @see https://storybook.js.org/docs/essentials/backgrounds#parameters
     */
    backgrounds: {
        /** Default background color */
        default?: string;
        /** Remove the addon panel and disable the addon's behavior */
        disable?: boolean;
        /** Configuration for the background grid */
        grid?: Partial<GridConfig>;
        /** Available background colors */
        values?: Array<Background>;
    };
}
interface BackgroundsGlobals {
    /**
     * Backgrounds configuration
     *
     * @see https://storybook.js.org/docs/essentials/backgrounds#globals
     */
    backgrounds: GlobalState;
}

declare const _default: () => core_dist_types.ProjectAnnotations<core_dist_types.Renderer>;

export { BackgroundsGlobals, BackgroundsParameters, _default as default };
