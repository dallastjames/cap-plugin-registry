import { Database } from "@/utils/db-definitions";
import { ListItem, ListItemContent, Typography } from "@mui/joy";

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

  return (
    <ListItem>
      <ListItemContent>
        <Typography>{plugin.package_id}</Typography>
        <Typography level="body2">
          Category: {plugin.category} | Keywords: {plugin.keywords.join(", ")}
        </Typography>
      </ListItemContent>
    </ListItem>
  );
}
