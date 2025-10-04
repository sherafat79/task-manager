"use client";

import {useEffect, useState} from "react";
import {CacheProvider} from "@emotion/react";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "react-hot-toast";
import {theme, cacheRtl} from "@/lib/theme";
import {queryClient} from "@/lib/queryClient";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // Initialize MSW only in development environment
    if (process.env.NODE_ENV === "development") {
      import("@/mocks/browser")
        .then(({worker}) => {
          return worker.start({
            onUnhandledRequest: "bypass",
          });
        })
        .then(() => {
          setMswReady(true);
        })
        .catch((error) => {
          console.error("Failed to start MSW:", error);
          setMswReady(true); // Continue even if MSW fails
        });
    } else {
      setMswReady(true);
    }
  }, []);

  // Wait for MSW to be ready in development before rendering
  if (!mswReady) {
    return null;
  }

  return (
    <html lang="fa" dir="rtl">
      <body>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
              {children}
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  duration: 5000,
                  style: {
                    fontFamily: "Vazir, Arial, sans-serif",
                  },
                  success: {
                    iconTheme: {
                      primary: "#4caf50",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#f44336",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </QueryClientProvider>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
