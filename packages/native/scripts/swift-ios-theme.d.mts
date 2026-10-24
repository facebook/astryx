// Copyright (c) Meta Platforms, Inc. and affiliates.

export declare const SWIFT_IOS_THEME_FILE: string;
export declare function toHexColor(value: string): string | null;
export declare function toPoints(value: string): number | null;
export declare function toFontFamilies(value: string): string[];
export declare function renderSwiftIOSTheme(): Promise<string>;
