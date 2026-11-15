// Material You dynamic color: one seed color -> full M3 light/dark schemes,
// using Google's official HCT-based color library (same math as Android).
import {
  argbFromHex, hexFromArgb, Hct, MaterialDynamicColors,
  SchemeTonalSpot, SchemeVibrant, SchemeExpressive, SchemeFidelity, SchemeContent,
  SchemeNeutral, SchemeMonochrome, SchemeRainbow, SchemeFruitSalad,
} from '@material/material-color-utilities';

const VARIANTS = {
  tonalSpot: SchemeTonalSpot, // Pixel default
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  fidelity: SchemeFidelity,
  content: SchemeContent,
  neutral: SchemeNeutral,
  monochrome: SchemeMonochrome,
  rainbow: SchemeRainbow,
  fruitSalad: SchemeFruitSalad,
};

const ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'surface', 'surfaceDim', 'surfaceBright', 'onSurface', 'onSurfaceVariant',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
  'surfaceContainerHigh', 'surfaceContainerHighest',
  'outline', 'outlineVariant', 'inverseSurface', 'inverseOnSurface', 'inversePrimary',
  'primaryFixed', 'primaryFixedDim', 'onPrimaryFixed',
  'secondaryFixed', 'secondaryFixedDim', 'tertiaryFixed', 'tertiaryFixedDim',
];

export function makeTheme({ seed = '#6750A4', variant = 'tonalSpot', contrast = 0 } = {}, isDark) {
  const Scheme = VARIANTS[variant];
  if (!Scheme) throw new Error(`Unknown theme.variant "${variant}". Use one of: ${Object.keys(VARIANTS).join(', ')}`);
  const scheme = new Scheme(Hct.fromInt(argbFromHex(seed)), isDark, contrast);
  const t = { dark: isDark };
  for (const role of ROLES) t[role] = hexFromArgb(MaterialDynamicColors[role].getArgb(scheme));
  return t;
}
