import React from 'react';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

const theme = {
  components: {
    Mui: {
      styleOverrides: {
        '&.Mui-expanded': {
          margin: '0px 0px',
        }
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0px 0px 0px',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&.Mui-expanded': {
            margin: 'auto',
          },
        },
      },
    },
  },
};

export default function FacetFilterThemeConfig ({
  children,
}) {
  const computedTheme = createTheme(theme);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={computedTheme}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
