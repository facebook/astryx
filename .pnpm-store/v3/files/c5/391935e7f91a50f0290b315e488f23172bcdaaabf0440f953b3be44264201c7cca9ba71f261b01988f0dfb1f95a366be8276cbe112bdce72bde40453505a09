import * as core_dist_csf from 'storybook/internal/csf';

interface Background {
    name: string;
    value: string;
}
type GlobalState = {
    value: string | undefined;
    grid: boolean;
};

declare const decorators: core_dist_csf.DecoratorFunction[];
declare const parameters: {
    backgrounds: {
        values?: Background[] | undefined;
        grid: {
            cellSize: number;
            opacity: number;
            cellAmount: number;
        };
        disable: false;
    };
};
declare const initialGlobals: Record<string, GlobalState> | {
    backgrounds: null;
};

export { decorators, initialGlobals, parameters };
