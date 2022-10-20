import styled from "@emotion/styled";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Input } from "@mui/joy";
import { FC } from "react";

type Props = {
  placeholder: string;
  value: string;
  valueUpdate: (value: string) => void;
  handleSearch: () => void;
  searching?: boolean;
};

export const SearchInput: FC<Props> = ({
  placeholder,
  value,
  valueUpdate,
  handleSearch,
  searching,
}) => {
  return (
    <SearchContainer>
      <Input
        sx={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => valueUpdate(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        disabled={searching}
      />
      <IconButton
        type="button"
        aria-label="search"
        sx={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
        onClick={handleSearch}
      >
        <FontAwesomeIcon
          icon={searching ? faSpinner : faSearch}
          className={searching ? "fa-spin" : ""}
        />
      </IconButton>
    </SearchContainer>
  );
};

const SearchContainer = styled.div`
  display: flex;
`;
