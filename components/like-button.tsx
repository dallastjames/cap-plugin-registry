import { faCircleUp } from "@fortawesome/free-solid-svg-icons";
import { faCircleUp as faCircleUpOutline } from "@fortawesome/free-regular-svg-icons";
import { Button } from "@mui/joy";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function LikeButton({
  count,
  active = false,
  disabled = false,
  onLike,
  onUnlike,
}: {
  count?: number;
  active?: boolean;
  disabled?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
}) {
  return (
    <Button
      variant="plain"
      disabled={disabled}
      onClick={() => (active ? onUnlike?.() : onLike?.())}
      sx={{
        fontFamily: "SF Mono",
      }}
    >
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
