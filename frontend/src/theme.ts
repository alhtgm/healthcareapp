import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#991b1b',
    },
    secondary: {
      main: '#f97316',
      light: '#fb923c',
      dark: '#c2410c',
    },
    background: {
      default: '#fff7f2',
      paper: '#ffffff',
    },
    success: {
      main: '#16a34a',
    },
    info: {
      main: '#0ea5e9',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#e11d48',
    },
  },
  typography: {
    fontFamily: '"Barlow", "Noto Sans JP", "Hiragino Kaku Gothic Pro", Meiryo, sans-serif',
    h5: {
      fontFamily: '"Teko", "Noto Sans JP", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '0.8px',
      lineHeight: 1,
    },
    h6: {
      fontFamily: '"Teko", "Noto Sans JP", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '0.4px',
      lineHeight: 1,
    },
    subtitle1: {
      fontWeight: 700,
      fontSize: '1rem',
      color: '#3f1d15',
    },
    body1: {
      fontSize: '0.96rem',
      lineHeight: 1.65,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(1200px 460px at 12% -8%, rgba(220,38,38,0.16), transparent 52%), radial-gradient(900px 360px at 90% -12%, rgba(249,115,22,0.2), transparent 48%), linear-gradient(180deg, #fff7f2 0%, #fff4ec 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(220, 38, 38, 0.15)',
          boxShadow: '0 10px 22px rgba(127, 29, 29, 0.09)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(217, 119, 6, 0.16)',
          boxShadow: '0 12px 22px rgba(124, 45, 18, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: '12px',
          transition: 'all 0.2s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #f97316 100%)',
          boxShadow: '0 8px 16px rgba(220, 38, 38, 0.28)',
          '&:hover': {
            boxShadow: '0 10px 18px rgba(220, 38, 38, 0.35)',
          },
        },
        outlined: {
          borderWidth: '2px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#dc2626',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '100%',
          borderRadius: '11px',
          background:
            'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(249,115,22,0.18) 100%)',
          zIndex: 0,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '14px',
          boxShadow: '0 16px 32px rgba(127, 29, 29, 0.25)',
        },
      },
    },
  },
})

export default theme
