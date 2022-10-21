import { List, ListDivider } from "@mui/joy";
import React from "react";
import { CombinedPluginType, PluginListItem } from "./plugin-list-item";

export function PluginList({
  plugins,
  enableLike,
  canEdit,
}: {
  plugins: CombinedPluginType[];
  enableLike?: boolean;
  canEdit?: boolean;
}) {
  return (
    <List size="md" variant="outlined" sx={{ borderRadius: "sm" }}>
      {plugins.map((plugin, idx) => (
        <React.Fragment key={plugin.package_id}>
          <PluginListItem
            plugin={plugin}
            enableLike={enableLike}
            canEdit={canEdit}
          />
          {idx !== plugins.length - 1 ? <ListDivider /> : null}
        </React.Fragment>
      ))}
    </List>
  );
}
