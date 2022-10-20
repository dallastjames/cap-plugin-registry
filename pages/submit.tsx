import { SUCCESS } from "@/utils/http-codes";
import styled from "@emotion/styled";
import { Box, Button, Card, CardContent, Input } from "@mui/joy";
import type { NextPage } from "next";
import { useState } from "react";

const Submit: NextPage = () => {
  const [error, setError] = useState("");
  const [packageId, setPackageId] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);

  const tryApi = async () => {
    setError("");
    setPackageInfo(null);
    const params = new URLSearchParams();
    params.append("packageId", packageId);
    const res = await fetch(`/api/npm-package-lookup?${params.toString()}`);
    if (res.status === SUCCESS) {
      setPackageInfo(await res.json());
    } else {
      setError((await res.json()).error ?? "Query Error");
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Input
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="Package Id"
          />
          <Button onClick={() => tryApi()}>Get Package Details</Button>
        </CardContent>
      </Card>
      {error ? <ErrorEl>{error}</ErrorEl> : null}
      <pre>{packageInfo ? JSON.stringify(packageInfo, null, 2) : null}</pre>
    </Box>
  );
};

export default Submit;

export const ErrorEl = styled.p`
  color: maroon;
  font-size: 18px;
  font-weight: bold;
`;
