import { SearchInput } from "@/components/search-input";
import { PluginCategories } from "@/utils/enums/categories";
import styled from "@emotion/styled";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, IconButton, Input, Link, Typography } from "@mui/joy";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [keyWords, setKeyWords] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setKeyWords(Object.values(PluginCategories).sort());
  }, []);

  const handleSearch = async () => {
    if (!searchInput || searching) {
      return;
    }

    setSearching(true);
    await router.push(`/search?query=${encodeURIComponent(searchInput)}`);
  };

  return (
    <IndexContainer>
      <Head>
        <title>Capacitor Plugin Registry</title>
      </Head>
      <HeroImage />
      <SearchInput
        placeholder="Search plugins..."
        value={searchInput}
        valueUpdate={(search) => setSearchInput(search)}
        handleSearch={handleSearch}
        searching={searching}
      />
      <Typography level="h5" sx={{ m: "10px 0" }}>
        OR
      </Typography>
      <Card variant="soft">
        <Typography level="h5" sx={{ mb: "5px" }}>
          Choose a Category
        </Typography>
        <KeywordList>
          {keyWords.map((keyWord) => (
            <Link
              key={keyWord}
              href={"/search?keyword=" + encodeURIComponent(keyWord)}
              className="keyword-link"
            >
              {keyWord}
            </Link>
          ))}
        </KeywordList>
      </Card>
    </IndexContainer>
  );
};

const IndexContainer = styled.div`
  width: 100%;
  max-width: 38rem;
  margin: 0 auto;
  text-align: center;
`;

const HeroImage = styled.div`
  margin-top: 20px;
  background-image: url("/hero.png");
  height: 550px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
`;

const KeywordList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  .keyword-link {
    justify-content: center;
  }
`;

export default Home;
