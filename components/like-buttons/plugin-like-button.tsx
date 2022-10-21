import { LikeButton } from "@/components/like-buttons/like-button";
import { Database } from "@/utils/db-definitions";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { FC, useEffect, useState } from "react";

type Props = {
  packageId: string;
  likeCount: number;
  likeChanged?: (likeCount: number) => void;
  disabled?: boolean;
};

export const PluginLikeButton: FC<Props> = ({
  likeCount,
  likeChanged,
  disabled,
  packageId,
}) => {
  const [liked, setLiked] = useState<boolean>(false);
  const user = useUser();
  const client = useSupabaseClient<Database>();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const checkLikeStatus = async () => {
      try {
        const { data, error } = await client
          .from("package_like")
          .select()
          .eq("user_id", user?.id)
          .eq("package_id", packageId);

        if (error) {
          throw error;
        }

        setLiked(data.length === 1);
      } catch (e) {
        console.error(e);
      }
    };

    checkLikeStatus();
  }, []);

  const onLike = async () => {
    const userId = user?.id;
    if (!userId) {
      return;
    }

    try {
      const { data, error } = await client
        .from("package_like")
        .insert({ package_id: packageId, user_id: userId });

      if (error) {
        throw error;
      }

      likeChanged?.(likeCount + 1);
      setLiked(true);
    } catch (e) {
      console.error(e);
    }
  };

  const onUnlike = async () => {
    const userId = user?.id;
    if (!userId) {
      return;
    }

    try {
      const { error } = await client
        .from("package_like")
        .delete()
        .eq("package_id", packageId)
        .eq("user_id", userId);

      if (!!error) {
        throw error;
      }

      likeChanged?.(likeCount - 1);
      setLiked(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <LikeButton
      disabled={disabled}
      count={likeCount}
      active={liked}
      onLike={onLike}
      onUnlike={onUnlike}
    />
  );
};
