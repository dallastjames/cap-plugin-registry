import { PluginKeywords } from "@/utils/enums/keywords";
import styled from "@emotion/styled";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, IconButton, Input, Link, Typography } from "@mui/joy";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [keyWords, setKeyWords] = useState<string[]>([]);

  useEffect(() => {
    setKeyWords(Object.values(PluginKeywords).sort());
  }, []);

  return (
    <IndexContainer>
      <HeroImage />
      <SearchContainer>
        <Input
          sx={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          placeholder="Search plugins..."
        />
        <IconButton
          type="button"
          aria-label="search"
          sx={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
        >
          <FontAwesomeIcon icon={faSearch} />
        </IconButton>
      </SearchContainer>
      <Typography level="h5" sx={{ m: '10px 0' }}>OR</Typography>
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
  width: 38rem;
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

const SearchContainer = styled.div`
  display: flex;
`;

const KeywordList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  .keyword-link {
    justify-content: center;
  }
`;

export default Home;
