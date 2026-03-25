export interface ThemeTokens {
  colorPrimary: string;
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
  colorPrimary: '#dc2626',
  colorPrimaryHover: '#b91c1c',
  colorBackground: '#f8fafc',
  colorSurface: '#ffffff',
  colorText: '#111827',
  colorTextMuted: '#6b7280',
  colorBorder: '#e2e8f0',
  colorDestructive: '#dc2626',
  borderRadius: '0.5rem',
  fontFamily: 'Inter, sans-serif',
};

export function tokensToCSSVars(tokens: ThemeTokens): string {
  return [
    `--color-primary: ${tokens.colorPrimary}`,
    `--color-primary-hover: ${tokens.colorPrimaryHover}`,
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
