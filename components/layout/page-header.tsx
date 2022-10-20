import styled from "@emotion/styled";
import { Link } from "@mui/joy";

export function PageHeader() {
  return (
    <HeaderContainer>
      <Link href="/" className="header-link">
        Capacitor Plugin Registry
      </Link>
      <NavigationContainer>
        <Link className="nav-link" href="/list">
          Plugin List
        </Link>
        <Link className="nav-link" href="/submit">
          Submit Plugin
        </Link>
      </NavigationContainer>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 5px;
  height: 3rem;
  background-color: white;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);

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
  gap: 10px;
`;
