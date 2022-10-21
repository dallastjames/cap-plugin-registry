import { Database } from "@/utils/db-definitions";
import { PluginCategories } from "@/utils/enums/categories";
import {
  BAD_REQUEST,
  CREATED,
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "@/utils/http-codes";
import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { SupabaseClient } from "@supabase/supabase-js";

export default withApiAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  scopedSupabase: SupabaseClient<Database>
) {
  if (req.method !== "POST") {
    res.status(METHOD_NOT_ALLOWED).send({ error: "Method Not Allowed" });
    return;
  }

  let packageId: string = req.body.packageId;
  let keywords: string[] = (req.body.keywords ?? "").split(",");
  let category: keyof typeof PluginCategories = req.body.category;
  let name = req.body.name;

  // Validate PackageId
  if (!packageId || typeof packageId !== "string") {
    res.status(BAD_REQUEST).send({ error: "Package ID param is required" });
    return;
  }

  // Validate user-supplied keywords
  if (!keywords || !Array.isArray(keywords)) {
    keywords = [];
  }
  keywords = keywords
    .filter((key) => typeof key === "string")
    .map((key) => key.toLowerCase().trim());

  // Validate name
  if (!name || typeof name !== "string") {
    name = packageId;
  }

  // Validate category
  if (!category || typeof PluginCategories[category] !== "string") {
    res.status(BAD_REQUEST).send({ error: "Category param is required" });
    return;
  }

  packageId = packageId.toLowerCase().trim();
  const npmRes = await fetch(`https://registry.npmjs.com/${packageId}/latest`, {
    method: "GET",
  });
  const packageDetails = await npmRes.json();
  if (typeof packageDetails === "string") {
    res.status(NOT_FOUND).send({ error: "Package Not Found" });
    return;
  }
  if (
    !packageDetails?.devDependencies?.["@capacitor/core"] &&
    !packageDetails?.peerDependencies?.["@capacitor/core"] &&
    !packageDetails?.dependencies?.["@capacitor/core"]
  ) {
    res.status(BAD_REQUEST).send({ error: "Not a Capacitor Plugin" });
    return;
  }

  const firstTrim = packageId.startsWith("@") ? packageId.slice(1) : packageId;
  const firstSplit = firstTrim.split("/");
  const systemKeywords = firstSplit.reduce<string[]>((acc, next) => {
    if (next.indexOf("-") > -1) {
      return [...acc, next, ...next.split("-")];
    }
    return [...acc, next];
  }, []);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !supabaseKey) {
    res
      .status(SERVER_ERROR)
      .send({ error: "Invalid environment configuration" });
    return;
  }

  const { error, data } = await scopedSupabase.auth.getUser();
  if (error || !data) {
    res.status(UNAUTHORIZED).send({ error: "Unauthorized" });
    return;
  }

  const client = new SupabaseClient<Database>(supabaseUrl, supabaseKey);

  const { error: insertError } = await client.from("package").insert({
    package_id: packageId,
    user_id: data.user.id,
    keywords,
    sys_keywords: systemKeywords,
    category,
    name,
  });

  if (insertError) {
    res.status(SERVER_ERROR).send({ error: insertError.message });
    return;
  }

  res.status(CREATED).json({ packageId });
});
