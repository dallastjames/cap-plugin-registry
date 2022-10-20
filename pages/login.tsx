import styled from "@emotion/styled";
import { Button, Card, CardContent } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Database } from "@/utils/db-definitions";

export default function LoginPage() {
  const router = useRouter();
  const user = useUser();
  const client = useSupabaseClient<Database>();
  const [error, setError] = useState<string | null>(null);
  const redirectType = router.query?.t;

  useEffect(() => {
    if (!!user) {
      router.push("/account");
    }
  }, []);

  const tryLogin = async () => {
    setError(null);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${location.protocol}//${location.host}${typeToRedirect(
            redirectType
          )}`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      console.error(e);
      const errorMessage = (e.error_description || e.message) as string;
      setError(errorMessage);
    }
  };

  return (
    <Layout>
      <Card>
        <CardContent>
          <h2>Capacitor Plugin Registry</h2>
          <Button onClick={() => tryLogin()}>
            <Icon icon={faGithub} />
            Sign In With Github
          </Button>
        </CardContent>
      </Card>
    </Layout>
  );
}

function typeToRedirect(type?: string | string[]): string {
  if (!type || Array.isArray(type)) {
    return "/";
  }
  switch (type) {
    case "submit":
      return "/submit";
    case "account":
      return "/account";
    default:
      return "/";
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
