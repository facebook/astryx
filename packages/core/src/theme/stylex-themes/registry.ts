/**
 * StyleX Theme Registry (Prototype)
 *
 * Global registry for compiled StyleX-compatible theme objects.
 * Resolution: all theme classes on element, @scope picks active,
 * stylex.props last-arg-wins strips on override.
 */

export type StyleXCSSObject = {
  $$css: true;
  [property: string]: string | true;
};

export type ThemeComponentStyles = Record<string, StyleXCSSObject>;

const registry = new Map<string, Map<string, ThemeComponentStyles>>();

export function registerTheme(
  themeName: string,
  components: Record<string, ThemeComponentStyles>,
): void {
  const themeMap = new Map<string, ThemeComponentStyles>();
  for (const [component, styles] of Object.entries(components)) {
    themeMap.set(component, styles);
  }
  registry.set(themeName, themeMap);
}

export function getThemeStyles(component: string): ThemeComponentStyles | null {
  const merged: Record<string, Record<string, string>> = {};

  for (const [, themeMap] of registry) {
    const componentStyles = themeMap.get(component);
    if (!componentStyles) continue;
    for (const [part, cssObj] of Object.entries(componentStyles)) {
      if (!merged[part]) merged[part] = {};
      for (const [prop, value] of Object.entries(cssObj)) {
        if (prop === '$$css') continue;
        if (typeof value !== 'string') continue;
        merged[part][prop] = merged[part][prop]
          ? `${merged[part][prop]} ${value}`
          : value;
      }
    }
  }

  if (Object.keys(merged).length === 0) return null;

  const result: ThemeComponentStyles = {};
  for (const [part, props] of Object.entries(merged)) {
    result[part] = {$$css: true, ...props} as StyleXCSSObject;
  }
  return result;
}

export function clearThemeRegistry(): void {
  registry.clear();
}
