import { Database } from "@/utils/db-definitions";
import { CssVarsProvider } from "@mui/joy/styles";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useState } from "react";

function MyApp({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session | null }>) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <CssVarsProvider>
        <Component {...pageProps} />
      </CssVarsProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
