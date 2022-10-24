import { fetchNpmPackage } from "@/utils/fetch-npm-package";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  SERVER_ERROR,
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
  let packageDetails;
  try {
    packageDetails = await fetchNpmPackage(packageId);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Not Found") {
        res.status(NOT_FOUND).send({ error: "Package Not Found" });
        return;
      }
      if (e.message === "Not a Capacitor plugin") {
        res.status(BAD_REQUEST).send({ error: "Not a Capacitor plugin" });
        return;
      }

      res.status(SERVER_ERROR).send({ error: "Internal Server Error" });
      return;
    }
  }
  res.status(SUCCESS).json(packageDetails);
}
