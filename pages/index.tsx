import { SUCCESS } from "@/utils/http-codes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Input,
  Link,
  Sheet,
  TextField,
  Typography,
} from "@mui/joy";
import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [packageId, setPackageId] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);

  const tryApi = async () => {
    const params = new URLSearchParams();
    params.append("packageId", packageId);
    const res = await fetch(`/api/npm-package-lookup?${params.toString()}`);
    if (res.status === SUCCESS) {
      setPackageInfo(await res.json());
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
      <pre>{packageInfo ? JSON.stringify(packageInfo, null, 2) : null}</pre>
    </Box>
  );
};

export default Home;
