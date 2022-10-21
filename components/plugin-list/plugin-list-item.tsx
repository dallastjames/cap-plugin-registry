import { Database } from "@/utils/db-definitions";
import { PluginCategories } from "@/utils/enums/categories";
import styled from "@emotion/styled";
import { faHeart, faCircleUp } from "@fortawesome/free-solid-svg-icons";
import {
  faHeart as faHeartOutline,
  faCircleUp as faCircleUpOutline,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ListItem, ListItemContent, Typography } from "@mui/joy";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { LikeButton } from "../like-button";

export type CombinedPluginType =
  Database["public"]["Tables"]["package"]["Row"] & {
    package_details:
      | Array<Database["public"]["Tables"]["package_details"]["Row"]>
      | Database["public"]["Tables"]["package_details"]["Row"];
  };

export function PluginListItem({
  plugin,
  enableLike = true,
}: {
  plugin: CombinedPluginType;
  enableLike?: boolean;
}) {
  // This will become defunct once supabase upgrades to postgrest10
  // https://supabase.com/blog/postgrest-v10
  const details = Array.isArray(plugin.package_details)
    ? plugin.package_details[0]
    : plugin.package_details;

  const [liked, setLiked] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

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
  }, []);

  const likePlugin = async () => {
    const userId = user?.id;
    if (!userId || initialLoad) return;
    try {
      const { data, error } = await client
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

  return (
    <ListItem>
      <ListItemContent>
        <ListItemLayout>
          <ListItemLeft>
            <Typography>{plugin.package_id}</Typography>
            <Typography level="body2">
              Category: {PluginCategories[plugin.category] || ""} | Keywords:{" "}
              {plugin.keywords.length > 0 ? plugin.keywords.join(", ") : "None"}
            </Typography>
          </ListItemLeft>
          <LikeContainer>
            <LikeButton
              disabled={!enableLike}
              count={details.like_count + interactionCount}
              active={liked}
              onLike={() => likePlugin()}
              onUnlike={() => unlikePlugin()}
            />
          </LikeContainer>
        </ListItemLayout>
      </ListItemContent>
    </ListItem>
  );
}

const ListItemLayout = styled.div`
  display: flex;
`;

const ListItemLeft = styled.div`
  flex: 1;
`;

const LikeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
