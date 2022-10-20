import styled from "@emotion/styled";
import { Alert, Button, Card, CardContent } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Database } from "@/utils/db-definitions";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import Head from "next/head";

export default function LoginPage() {
  const router = useRouter();
  const user = useUser();
  const client = useSupabaseClient<Database>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectType = router.query?.t;

  useEffect(() => {
    if (!!user) {
      router.push(typeToRedirect(redirectType, "/account"));
    }
  }, [user, router]);

  const tryLogin = async () => {
    setErrorMessage(null);
    try {
      console.log(
        `${location.protocol}//${location.host}${typeToRedirect(redirectType)}`
      );
      const { error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${location.protocol}//${location.host}${typeToRedirect(
            redirectType
          )}`,
        },
      });
      if (error) throw error;
      console.log("after error");
    } catch (e: any) {
      console.error(e);
      const errorMessage = (e.error_description || e.message) as string;
      setErrorMessage(errorMessage);
    }
  };

  return (
    !user && (
      <Layout>
        <Head>
          <title>Login | Capacitor Plugin Registry</title>
        </Head>
        <Card variant="soft">
          <CardContent>
            <h2>Capacitor Plugin Registry</h2>
            {errorMessage && (
              <ErrorWarning variant="soft" color="danger">
                {errorMessage}
              </ErrorWarning>
            )}
            <Button onClick={() => tryLogin()}>
              <Icon icon={faGithub} />
              Sign In With Github
            </Button>
          </CardContent>
        </Card>
      </Layout>
    )
  );
}

function typeToRedirect(
  type?: string | string[],
  defaultPath: string = "/"
): string {
  if (!type || Array.isArray(type)) {
    return defaultPath;
  }
  switch (type) {
    case "submit":
      return "/submit";
    case "account":
      return "/account";
    default:
      return defaultPath;
  }
}

const Layout = styled.div`
  height: calc(100vh - 48px - 5px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled(FontAwesomeIcon)`
  margin-right: 8px;
`;

const ErrorWarning = styled(Alert)`
  margin-bottom: 6px;
`;
