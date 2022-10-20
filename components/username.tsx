import styled from "@emotion/styled";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography, TypographySystem } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { User } from "@supabase/supabase-js";

export function Username({
  userOrName,
  level = "body1",
  sx = {},
}: {
  userOrName?: string | User | null;
  level?: keyof TypographySystem;
  sx?: SxProps;
}) {
  const username =
    userOrName == null
      ? ""
      : typeof userOrName === "string"
      ? userOrName
      : userOrName.user_metadata?.user_name;
  return (
    <Typography level={level} sx={sx}>
      <Icon icon={faGithub} />
      {username ?? ""}
    </Typography>
  );
}

const Icon = styled(FontAwesomeIcon)`
  margin-right: 8px;
`;
