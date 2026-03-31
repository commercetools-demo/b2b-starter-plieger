export interface ThemeTokens {
  colorPrimary: string;
  colorPrimaryLight: string;
  colorPrimaryHover: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextMuted: string;
  colorBorder: string;
  colorDestructive: string;
  borderRadius: string;
  fontFamily: string;
}

export const defaultTokens: ThemeTokens = {
  colorPrimary: '#0037ff',
  colorPrimaryLight: '#f0f4ff',
  colorPrimaryHover: '#b91c1c',
  colorBackground: '#000000',
  colorSurface: '#fff',
  colorText: '#1c1c1c',
  colorTextMuted: '#606060',
  colorBorder: '#e2e8f0',
  colorDestructive: '#dc2626',
  borderRadius: '0.5rem',
  fontFamily: 'Inter, sans-serif',
};

export function tokensToCSSVars(tokens: ThemeTokens): string {
  return [
    `--color-primary: ${tokens.colorPrimary}`,
    `--color-primary-hover: ${tokens.colorPrimaryHover}`,
    `--color-primary-light: ${tokens.colorPrimaryLight}`,
    `--color-background: ${tokens.colorBackground}`,
    `--color-surface: ${tokens.colorSurface}`,
    `--color-text: ${tokens.colorText}`,
    `--color-text-muted: ${tokens.colorTextMuted}`,
    `--color-border: ${tokens.colorBorder}`,
    `--color-destructive: ${tokens.colorDestructive}`,
    `--border-radius: ${tokens.borderRadius}`,
    `--font-family: ${tokens.fontFamily}`,
  ].join('; ');
}
