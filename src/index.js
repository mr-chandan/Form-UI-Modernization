import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CustomerFormSimplified from './CustomerFormSimplified.jsx';

// ============================================================================
// LINEAR DESIGN SYSTEM — Dark Theme Tokens
// ============================================================================
const tokens = {
  bg: {
    deep: '#020203',
    base: '#050506',
    elevated: '#0a0a0c',
    surface: 'rgba(255,255,255,0.05)',
    surfaceHover: 'rgba(255,255,255,0.08)',
  },
  fg: {
    primary: '#EDEDEF',
    muted: '#8A8F98',
    subtle: 'rgba(255,255,255,0.60)',
  },
  accent: {
    main: '#5E6AD2',
    bright: '#6872D9',
    glow: 'rgba(94,106,210,0.3)',
    glowSubtle: 'rgba(94,106,210,0.15)',
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    hover: 'rgba(255,255,255,0.10)',
    accent: 'rgba(94,106,210,0.30)',
  },
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.accent.main,
      light: tokens.accent.bright,
    },
    secondary: {
      main: '#8A8F98',
    },
    background: {
      default: tokens.bg.base,
      paper: tokens.bg.elevated,
    },
    text: {
      primary: tokens.fg.primary,
      secondary: tokens.fg.muted,
    },
    error: {
      main: '#E5484D',
    },
    divider: tokens.border.default,
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.bg.base,
          color: tokens.fg.primary,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#0F0F12',
            color: tokens.fg.primary,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.10)',
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.15)',
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.accent.main,
              borderWidth: '1px',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${tokens.accent.glowSubtle}`,
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(255,255,255,0.02)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.04)' },
            },
          },
          '& .MuiInputLabel-root': {
            color: tokens.fg.muted,
            fontWeight: 500,
            fontSize: '0.8125rem',
            '&.Mui-focused': { color: tokens.accent.bright },
          },
          '& .MuiFormHelperText-root': {
            color: tokens.fg.subtle,
            fontSize: '0.75rem',
          },
          '& input': {
            color: tokens.fg.primary,
            '&::placeholder': { color: 'rgba(255,255,255,0.3)' },
          },
          '& textarea': {
            color: tokens.fg.primary,
          },
          // Fix date input icon color
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            filter: 'invert(1)',
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#0F0F12',
          color: tokens.fg.primary,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.10)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.15)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.accent.main,
            borderWidth: '1px',
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${tokens.accent.glowSubtle}`,
          },
          '& .MuiSelect-icon': {
            color: tokens.fg.muted,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.fg.muted,
          fontWeight: 500,
          fontSize: '0.8125rem',
          '&.Mui-focused': { color: tokens.accent.bright },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: tokens.fg.subtle,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        contained: {
          backgroundColor: tokens.accent.main,
          color: '#fff',
          boxShadow: `0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.25), inset 0 1px 0 0 rgba(255,255,255,0.1)`,
          '&:hover': {
            backgroundColor: tokens.accent.bright,
            boxShadow: `0 0 0 1px rgba(94,106,210,0.6), 0 8px 24px rgba(94,106,210,0.35), inset 0 1px 0 0 rgba(255,255,255,0.15)`,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
            boxShadow: `0 0 0 1px rgba(94,106,210,0.5), 0 2px 8px rgba(94,106,210,0.2)`,
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.10)',
          color: tokens.fg.primary,
          backgroundColor: 'rgba(255,255,255,0.03)',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.2)',
          '&.Mui-checked': { color: tokens.accent.main },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: tokens.fg.primary,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.bg.elevated,
          color: tokens.fg.primary,
          border: `1px solid ${tokens.border.default}`,
          fontSize: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: tokens.fg.primary,
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(94,106,210,0.15)',
            '&:hover': { backgroundColor: 'rgba(94,106,210,0.2)' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.bg.elevated,
          backgroundImage: 'none',
          border: `1px solid ${tokens.border.default}`,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: tokens.fg.muted,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: `radial-gradient(ellipse at top, #0a0a0f 0%, #050506 50%, #020203 100%)`,
        overflow: 'hidden',
      }}>
        {/* Ambient gradient blob — top */}
        <div style={{
          position: 'fixed',
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(94,106,210,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        {/* Ambient gradient blob — bottom-left */}
        <div style={{
          position: 'fixed',
          bottom: '-100px',
          left: '-200px',
          width: '700px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(94,106,210,0.06) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <CustomerFormSimplified />
        </div>
      </div>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
