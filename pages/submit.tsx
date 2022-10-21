import { ChipInput } from "@/components/chip-input";
import { SearchInput } from "@/components/search-input";
import { Database } from "@/utils/db-definitions";
import { PluginCategories } from "@/utils/enums/categories";
import { CREATED, SUCCESS } from "@/utils/http-codes";
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
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SubmitPage() {
  const router = useRouter();
  const client = useSupabaseClient<Database>();
  const user = useUser();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [isMaintainer, setIsMaintainer] = useState(false);
  const [categoryValue, setCategoryValue] = useState<
    keyof typeof PluginCategories | null
  >(null);
  const [keywordsValue, setKeywordsValue] = useState<string[]>([]);
  const [nameValue, setNameValue] = useState("");
  const [namePlaceholder, setNamePlaceholder] = useState("");

  const resetUploadParams = () => {
    setCategoryValue(null);
    setKeywordsValue([]);
    setNameValue("");
    setNamePlaceholder("");
  };

  const handleSearch = async () => {
    if (!user) return;
    resetUploadParams();
    setError("");
    setSearching(true);
    setPackageInfo(null);
    try {
      const packageId = searchInput.toLowerCase().trim();
      const params = new URLSearchParams();
      params.append("packageId", packageId);
      const res = await fetch(`/api/npm-package-lookup?${params.toString()}`);
      if (res.status !== SUCCESS) {
        throw new Error((await res.json()).error ?? "Query Error");
      }
      const packageData = await res.json();
      const { error, data } = await client
        .from("package")
        .select("package_id")
        .eq("package_id", packageId);
      if (error) throw error;
      setPackageInfo(packageData);
      setNamePlaceholder(packageId);
      setKeywordsValue(packageData?.keywords ?? []);
      setIsMaintainer(
        packageData?.maintainers?.find(
          (m: { name: string; email: string }) => m.email === user.email
        )
      );
      setAlreadyExists(data.length !== 0);
    } catch (e: any) {
      console.error(e);
      const errorMessage = (e.error_description || e.message) as string;
      setError(errorMessage);
    } finally {
      setSearching(false);
    }
  };

  const navigateToPlugin = (packageId: string) => {
    packageId = packageId.toLowerCase().trim();

    const params = new URLSearchParams();
    params.append("id", packageId);
    router.push(`/view?${params.toString()}`);
  };

  const submitToRegistry = async (packageId: string) => {
    if (submitting || !packageInfo) return;
    setSubmitting(true);

    packageId = packageId.toLowerCase().trim();

    const params = new URLSearchParams();
    params.append("packageId", packageId);
    params.append("keywords", keywordsValue.join(","));
    params.append("category", categoryValue ?? "");
    params.append("name", nameValue);

    const res = await fetch(`/api/submit-npm-package`, {
      method: "POST",
      body: params,
    });

    if (res.status !== CREATED) {
      setError((await res.json()).error ?? "Submit Error");
      setSubmitting(false);
      return;
    }

    setTimeout(() => {
      navigateToPlugin(packageId);
    }, 2000);
  };

  return (
    <Layout>
      <Head>
        <title>Submit Plugin | Capacitor Plugin Registry</title>
      </Head>
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
                  The package must be a Capacitor plugin
                </Typography>
              </li>
              <li>
                <Typography level="body2">
                  You may submit a plugin for which you are not a maintainer,
                  however, a package maintainer may come claim and manage the
                  package here at any time.
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
                {!alreadyExists ? (
                  <>
                    <Typography level="h5" sx={{ margin: "20px auto 0" }}>
                      Plugin Details
                    </Typography>
                    <FormControl sx={{ marginBottom: "12px" }}>
                      <FormLabel>Plugin Name</FormLabel>
                      <Input
                        placeholder={namePlaceholder}
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ marginBottom: "12px" }}>
                      <FormLabel>Category</FormLabel>
                      <Select
                        defaultValue=""
                        placeholder="Select Category"
                        onChange={(e, newValue) =>
                          setCategoryValue(newValue as any)
                        }
                      >
                        {Object.keys(PluginCategories)
                          .sort()
                          .map((key) => (
                            <Option key={key} value={key}>
                              {
                                PluginCategories[
                                  key as keyof typeof PluginCategories
                                ]
                              }
                            </Option>
                          ))}
                      </Select>
                    </FormControl>
                    <ChipInput
                      label="Keywords"
                      placeholder="Add Keyword"
                      value={keywordsValue}
                      onChange={(e) => setKeywordsValue(e)}
                    />
                  </>
                ) : (
                  <></>
                )}

                <ConfirmText level="body3">
                  {alreadyExists
                    ? "This package already exists in the registry, click below to view this plugin"
                    : !isMaintainer
                    ? "You are not in the maintainers list for this plugin. You may submit the plugin, however, a maintainer may come claim and manage this package at any time"
                    : "If the package shown is what you are expecting, click submit below to add it to the plugin registry"}
                </ConfirmText>
                {alreadyExists ? (
                  <Button
                    variant="solid"
                    color="primary"
                    onClick={() => navigateToPlugin(searchInput)}
                  >
                    View Plugin
                  </Button>
                ) : !isMaintainer ? (
                  <Button
                    variant="solid"
                    color="warning"
                    onClick={() => submitToRegistry(searchInput)}
                  >
                    {submitting ? (
                      <LoadingIcon icon={faSpinner} className="fa-spin" />
                    ) : (
                      "Submit Plugin"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="solid"
                    color="success"
                    onClick={() => submitToRegistry(searchInput)}
                  >
                    {submitting ? (
                      <LoadingIcon icon={faSpinner} className="fa-spin" />
                    ) : (
                      "Submit Plugin"
                    )}
                  </Button>
                )}
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
