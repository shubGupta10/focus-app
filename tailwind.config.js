/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceElevated: 'var(--color-surface-elevated)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
        textMuted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
        icon: 'var(--color-icon)',
        accent: 'var(--color-accent)',
        accentForeground: 'var(--color-accent-foreground)',
        accentMuted: 'var(--color-accent-muted)',
        success: 'var(--color-success)',
        successMuted: 'var(--color-success-muted)',
        warning: 'var(--color-warning)',
        warningMuted: 'var(--color-warning-muted)',
        destructive: 'var(--color-destructive)',
        destructiveMuted: 'var(--color-destructive-muted)',
        scrim: 'var(--color-scrim)',
      }
    },
  },
  plugins: [],
}
