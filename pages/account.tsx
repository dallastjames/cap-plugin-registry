import { withPageAuth } from "@supabase/auth-helpers-nextjs";

export default function Account() {
  return <p>This is an account page</p>;
}

export const getServerSideProps = withPageAuth({
  redirectTo: "login",
});
