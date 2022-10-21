import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  SUCCESS,
} from "@/utils/http-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(METHOD_NOT_ALLOWED).send({ error: "Method Not Allowed" });
    return;
  }
  let packageId = req.query?.packageId ?? null;
  if (!packageId || typeof packageId !== "string") {
    res
      .status(BAD_REQUEST)
      .send({ error: "Package ID query param is required" });
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
  res.status(SUCCESS).json(packageDetails);
}
