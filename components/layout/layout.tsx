import { PageHeader } from "@/components/layout/page-header";
import styled from '@emotion/styled';
import { FC, ReactElement } from "react";

type Props = {
  children: ReactElement;
};

export const Layout: FC<Props> = ({ children }) => {
  return (
    <div>
      <PageHeader />
      <PageContent>{children}</PageContent>
    </div>
  );
};

const PageContent = ({ children }: Props) => {
  return <PageContentContainer>{children}</PageContentContainer>;
};

const PageContentContainer = styled.div`
    padding: 0 16px;
`;
