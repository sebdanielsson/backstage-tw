import { createUnifiedTheme } from '@backstage/theme';

/**
 * Custom Backstage themes that override MUI component styles to align with
 * shadcn/Tailwind design tokens (CSS custom properties defined in index.css).
 *
 * We use oklch CSS variables so these themes automatically adapt when the
 * dark mode `.dark` class is toggled (via useBackstageThemeSync).
 */

// Shared MUI v5 component overrides that make MUI components look "shadcn-y"
const sharedComponentOverrides = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        height: '100%',
        fontFamily:
          'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      },
      body: {
        height: '100%',
        fontFamily:
          'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      },
      a: {
        color: 'var(--primary)',
        '&:hover': {
          color: 'var(--primary)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'unset',
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'none',
      },
      elevation0: {
        border: 'none',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        paddingBottom: 0,
      },
      title: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      subheader: {
        fontSize: '0.875rem',
        color: 'var(--muted-foreground)',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        flexGrow: 1,
        '&:last-child': {
          paddingBottom: 16,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '0.875rem',
        borderRadius: 'calc(var(--radius) - 2px)',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
      contained: {
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        '&:hover': {
          backgroundColor: 'var(--primary)',
          opacity: 0.9,
        },
      },
      outlined: {
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
        '&:hover': {
          backgroundColor: 'var(--accent)',
          borderColor: 'var(--border)',
        },
      },
      text: {
        color: 'var(--foreground)',
        '&:hover': {
          backgroundColor: 'var(--accent)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: 'var(--muted-foreground)',
        borderRadius: 'calc(var(--radius) - 2px)',
        '&:hover': {
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 36,
      },
      indicator: {
        backgroundColor: 'var(--foreground)',
        height: 2,
        borderRadius: 1,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: 36,
        padding: '6px 16px',
        color: 'var(--muted-foreground)',
        '&.Mui-selected': {
          color: 'var(--foreground)',
        },
        '&:hover': {
          color: 'var(--foreground)',
          backgroundColor: 'var(--accent)',
        },
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        color: 'var(--foreground)',
      },
      h1: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '0.875rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '0.875rem',
      },
      body2: {
        fontSize: '0.8125rem',
        color: 'var(--muted-foreground)',
      },
      subtitle1: {
        color: 'var(--muted-foreground)',
      },
      subtitle2: {
        color: 'var(--muted-foreground)',
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 'calc(var(--radius) - 2px)',
        '&:hover': {
          backgroundColor: 'var(--accent)',
        },
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--foreground)',
      },
      secondary: {
        fontSize: '0.8125rem',
        color: 'var(--muted-foreground)',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 24,
        padding: 0,
      },
      switchBase: {
        padding: 2,
        '&.Mui-checked': {
          transform: 'translateX(18px)',
          color: 'var(--primary-foreground)',
          '& + .MuiSwitch-track': {
            backgroundColor: 'var(--primary)',
            opacity: 1,
            border: 'none',
          },
        },
      },
      thumb: {
        width: 20,
        height: 20,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      track: {
        borderRadius: 12,
        backgroundColor: 'var(--input)',
        opacity: 1,
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '0.8125rem',
        borderColor: 'var(--border)',
        color: 'var(--muted-foreground)',
        borderRadius: 'calc(var(--radius) - 2px)',
        padding: '4px 12px',
        '&.Mui-selected': {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          borderColor: 'var(--primary)',
          '&:hover': {
            backgroundColor: 'var(--primary)',
            opacity: 0.9,
          },
        },
        '&:hover': {
          backgroundColor: 'var(--accent)',
        },
      },
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        '& .MuiToggleButton-root': {
          border: 'none',
          '&:not(:last-child)': {
            borderRight: '1px solid var(--border)',
          },
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 'calc(var(--radius) - 2px)',
          fontSize: '0.875rem',
          '& fieldset': {
            borderColor: 'var(--input)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--ring)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--ring)',
            borderWidth: 1,
          },
        },
        '& .MuiInputBase-input': {
          padding: '8px 12px',
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
        color: 'var(--foreground)',
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 'calc(var(--radius) - 2px)',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 'calc(var(--radius) - 2px)',
        border: '1px solid var(--border)',
        boxShadow:
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
        borderRadius: 'calc(var(--radius) - 4px)',
        margin: '2px 4px',
        padding: '6px 8px',
        '&:hover': {
          backgroundColor: 'var(--accent)',
        },
        '&.Mui-selected': {
          backgroundColor: 'var(--accent)',
          '&:hover': {
            backgroundColor: 'var(--accent)',
          },
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
        border: '1px solid var(--border)',
        fontSize: '0.75rem',
        borderRadius: 'calc(var(--radius) - 2px)',
        boxShadow:
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 'calc(var(--radius) - 2px)',
        fontSize: '0.75rem',
        fontWeight: 500,
        height: 24,
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        border: '1px solid var(--border)',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'var(--border)',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:nth-of-type(odd)': {
          backgroundColor: 'transparent',
        },
        '&:hover': {
          backgroundColor: 'var(--accent) !important',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid var(--border)',
        padding: '8px 16px',
        fontSize: '0.875rem',
      },
      head: {
        fontWeight: 600,
        color: 'var(--muted-foreground)',
        backgroundColor: 'var(--muted)',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: 'var(--primary)',
        textDecorationColor: 'var(--primary)',
      },
    },
    defaultProps: {
      underline: 'hover' as const,
    },
  },
  MuiGrid: {
    defaultProps: {
      spacing: 2,
    },
  },
  MuiTableSortLabel: {
    styleOverrides: {
      root: {
        '&:hover': {
          color: 'var(--foreground)',
        },
        '&.Mui-active': {
          fontWeight: 700,
          color: 'var(--foreground)',
        },
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'none',
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        fontSize: '0.875rem',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow:
          '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        backgroundColor: 'var(--secondary)',
      },
      bar: {
        borderRadius: 4,
        backgroundColor: 'var(--primary)',
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        color: 'var(--primary)',
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        color: 'var(--muted-foreground)',
      },
    },
  },
};

// Light theme
export const shadcnLightTheme = createUnifiedTheme({
  palette: {
    type: 'light',
    mode: 'light',
    background: {
      default: '#F8F8F8',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#171717',
    },
    secondary: {
      main: '#6E6E6E',
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    border: '#E6E6E6',
    textContrast: '#000000',
    textSubtle: '#6E6E6E',
    textVerySubtle: '#DDD',
    text: {
      primary: '#171717',
      secondary: '#6E6E6E',
    },
    navigation: {
      background: '#171717',
      indicator: '#9BF0E1',
      color: '#b5b5b5',
      selectedColor: '#FFF',
      navItem: {
        hoverBackground: '#404040',
      },
    },
    tabbar: {
      indicator: '#9BF0E1',
    },
  },
  fontFamily:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  components: sharedComponentOverrides,
});

// Dark theme
export const shadcnDarkTheme = createUnifiedTheme({
  palette: {
    type: 'dark',
    mode: 'dark',
    background: {
      default: '#0A0A0A',
      paper: '#171717',
    },
    primary: {
      main: '#FAFAFA',
      dark: '#E5E5E5',
    },
    secondary: {
      main: '#A3A3A3',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#60A5FA',
    },
    success: {
      main: '#34D399',
    },
    border: '#262626',
    textContrast: '#FFFFFF',
    textSubtle: '#A3A3A3',
    textVerySubtle: '#525252',
    text: {
      primary: '#FAFAFA',
      secondary: '#A3A3A3',
    },
    navigation: {
      background: '#171717',
      indicator: '#9BF0E1',
      color: '#b5b5b5',
      selectedColor: '#FFF',
      navItem: {
        hoverBackground: '#404040',
      },
    },
    tabbar: {
      indicator: '#9BF0E1',
    },
  },
  fontFamily:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  components: sharedComponentOverrides,
});
