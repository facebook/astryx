type GlobalState = {
    /**
     * When set, the viewport is applied and cannot be changed using the toolbar. Must match the key
     * of one of the available viewports.
     */
    value: string | undefined;
    /**
     * When true the viewport applied will be rotated 90°, e.g. it will rotate from portrait to
     * landscape orientation.
     */
    isRotated: boolean;
};

declare const initialGlobals: Record<string, GlobalState> | {
    viewport: string;
    viewportRotated: boolean;
};

export { initialGlobals };
