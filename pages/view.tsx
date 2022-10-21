import { Database } from "@/utils/db-definitions";
import { CircularProgress, Link, Typography } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';

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
      <Typography level="h2">{plugin.name || plugin.package_id}</Typography>
      <Typography level="body2">{plugin.package_id}</Typography>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkEmoji]}>{readMe || ''}</ReactMarkdown>
    </>
  );
}
