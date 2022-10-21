import { SearchInput } from "@/components/search-input";
import { SUCCESS } from "@/utils/http-codes";
import { SiteColors } from "@/utils/theme";
import styled from "@emotion/styled";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { useRouter } from "next/router";
import { useState } from "react";

export default function SubmitPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async () => {
    setError("");
    setSearching(true);
    setPackageInfo(null);
    const params = new URLSearchParams();
    params.append("packageId", searchInput.toLowerCase());
    const res = await fetch(`/api/npm-package-lookup?${params.toString()}`);
    if (res.status === SUCCESS) {
      setPackageInfo(await res.json());
    } else {
      setError((await res.json()).error ?? "Query Error");
    }
    setSearching(false);
  };

  const submitToRegistry = async (packageId: string) => {
    if (submitting) return;
    setSubmitting(true);

    setTimeout(() => {
      const params = new URLSearchParams();
      params.append("id", packageId.toLowerCase());
      router.push(`/view?${params.toString()}`);
    }, 2000);
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
            {packageInfo && (
              <>
                <ConfirmText level="body3">
                  If the package shown is what you are expecting, click submit
                  below to add it to the plugin registry
                </ConfirmText>
                <Button
                  variant="solid"
                  onClick={() => submitToRegistry(searchInput)}
                >
                  {submitting ? (
                    <LoadingIcon icon={faSpinner} className="fa-spin" />
                  ) : (
                    "Submit Plugin"
                  )}
                </Button>
              </>
            )}
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

const SearchInputBox = styled.div`
  max-width: 400px;
  width: 400px;
`;

const ResultsBox = styled.div`
  flex: 1;
  overflow: hidden;
`;

const RequirementsList = styled.ol`
  margin-top: 0;
`;

const PackageDetailsOutput = styled.pre`
  white-space: pre-wrap;
`;

const ConfirmText = styled(Typography)`
  margin: 32px 0 12px;
`;

const LoadingIcon = styled(FontAwesomeIcon)`
  font-size: 24px;
`;
