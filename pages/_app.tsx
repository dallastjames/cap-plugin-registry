import { Layout } from "@/components/layout/layout";
import { Database } from "@/utils/db-definitions";
import { siteTheme } from "@/utils/theme";
import { CssBaseline } from "@mui/joy";
import { CssVarsProvider } from "@mui/joy/styles";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import React, { useState } from "react";

// START include styles to prevent PostCSS from stripping them
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
// END PostCSS fix

function MyApp({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session | null }>) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  return (
    <>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <CssVarsProvider theme={siteTheme}>
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CssVarsProvider>
      </SessionContextProvider>
    </>
  );
}

export default MyApp;
