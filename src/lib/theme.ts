import {createTheme} from "@mui/material/styles";
import createCache from "@emotion/cache";
import {prefixer} from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

/**
 * Material UI theme configuration with RTL support and Persian typography
 *
 * Features:
 * - RTL (right-to-left) direction for Persian language
 * - Vazir font family for proper Persian text rendering
 * - Custom color palette
 * - Component-level style overrides
 */
export const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Vazir, Arial, sans-serif",
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: "rtl",
        },
      },
    },
  },
});

/**
 * Emotion cache configured for RTL support
 *
 * Uses stylis-plugin-rtl to automatically flip CSS properties
 * for right-to-left layout (e.g., margin-left becomes margin-right)
 */
export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
