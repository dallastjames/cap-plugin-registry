import { SearchInput } from "@/components/search-input";
import { SUCCESS } from "@/utils/http-codes";
import styled from "@emotion/styled";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Input,
  Typography,
} from "@mui/joy";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

export default function SubmitPage() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);

  const handleSearch = async () => {
    setError("");
    setSearching(true);
    setPackageInfo(null);
    const params = new URLSearchParams();
    params.append("packageId", searchInput);
    const res = await fetch(`/api/npm-package-lookup?${params.toString()}`);
    if (res.status === SUCCESS) {
      setPackageInfo(await res.json());
    } else {
      setError((await res.json()).error ?? "Query Error");
    }
    setSearching(false);
  };

  return (
    <Layout>
      <SearchInputBox>
        <Card variant="soft">
          <CardContent>
            <Typography level="h5" sx={{ textAlign: "center" }}>
              Package Search
            </Typography>
            <Typography level="body2" sx={{ textAlign: "center" }}>
              To add a package:
            </Typography>
            <RequirementsList>
              <li>
                <Typography level="body2">
                  You must be a maintainer of the package
                </Typography>
              </li>
              <li>
                <Typography level="body2">
                  The package must be a Capacitor plugin
                </Typography>
              </li>
            </RequirementsList>
            <SearchInput
              placeholder="Search NPM..."
              value={searchInput}
              valueUpdate={(search) => setSearchInput(search)}
              handleSearch={handleSearch}
              searching={searching}
            />
          </CardContent>
        </Card>
      </SearchInputBox>
      <ResultsBox>
        <Card variant="outlined">
          <CardContent>
            {error ? (
              <Alert color="danger" sx={{ margin: "auto" }}>
                {error}
              </Alert>
            ) : null}
            <PackageDetailsOutput>
              {packageInfo ? JSON.stringify(packageInfo, null, 2) : null}
            </PackageDetailsOutput>
          </CardContent>
        </Card>
      </ResultsBox>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "login?t=submit",
});

const Layout = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 20px;
`;

const SearchInputBox = styled.div``;

const ResultsBox = styled.div`
  flex: 1;
  overflow: scroll;
`;

const RequirementsList = styled.ol`
  margin-top: 0;
`;

const PackageDetailsOutput = styled.pre`
  white-space: pre-wrap;
`;
