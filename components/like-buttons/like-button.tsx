import styled from "@emotion/styled";
import { faCircleUp as faCircleUpOutline } from "@fortawesome/free-regular-svg-icons";
import { faCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Typography } from "@mui/joy";

export function LikeButton({
  count,
  active = false,
  disabled = false,
  onLike,
  onUnlike,
  label,
}: {
  count?: number;
  active?: boolean;
  disabled?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
  label?: string;
}) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();

    if (active) {
      onUnlike?.();
    } else {
      onLike?.();
    }
  };

  return (
    <Button
      variant="plain"
      disabled={disabled}
      onClick={(e) => handleClick(e as unknown as MouseEvent)}
      sx={{
        fontFamily: "SF Mono",
      }}
    >
      <Typography level="body1" color="primary" sx={{ marginRight: "6px" }}>
        {label}
      </Typography>
      <LikeIcon icon={active ? faCircleUp : faCircleUpOutline} />
      {count}
    </Button>
  );
}

const LikeIcon = styled(FontAwesomeIcon)`
  margin-right: 8px;
  font-size: 20px;
  width: 20px;
`;
