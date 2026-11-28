/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        normal: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium', 'sans-serif'],
        semibold: ['Inter_500Medium', 'sans-serif'],
        bold: ['Inter_600SemiBold', 'sans-serif'],
        black: ['Inter_700Bold', 'sans-serif'],
      },
      // Inter weights are baked into each discrete @expo-google-fonts TTF; keeping
      // fontWeight at 400 prevents Android Typeface.create() from applying synthetic bold on top.
      fontWeight: {
        normal: '400',
        medium: '400',
        semibold: '400',
        bold: '400',
        black: '400',
      },
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
