import { Database } from "@/utils/db-definitions";
import { Button } from "@mui/joy";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Account() {
  const router = useRouter();
  const client = useSupabaseClient<Database>();

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
    <div>
      <h1>Account Page</h1>
      <Button onClick={() => tryLogout()}>Logout</Button>
    </div>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "login?t=account",
});
