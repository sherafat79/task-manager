import {createTheme} from "@mui/material/styles";
import createCache from "@emotion/cache";
import {prefixer} from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

// Create Material UI theme with RTL direction and Vazir font
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

// Create RTL cache for emotion
export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
