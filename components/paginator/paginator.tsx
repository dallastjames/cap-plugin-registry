import { siteTheme } from "@/utils/theme";
import styled from "@emotion/styled";
import { FC } from "react";
import ReactPaginate from "react-paginate";

type Props = {
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
};

export const Paginator: FC<Props> = ({ setPage, page, pageCount }) => {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      pageCount={pageCount}
      forcePage={page}
      onPageChange={({ selected }) => setPage(selected)}
    ></Pagination>
  );
};

const Pagination = styled(ReactPaginate)`
  display: flex;
  gap: 20px;
  justify-content: center;

  li {
    list-style-type: none;

    a {
      cursor: pointer;
    }

    &.selected {
      color: ${siteTheme.colorSchemes.light.palette.primary["500"]};
    }
  }
`;
