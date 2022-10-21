import { Database } from "@/utils/db-definitions";
import { SiteColors } from "@/utils/theme";
import styled from "@emotion/styled";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Typography } from "@mui/joy";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { PluginList } from "../plugin-list/plugin-list";
import { SearchInput } from "../search-input";

export function MyPlugins() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(true);
  const [pluginList, setPluginList] = useState<any[]>([]);
  const [pluginCount, setPluginCount] = useState<number>(0);
  const client = useSupabaseClient<Database>();
  const user = useUser();

  const pluginSearch = async (searchTerm: string) => {
    let query = client
      .from("package")
      .select(
        "package_id, name, category, keywords, package_details(like_count, rating_count, rating_sum)"
      )
      .eq("user_id", user?.id ?? "");
    if (searchTerm.length >= 3) {
      query = query.textSearch("fts", searchTerm);
    }
    const { error, data, count } = await query.order("package_id", {
      ascending: true,
    });
    if (error) throw error;
    return { data, count };
  };

  const handleSearch = async () => {
    if (searching) {
      return;
    }

    setSearching(true);
    try {
      const { data, count } = await pluginSearch(searchInput);
      setPluginCount(count ?? 0);
      setPluginList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const { data, count } = await pluginSearch(searchInput);
        setPluginCount(count ?? 0);
        setPluginList(data);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    };
    loadPlugins();
  }, []);

  return (
    <Layout>
      <Typography level="h2">My Plugins</Typography>
      <SearchInput
        placeholder="Search plugins..."
        value={searchInput}
        valueUpdate={(search) => setSearchInput(search)}
        handleSearch={handleSearch}
        searching={searching}
      />
      {searching ? (
        <LoadingIcon icon={faSpinner} className="fa-spin" />
      ) : pluginList.length > 0 ? (
        <PluginList plugins={pluginList} canEdit={true} />
      ) : (
        <Alert
          color="warning"
          variant="outlined"
          size="sm"
          sx={{ margin: "auto" }}
        >
          No plugins here! Why not submit one?
        </Alert>
      )}
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingIcon = styled(FontAwesomeIcon)`
  margin: 20px auto;
  font-size: 24px;
  color: ${SiteColors.PRIMARY};
`;
