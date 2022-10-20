import { extendTheme, LinkProps } from "@mui/joy";
import Link, { LinkProps as nLinkProps } from "next/link";
import React from "react";

// eslint-disable-next-line react/display-name
const LinkBehavior = React.forwardRef<
  any,
  Omit<nLinkProps, "to"> & { href: nLinkProps["href"], replace?: boolean }
>((props, ref) => {
  const { href, ...other } = props;
  if (href?.toString().startsWith("http")) {
    return <a ref={ref} href={href.toString()} {...(other as any)} />;
  }

  // Map href (MUI) -> to Next JS router
  return (
    <Link href={href} {...other}>
      <a ref={ref} {...other} />
    </Link>
  );
});

export const siteTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          "50": "#e3edff",
          "100": "#b9d3ff",
          "200": "#8bb5ff",
          "300": "#5d97ff",
          "400": "#3a81ff",
          "500": "#176bff",
          "600": "#1463ff",
          "700": "#1158ff",
          "800": "#0d4eff",
          "900": "#073cff",
        },
        text: {
          primary: "#2d4665",
          secondary: "#222D3A",
        },
        danger: {
          "50": "#fce3e5",
          "100": "#f6babe",
          "200": "#f18c93",
          "300": "#eb5d68",
          "400": "#e63b47",
          "500": "#e21827",
          "600": "#df1523",
          "700": "#da111d",
          "800": "#d60e17",
          "900": "#cf080e",
        },
      },
    },
  },
  fontFamily: {
    display: "Inter, var(--joy-fontFamily-fallback)",
    code: "SF Mono, var(--joy-fontFamily-fallback)",
    body: "Inter, var(--joy-fontFamily-fallback)",
  },
  components: {
    JoyLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
  },
});

export enum SiteColors {
  TEXT = "#2d4665",
  TEXT_EMPHASIS = "#001a3a",
  TEXT_SUBDUED = "#556170",
  TEXT_DISABLED = "#98a2ad",
  LABEL = "#222d3a",
  LABEL_SUBDUED = "#556170",
  HEADING = "#03060b",
  OVERLINE = "#677483",
  LINK = "#176bff",
  ERROR = "#e21827",
}
