import { Username } from "@/components/username";
import { Database } from "@/utils/db-definitions";
import styled from "@emotion/styled";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, CardContent, Typography } from "@mui/joy";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
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
      <PackageSection>
        <Card>
          <CardContent></CardContent>
        </Card>
      </PackageSection>
      <ProfileSection variant="soft">
        <CardContent>
          <LogoutButtonContainer>
            <Username
              userOrName={user}
              level="h5"
              sx={{ textAlign: "center" }}
            />
            <Button
              variant="soft"
              color="danger"
              onClick={() => tryLogout()}
              sx={{ marginLeft: "8px" }}
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

const Icon = styled(FontAwesomeIcon)`
  margin-right: 8px;
`;

const Layout = styled.div`
  display: flex;
`;

const PackageSection = styled.section`
  display: flex;
  flex: 1;
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
