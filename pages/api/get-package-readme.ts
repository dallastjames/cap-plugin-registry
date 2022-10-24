import { fetchNpmPackage } from "@/utils/fetch-npm-package";
import {
  BAD_REQUEST,
  CREATED,
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "@/utils/http-codes";
import { NextApiRequest, NextApiResponse } from "next";
import * as tar from "tar";
import * as fs from "fs";
import * as https from "https";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/db-definitions";

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

  const version = packageDetails?.version;
  if (!version) {
    res.status(BAD_REQUEST).send({ error: "Unable to locate package version" });
    return;
  }
  const tarballURL = packageDetails?.dist?.tarball;
  if (!tarballURL) {
    res.status(BAD_REQUEST).send({ error: "Unable to locate package tarball" });
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !supabaseKey) {
    res
      .status(SERVER_ERROR)
      .send({ error: "Invalid environment configuration" });
    return;
  }

  const client = new SupabaseClient<Database>(supabaseUrl, supabaseKey);

  // Check current supabase version
  try {
    const { data, error: readError } = await client
      .from("package_readme")
      .select()
      .eq("package_id", packageId)
      .eq("package_version", version);
    if (readError) throw readError;
    if (data.length === 1) {
      // If we have the current version cached already, just return it
      res.status(SUCCESS).send({ readmeContents: data[0].readme });
      return;
    }
  } catch (e) {
    res
      .status(SERVER_ERROR)
      .send({ error: "Unable to read from database cache" });
    return;
  }

  const tarDest = "/tmp/package.tgz";
  const unpackedDest = "/tmp";
  // Save tar to file system
  try {
    await saveTarball(tarballURL, tarDest);
  } catch (e) {
    res.status(SERVER_ERROR).send({
      error: "Unable to save package tarball",
      explain: e,
      tarballURL,
    });
    return;
  }

  // Unzip tar to file system
  try {
    await tar.x({ C: unpackedDest, f: tarDest });
  } catch (e) {
    res
      .status(SERVER_ERROR)
      .send({ error: "Unable to unpack tarball", explain: e });
    return;
  }

  // Look for readme at package root
  let readmeContents = "";
  try {
    const readmeFileName = await findReadme(`${unpackedDest}/package`);
    const fileBuffer = fs.readFileSync(
      `${unpackedDest}/package/${readmeFileName}`
    );
    readmeContents = fileBuffer.toString();
  } catch (e) {
    res
      .status(SERVER_ERROR)
      .send({ error: "Unable to get readme contents", explain: e });
    return;
  }

  // Save readme+version pair to database
  // Remove old readme and update with new contents
  try {
    const { error: removeError } = await client
      .from("package_readme")
      .delete()
      .eq("package_id", packageId);
    if (removeError) throw removeError;
    const { error: insertError } = await client.from("package_readme").insert({
      package_id: packageId,
      package_version: version,
      readme: readmeContents,
    });
    if (insertError) throw insertError;
  } catch (e) {
    res
      .status(SERVER_ERROR)
      .send({ error: "Unable to save new readme contents", explain: e });
    return;
  }

  res.status(CREATED).send({ readmeContents });
}

async function saveTarball(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https
      .get(url, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", function (err) {
        // Handle errors
        fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
        reject(err.message);
      });
  });
}

async function findReadme(unpackedDest: string): Promise<string> {
  const allFiles = await readDir(unpackedDest);
  let matchedIndex = -1;
  const searchPattern = new RegExp("readme.md", "i");
  allFiles.forEach((file, idx) => {
    if (searchPattern.test(file)) {
      matchedIndex = idx;
    }
  });
  if (matchedIndex === -1) throw new Error("No readme file found");
  return allFiles[matchedIndex];
}

async function readDir(unpackedDest: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(unpackedDest, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}
