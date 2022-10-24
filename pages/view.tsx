import { PluginLikeButton } from "@/components/like-buttons/plugin-like-button";
import { Database } from "@/utils/db-definitions";
import { SiteColors } from "@/utils/theme";
import styled from "@emotion/styled";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CircularProgress, Link, Typography } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

export default function ViewPackagePage() {
  const [pluginId, setPluginId] = useState<string>("");
  const [plugin, setPlugin] = useState<any>();
  const [loadingRegistryDetails, setLoadingRegistryDetails] =
    useState<boolean>(true);
  const [loadingPackageDetails, setLoadingPackageDetails] =
    useState<boolean>(true);
  const [loadingReadMe, setLoadingReadMe] = useState<boolean>(true);
  const [registryPackageInfo, setRegistryPackageInfo] = useState<any>();
  const [packageInfo, setPackageInfo] = useState<any>();
  const [repo, setRepo] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [license, setLicense] = useState<string>("");
  const [readMe, setReadMe] = useState<string>();
  const [likeCount, setLikeCount] = useState<number>(0);
  const router = useRouter();
  const client = useSupabaseClient<Database>();

  useEffect(() => {
    if (!pluginId) {
      return;
    }

    setLoadingRegistryDetails(true);
    setLoadingPackageDetails(true);
    (async () => {
      const { data } = await client
        .from("package")
        .select("*, package_details(*)")
        .eq("package_id", pluginId);
      setLoadingRegistryDetails(false);
      setPlugin(data?.[0]);
      setLikeCount((data?.[0] as any)?.package_details?.[0]?.like_count || 0);
    })();

    (async () => {
      try {
        const res = await fetch(
          `/api/npm-package-lookup?packageId=${pluginId}`
        );

        if (res.status !== 200) {
          return;
        }

        setPackageInfo(await res.json());
      } catch {
        setPackageInfo(null);
      }
      setLoadingPackageDetails(false);
    })();
  }, [pluginId]);

  useEffect(() => {
    const { id = "" } = router.query || {};
    if (!id) {
      return;
    }

    setPluginId(id as string);
  }, [router.query]);

  useEffect(() => {
    if (!packageInfo) return;
    const { url, type } = packageInfo?.repository || {};
    setLoadingReadMe(true);
    setReadMe(undefined);
    setRepo(url);
    setVersion(packageInfo.version ?? "");
    setLicense(packageInfo.license ?? "");

    const getReadme = async () => {
      const searchParams = new URLSearchParams();
      searchParams.append("packageId", packageInfo?.name ?? "");

      const res = await fetch(
        `/api/get-package-readme?${searchParams.toString()}`
      );
      if (res.status !== 200 && res.status !== 201) {
        console.error(await res.json());
        return;
      }
      const content = await res.json();
      setReadMe(content.readmeContents);
      setLoadingReadMe(false);
    };

    getReadme();
  }, [packageInfo]);

  if (loadingRegistryDetails || loadingPackageDetails) {
    return (
      <>
        <Head>
          <title>Plugin Loading | Capacitor Plugin Registry </title>
        </Head>
        <h1>
          Loading <CircularProgress color="primary" variant="soft" size="sm" />
        </h1>
      </>
    );
  }

  if (!loadingRegistryDetails && !plugin) {
    return (
      <>
        <Head>
          <title>Plugin Not Found | Capacitor Plugin Registry </title>
        </Head>
        <h1>Package not found</h1>
        <p>
          This package was not found in our registry.
          <br />
          If you own it and would like to submit it, head over to the{" "}
          <Link href="/submit">submit page</Link>.
        </p>
      </>
    );
  }

  return (
    <ContentContainer>
      <Head>
        <title>
          {plugin.name || plugin.package_id} | Capacitor Plugin Registry{" "}
        </title>
      </Head>
      <ReadMeContainer>
        <Typography level="h3">{plugin.name || plugin.package_id}</Typography>
        <MarkdownContainer>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkEmoji]}>
            {readMe || ""}
          </ReactMarkdown>
        </MarkdownContainer>
      </ReadMeContainer>
      {!loadingRegistryDetails && (
        <DetailsContainer>
          <DetailSection>
            <DetailHeader>Install</DetailHeader>
            <code>npm install {plugin.package_id}</code>
          </DetailSection>
          {repo && (
            <DetailSection>
              <DetailHeader>Repository</DetailHeader>
              <a
                href={`https://github.com/${repo}`}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faGithub} /> github.com{repo}
              </a>
            </DetailSection>
          )}
          {version && (
            <MultipleDetailSection>
              <DetailSection>
                <DetailHeader>Version</DetailHeader>
                {version}
              </DetailSection>
              <DetailSection>
                <DetailHeader>License</DetailHeader>
                {license || "Unknown"}
              </DetailSection>
            </MultipleDetailSection>
          )}
          <LikeContainer>
            <PluginLikeButton
              label="Upvote"
              packageId={pluginId}
              likeCount={likeCount}
              likeChanged={setLikeCount}
            />
          </LikeContainer>
        </DetailsContainer>
      )}
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  margin-top: 20px;
  padding: 0 40px;

  code {
    padding: 10px;
    background-color: #f6f7fa;
    border-radius: 8px;
  }

  table,
  th,
  td {
    border: 1px solid #e5e8ed;
    padding: 10px;
    border-collapse: collapse;
  }

  blockquote {
    border-left: 4px solid #e5e8ed;
    margin-left: 0;
    padding-left: 20px;
  }
`;

const ReadMeContainer = styled.div`
  flex: 1;
  max-width: calc(100% - 400px);
`;

const DetailsContainer = styled.div`
  width: 400px;
`;

const MarkdownContainer = styled.div`
  h1 {
    font-size: 22px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 18px;
  }

  h4,
  h5,
  h6 {
    font-size: 16px;
  }
`;

const DetailSection = styled.div`
  border-bottom: 1px solid #e5e8ed;
  padding-bottom: 15px;
  flex-grow: 1;

  a {
    color: ${SiteColors.LABEL};
    text-decoration: none;
  }
`;

const DetailHeader = styled.h3``;

const MultipleDetailSection = styled.div`
  display: flex;
`;

const LikeContainer = styled.div`
  text-align: left;
  margin-top: 10px;
`;
