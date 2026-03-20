export const Theme = {
  colors: {
    background: '#FAFAFA', // Soft off-white
    surface: '#FFFFFF',
    primary: '#4A55A2', // Soft aesthetic blue
    secondary: '#A0BFE0',
    accent: '#C5DFF8',
    text: '#2D3748',
    textMuted: '#A0AEC0',
    success: '#48BB78', // progress ring success
    danger: '#F56565',
    border: '#E2E8F0',
    heatmapBase: '#EBEDF0',
    heatmapLevel1: '#C5DFF8',
    heatmapLevel2: '#A0BFE0',
    heatmapLevel3: '#7895CB',
    heatmapLevel4: '#4A55A2',
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  }
};

export const Colors = {
  light: {
    text: Theme.colors.text,
    background: Theme.colors.background,
    tint: Theme.colors.primary,
    icon: Theme.colors.textMuted,
    tabIconDefault: Theme.colors.textMuted,
    tabIconSelected: Theme.colors.primary,
  },
  dark: {
    text: '#F7FAFC',
    background: '#1A202C',
    tint: Theme.colors.primary,
    icon: '#A0AEC0',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: Theme.colors.primary,
  },
};
