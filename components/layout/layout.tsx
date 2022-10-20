import { PageHeader } from "@/components/layout/page-header";
import { FC, ReactElement } from "react";

type Props = {
  children: ReactElement;
};

export const Layout: FC<Props> = ({ children }) => {
  return (
    <div>
      <PageHeader />
      {children}
    </div>
  );
};
