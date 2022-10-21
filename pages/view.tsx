import { Database } from "@/utils/db-definitions";
import { SiteColors } from '@/utils/theme';
import styled from "@emotion/styled";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CircularProgress, Link, Typography } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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
  const [readMe, setReadMe] = useState<string>();
  const router = useRouter();
  const client = useSupabaseClient<Database>();

  useEffect(() => {
    if (!pluginId) {
      return;
    }

    console.log("Fetch called", pluginId);
    setLoadingRegistryDetails(true);
    setLoadingPackageDetails(true);
    (async () => {
      const { data } = await client
        .from("package")
        .select("*, package_details(*)")
        .eq("package_id", pluginId);
      setLoadingRegistryDetails(false);
      setPlugin(data?.[0]);
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
    // Try to load README from GitHub
    const { url, type } = packageInfo?.repository || {};
    setLoadingReadMe(true);
    setReadMe(undefined);
    setRepo("");
    if (type !== "git" || !packageInfo.gitHead) {
      // Currently only supporting GitHub readmes
      setLoadingReadMe(false);
      return;
    }

    const head = packageInfo.gitHead;
    const repoUrl = url?.match(/github.com(.+).git/)?.[1];
    if (!repoUrl || !head) {
      setLoadingReadMe(false);
      return;
    }

    setRepo(repoUrl);
    const readmeUrl = `https://raw.githubusercontent.com/${repoUrl}/${head}/README.md`;
    fetch(readmeUrl).then((res) => {
      if (res.status !== 200) {
        setLoadingReadMe(false);
        return;
      }

      res.text().then(setReadMe);
    });
  }, [packageInfo]);

  if (loadingRegistryDetails) {
    return (
      <h1>
        Loading <CircularProgress color="primary" variant="soft" size="sm" />
      </h1>
    );
  }

  if (!loadingRegistryDetails && !plugin) {
    return (
      <>
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
    <>
      <ContentContainer>
        <ReadMeContainer>
          <Typography level="h3">{plugin.name || plugin.package_id}</Typography>
          <code>{plugin.package_id}</code>
          <MarkdownContainer>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkEmoji]}>
              {readMe || ""}
            </ReactMarkdown>
          </MarkdownContainer>
        </ReadMeContainer>
        <DetailsContainer>
          <DetailSection>
            <DetailHeader>Install</DetailHeader>
            <code>npm install {plugin.package_id}</code>
          </DetailSection>
          {repo && (
            <DetailSection>
              <DetailHeader>Repository</DetailHeader>
              <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faGithub} /> github.com{repo}
              </a>
            </DetailSection>
          )}
        </DetailsContainer>
      </ContentContainer>
    </>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;

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
`;

const ReadMeContainer = styled.div`
  flex: 1;
`;

const DetailsContainer = styled.div`
  min-width: 300px;
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
  
  a {
    color: ${SiteColors.LABEL};
    text-decoration: none;
  }
`;

const DetailHeader = styled.h3``;
