export async function fetchNpmPackage(packageId: string) {
  const npmRes = await fetch(`https://registry.npmjs.com/${packageId}/latest`, {
    method: "GET",
  });
  const packageDetails = await npmRes.json();
  if (typeof packageDetails === "string") {
    throw new Error("Not Found");
  }
  if (
    !packageDetails?.devDependencies?.["@capacitor/core"] &&
    !packageDetails?.peerDependencies?.["@capacitor/core"] &&
    !packageDetails?.dependencies?.["@capacitor/core"]
  ) {
    throw new Error("Not a Capacitor plugin");
  }
  return packageDetails;
}
