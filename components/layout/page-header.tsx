import styled from "@emotion/styled";
import { Link, Typography } from "@mui/joy";
import { useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import { Username } from "../username";

export function PageHeader() {
  const user = useUser();

  return (
    <HeaderContainer>
      <Link href="/" className="header-link">
        <Image
          src="/cap-logo.png"
          alt="Capacitor Logo"
          width="32px"
          height="32px"
        />
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: "500",
            marginLeft: "8px",
          }}
        >
          Capacitor Plugin Registry
        </Typography>
      </Link>
      <NavigationContainer>
        <Link
          className="nav-link"
          href="/submit"
          variant="solid"
          sx={{ padding: "4px 8px", minWidth: "80px" }}
        >
          Submit Plugin
        </Link>
        <Link
          className="nav-link"
          href="/account"
          variant={user ? "plain" : "outlined"}
          sx={{
            padding: "4px 8px",
            minWidth: "80px",
            justifyContent: "center",
          }}
        >
          {user ? <Username userOrName={user} /> : "Account"}
        </Link>
      </NavigationContainer>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 5px;
  height: 3rem;
  background-color: white;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
  width: 100%;

  .header-link {
    color: black;
    font-size: 20px;

    &:hover {
      text-decoration: none;
    }
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
