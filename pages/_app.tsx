import { Layout } from "@/components/layout/layout";
import { Database } from "@/utils/db-definitions";
import { CssBaseline, extendTheme, LinkProps } from "@mui/joy";
import { CssVarsProvider } from "@mui/joy/styles";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import Link, { LinkProps as nLinkProps } from "next/link";
import Script from "next/script";
import React, { useState } from "react";

function MyApp({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session | null }>) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  // eslint-disable-next-line react/display-name
  const LinkBehavior = React.forwardRef<
    any,
    Omit<nLinkProps, "to"> & { href: nLinkProps["href"] }
  >((props, ref) => {
    const { href, ...other } = props;
    if (href?.toString().startsWith("http")) {
      return <a ref={ref} href={href.toString()} {...(other as any)} />;
    }

    // Map href (MUI) -> to Next JS router
    return (
      <Link href={href} {...other}>
        <a ref={ref} {...other} />
      </Link>
    );
  });

  const theme = extendTheme({
    components: {
      JoyLink: {
        defaultProps: {
          component: LinkBehavior,
        } as LinkProps,
      },
    },
  });

  return (
    <>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <CssVarsProvider theme={theme}>
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
