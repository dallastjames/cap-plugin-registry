import styled from "@emotion/styled";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Chip,
  ChipDelete,
  ColorPaletteProp,
  IconButton,
  Input,
  Typography,
} from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import { useState } from "react";

export function ChipInput({
  value = [],
  onChange,
  color = "primary",
  disabled = false,
  label = "",
  placeholder = "",
}: {
  value?: string[];
  onChange?: (newValue: string[]) => void;
  color?: ColorPaletteProp;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    const sanitized = `${inputValue}`.toLowerCase().trim();
    if (!sanitized) return;

    const currentValue = Array.isArray(value) ? value : [];

    let newValue = [...currentValue];

    if (sanitized.indexOf(" ") > -1) {
      // many words, split them up and add all of them
      const split = sanitized.split(" ");
      split.forEach((word) => {
        const exists = newValue.find((key) => key === word);
        if (!exists) {
          newValue.push(word);
        }
      });
    } else {
      const exists = newValue.find((key) => key === sanitized);
      if (exists) {
        setInputValue("");
        return;
      }
      newValue = [...newValue, sanitized];
    }

    onChange?.(newValue);
    setInputValue("");
  };

  const removeValue = (key: string) => {
    const currentValue = Array.isArray(value) ? value : [];

    const keyIndex = currentValue.indexOf(key);
    if (keyIndex === -1) return;

    onChange?.([
      ...currentValue.slice(0, keyIndex),
      ...currentValue.slice(keyIndex + 1),
    ]);
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <LabelWrapper>
        <Typography level="body2">{label}</Typography>
        {!disabled && (
          <Button
            size="sm"
            variant="plain"
            onClick={() => clearAll()}
            sx={{ minHeight: "1rem" }}
          >
            Clear
          </Button>
        )}
      </LabelWrapper>
      <ChipContainer>
        {value.map((c) => (
          <Chip
            key={c}
            variant="solid"
            color={color}
            endDecorator={<ChipDelete onClick={() => removeValue(c)} />}
          >
            {c}
          </Chip>
        ))}
      </ChipContainer>
      {!disabled && (
        <FormControl>
          <Input
            value={inputValue}
            placeholder={placeholder}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addValue()}
            sx={{
              paddingRight: "9px",
            }}
            endDecorator={
              <IconButton
                type="button"
                aria-label="search"
                sx={{
                  borderBottomLeftRadius: 0,
                  borderTopLeftRadius: 0,
                  height: "38px",
                }}
                onClick={addValue}
              >
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            }
          />
        </FormControl>
      )}
    </Box>
  );
}

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
