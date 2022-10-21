import { Database } from "@/utils/db-definitions";
import { PluginCategories } from "@/utils/enums/categories";
import styled from "@emotion/styled";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ListItem, ListItemContent, Typography } from "@mui/joy";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export type CombinedPluginType =
  Database["public"]["Tables"]["package"]["Row"] & {
    package_details:
      | Array<Database["public"]["Tables"]["package_details"]["Row"]>
      | Database["public"]["Tables"]["package_details"]["Row"];
  };

export function PluginListItem({ plugin }: { plugin: CombinedPluginType }) {
  // This will become defunct once supabase upgrades to postgrest10
  // https://supabase.com/blog/postgrest-v10
  const details = Array.isArray(plugin.package_details)
    ? plugin.package_details[0]
    : plugin.package_details;

  const [liked, setLiked] = useState(false);
  const [userLikedNow, setUserLikedNow] = useState(false);

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
      }
    };

    checkLikeStatus();
  }, []);

  const likePlugin = async () => {
    const userId = user?.id;
    if (!userId) return;
    try {
      const { data, error } = await client
        .from("package_like")
        .insert({ package_id: plugin.package_id, user_id: userId });
      if (error) throw error;
      setLiked(true);
      setUserLikedNow(true);
    } catch (e) {
      console.error(e);
    }
  };

  const unlikePlugin = async () => {
    const userId = user?.id;
    if (!userId) return;
    try {
      const { error } = await client
        .from("package_like")
        .delete()
        .eq("package_id", plugin.package_id)
        .eq("user_id", userId);
      if (!!error) throw error;
      setLiked(false);
      setUserLikedNow(false);
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
              Category: {PluginCategories[plugin.category] || ''} | Keywords:{" "}
              {plugin.keywords.join(", ")}
            </Typography>
          </ListItemLeft>
          <LikeContainer>
            <Button
              variant="plain"
              onClick={() => (liked ? unlikePlugin() : likePlugin())}
            >
              <LikeIcon icon={liked ? faHeart : faHeartOutline} />
              {details.like_count + (userLikedNow ? 1 : 0)}
            </Button>
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

const LikeIcon = styled(FontAwesomeIcon)`
  margin-right: 8px;
`;
