import { PluginList } from "@/components/plugin-list/plugin-list";
import { CombinedPluginType } from "@/components/plugin-list/plugin-list-item";
import { SearchInput } from "@/components/search-input";
import { Database } from "@/utils/db-definitions";
import { PluginCategories } from "@/utils/enums/categories";
import styled from "@emotion/styled";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Typography } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Search() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [plugins, setPlugins] = useState<CombinedPluginType[]>([]);
  const client = useSupabaseClient<Database>();
  const router = useRouter();

  useEffect(() => {
    setCategories(Object.values(PluginCategories).sort());
  }, []);

  useEffect(() => {
    const { category = "", query = "" } = router.query || {};
    setSearchInput(query as string);
    console.log("Query params updated:", category, query);

    setSearching(true);
    search();
  }, [router.query]);

  const handleSearchInput = async () => {
    if (searching) {
      return;
    }

    const category = (router.query.category || "") as string;
    await router.replace(
      `/search?query=${encodeURIComponent(searchInput)}${
        category ? "&category=" + encodeURIComponent(category) : ""
      }`
    );
  };

  const search = async () => {
    const { category = "", query = "" }: { category?: string; query?: string } =
      router.query || {};
    let supabaseQuery = client
      .from("package")
      .select(
        "package_id, name, category, keywords, package_details(like_count, rating_count, rating_sum)"
      );

    if (!!query) {
      supabaseQuery = supabaseQuery.textSearch("fts", query);
    }

    // Find selected category enum value
    const selectedCategory =
      category &&
      Object.entries(PluginCategories).find(([enumValue, prettyText]) => {
        return prettyText === category;
      })?.[0];

    if (!!selectedCategory) {
      supabaseQuery = supabaseQuery.eq("category", selectedCategory);
    }

    const { error, data, count } = await supabaseQuery.order("name", {
      ascending: true,
    });
    console.log({ error, data, count });

    setPlugins((data || []) as CombinedPluginType[]);
    setSearching(false);
  };

  return (
    <SearchPageContainer>
      <Head>
        <title>Search Results | Capacitor Plugin Registry</title>
      </Head>
      <SearchInput
        placeholder="Search plugins..."
        value={searchInput}
        valueUpdate={setSearchInput}
        handleSearch={handleSearchInput}
        searching={searching}
      />
      <ResultsAndKeywordsContainer>
        <KeywordsContainer variant="soft">
          <Typography level="h5" sx={{ textAlign: "center", pb: "5px" }}>
            Categories
          </Typography>
          {categories.map((category) =>
            router.query.category === category ? (
              <AlreadySelectedKeywordContainer key={category}>
                <strong>{category}</strong>
                <Link
                  href={`/search${
                    router.query.query ? "?query=" + router.query.query : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faClose} className="remove-category" />
                </Link>
              </AlreadySelectedKeywordContainer>
            ) : (
              <Link
                key={category}
                href={`/search?${
                  router.query.query ? "query=" + router.query.query + "&" : ""
                }category=${encodeURIComponent(category)}`}
                replace={true}
              >
                {category}
              </Link>
            )
          )}
        </KeywordsContainer>
        <ResultsContainer variant="outlined">
          <PluginList plugins={plugins} />
        </ResultsContainer>
      </ResultsAndKeywordsContainer>
    </SearchPageContainer>
  );
}

const SearchPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const ResultsAndKeywordsContainer = styled.div`
  display: grid;
  grid-template-columns: 12rem auto;
  gap: 10px;
  margin-top: 15px;
`;

const KeywordsContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 12rem;
`;

const ResultsContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AlreadySelectedKeywordContainer = styled.div`
  display: flex;

  strong {
    flex-grow: 1;
  }

  .remove-category {
    display: inline;
    color: red;
    cursor: pointer;
    margin-top: 5px;
  }
`;
