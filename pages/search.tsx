import { SearchInput } from "@/components/search-input";
import { PluginKeywords } from "@/utils/enums/keywords";
import styled from "@emotion/styled";
import { Card, Typography } from "@mui/joy";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Search() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCategories(Object.values(PluginKeywords).sort());
  }, []);

  useEffect(() => {
    const { keyword = "", query = "" } = router.query || {};
    setSearchInput(query as string);
    console.log("Query params updated:", keyword, query);
  }, [router.query]);

  const handleSearchInput = async () => {
    if (searching) {
      return;
    }

    // setSearching(true);
    const keyword = (router.query.keyword || "") as string;
    await router.replace(
      `/search?query=${encodeURIComponent(searchInput)}${
        keyword ? "&keyword=" + encodeURIComponent(keyword) : ""
      }`
    );
  };

  return (
    <SearchPageContainer>
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
            router.query.keyword === category ? (
              <strong key={category}>{category}</strong>
            ) : (
              <Link
                key={category}
                href={`/search?${
                  router.query.query ? "query=" + router.query.query + "&" : ""
                }keyword=${encodeURIComponent(category)}`}
                replace={true}
              >
                {category}
              </Link>
            )
          )}
        </KeywordsContainer>
        <ResultsContainer variant="outlined">
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
          <div>Hello world</div>
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
