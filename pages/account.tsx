import { MyPlugins } from "@/components/account/my-plugins";
import { Username } from "@/components/username";
import { Database } from "@/utils/db-definitions";
import styled from "@emotion/styled";
import { Button, Card, CardContent, Typography } from "@mui/joy";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Account() {
  const router = useRouter();
  const client = useSupabaseClient<Database>();
  const user = useUser();

  const tryLogout = async () => {
    try {
      const { error } = await client.auth.signOut();
      if (!!error) throw error;
      router.push("/");
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Account | Capacitor Plugin Registry</title>
      </Head>
      <PackageSection>
        <Card>
          <CardContent>
            <MyPlugins />
          </CardContent>
        </Card>
      </PackageSection>
      <ProfileSection variant="soft">
        <CardContent>
          <Username userOrName={user} level="h5" sx={{ textAlign: "center" }} />
          <LogoutButtonContainer>
            <Button
              variant="soft"
              color="danger"
              onClick={() => tryLogout()}
              sx={{ margin: "12px 0 0 0" }}
            >
              Sign Out
            </Button>
          </LogoutButtonContainer>
        </CardContent>
      </ProfileSection>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "login?t=account",
});

const Layout = styled.div`
  display: flex;
  margin-top: 32px;
  gap: 20px;
`;

const PackageSection = styled.section`
  display: flex;
  flex: 1;

  > * {
    flex: 1;
  }
`;

const ProfileSection = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 360px;
`;

const LogoutButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
