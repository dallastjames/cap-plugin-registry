import { Database } from "@/utils/db-definitions";
import { PluginCategories } from "@/utils/enums/categories";
import styled from "@emotion/styled";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  FormLabel,
  IconButton,
  Input,
  Link,
  ListItem,
  ListItemContent,
  Modal,
  ModalClose,
  ModalDialog,
  Select,
  Sheet,
  Stack,
  TextField,
  Typography,
  Option,
  Alert,
} from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { ChipInput } from "../chip-input";
import { LikeButton } from "../like-buttons/like-button";

export type CombinedPluginType =
  Database["public"]["Tables"]["package"]["Row"] & {
    package_details:
      | Array<Database["public"]["Tables"]["package_details"]["Row"]>
      | Database["public"]["Tables"]["package_details"]["Row"];
  };

export function PluginListItem({
  plugin,
  enableLike = true,
  canEdit = false,
}: {
  plugin: CombinedPluginType;
  enableLike?: boolean;
  canEdit?: boolean;
}) {
  // This will become defunct once supabase upgrades to postgrest10
  // https://supabase.com/blog/postgrest-v10
  const details = Array.isArray(plugin.package_details)
    ? plugin.package_details[0]
    : plugin.package_details;

  const [liked, setLiked] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<
    keyof typeof PluginCategories
  >(plugin.category);
  const [keywordsValue, setKeywordsValue] = useState<string[]>(plugin.keywords);
  const [nameValue, setNameValue] = useState(plugin.name);
  const [updateError, setUpdateError] = useState("");

  const user = useUser();
  const client = useSupabaseClient<Database>();

  useEffect(() => {
    if (!user?.id) return;
    const checkLikeStatus = async () => {
      try {
        const { data, error } = await client
          .from("package_like")
          .select()
          .eq("user_id", user?.id)
          .eq("package_id", plugin.package_id);
        if (error) throw error;
        setLiked(data.length === 1);
      } catch (e) {
        console.error(e);
      } finally {
        setInitialLoad(false);
      }
    };

    checkLikeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const likePlugin = async () => {
    const userId = user?.id;
    if (!userId || initialLoad) return;
    try {
      const { error } = await client
        .from("package_like")
        .insert({ package_id: plugin.package_id, user_id: userId });
      if (error) throw error;
      setLiked(true);
      setInteractionCount(interactionCount + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const unlikePlugin = async () => {
    const userId = user?.id;
    if (!userId || initialLoad) return;
    try {
      const { error } = await client
        .from("package_like")
        .delete()
        .eq("package_id", plugin.package_id)
        .eq("user_id", userId);
      if (!!error) throw error;
      setLiked(false);
      setInteractionCount(interactionCount - 1);
    } catch (e) {
      console.error(e);
    }
  };

  const updatePlugin = async () => {
    setUpdateError("");
    try {
      if (nameValue.trim() === "") {
        setUpdateError("Name cannot be empty!");
        return;
      }
      const { error } = await client
        .from("package")
        .update({
          name: nameValue,
          category: categoryValue,
          keywords: keywordsValue,
        })
        .eq("package_id", plugin.package_id);
      if (error) throw error;
      setEditModalOpen(false);
    } catch (e: any) {
      console.error(e);
      const errorMessage = (e.error_description || e.message) as string;
      setUpdateError(errorMessage);
    }
  };

  return (
    <ListItem>
      <ListItemContent>
        <ListItemLink
          href={`/view?id=${encodeURIComponent(plugin.package_id)}`}
        >
          <ListItemLayout>
            <ListItemLeft>
              <Horizontal>
                <Typography level="h5">{nameValue}</Typography>
                {nameValue !== plugin.package_id ? (
                  <Typography
                    sx={{ marginLeft: "6px" }}
                  >{` | ${plugin.package_id}`}</Typography>
                ) : null}
              </Horizontal>
              <Typography level="body2">
                Category: {PluginCategories[categoryValue] || ""} | Keywords:{" "}
                {keywordsValue.length > 0 ? keywordsValue.join(", ") : "None"}
              </Typography>
            </ListItemLeft>
            <CenteredContainer>
              <LikeButton
                disabled={!enableLike}
                count={details.like_count + interactionCount}
                active={liked}
                onLike={() => likePlugin()}
                onUnlike={() => unlikePlugin()}
              />
            </CenteredContainer>
            {canEdit ? (
              <CenteredContainer>
                <IconButton
                  variant="plain"
                  onClick={(e) => {
                    e.preventDefault();
                    setUpdateError("");
                    setEditModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </IconButton>
              </CenteredContainer>
            ) : null}
          </ListItemLayout>
        </ListItemLink>
      </ListItemContent>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <ModalDialog
          aria-labelledby="basic-modal-dialog-title"
          aria-describedby="basic-modal-dialog-description"
          sx={{
            maxWidth: 500,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <ModalClose color="neutral">Close</ModalClose>
          <Typography level="h5" sx={{ margin: "20px auto 0" }}>
            Plugin Details
          </Typography>
          <FormControl sx={{ marginBottom: "12px" }}>
            <FormLabel>Plugin Name</FormLabel>
            <Input
              placeholder={plugin.package_id}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ marginBottom: "12px" }}>
            <FormLabel>Category</FormLabel>
            <Select
              defaultValue={plugin.category}
              placeholder="Select Category"
              onChange={(e, newValue) => setCategoryValue(newValue as any)}
            >
              {Object.keys(PluginCategories)
                .sort()
                .map((key) => (
                  <Option key={key} value={key}>
                    {PluginCategories[key as keyof typeof PluginCategories]}
                  </Option>
                ))}
            </Select>
          </FormControl>
          <ChipInput
            label="Keywords"
            placeholder="Add Keyword"
            value={keywordsValue}
            onChange={(e) => setKeywordsValue(e)}
          />

          {updateError && (
            <Alert color="danger" sx={{ margin: "12px auto 0" }}>
              {updateError}
            </Alert>
          )}
          <CenteredContainer>
            <Button
              variant="solid"
              sx={{
                marginTop: "20px",
              }}
              onClick={() => updatePlugin()}
            >
              Save Changes
            </Button>
          </CenteredContainer>
        </ModalDialog>
      </Modal>
    </ListItem>
  );
}

const Horizontal = styled.div`
  display: flex;
  align-items: center;
`;

const ListItemLink = styled(Link)`
  display: flex;
  flex: 1;

  &:hover {
    text-decoration: none;
  }
`;

const ListItemLayout = styled.div`
  display: flex;
  flex: 1;
`;

const ListItemLeft = styled.div`
  flex: 1;
`;

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
