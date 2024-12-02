import { CHAIN_NAME } from "@/config/constants";
import { useChain } from "@cosmos-kit/react";
import { useState } from "react";

export const useConnection = () => {
  const main = useChain(CHAIN_NAME);

  const [error, setError] = useState<string>("");

  const handleConnect = async () => {
    try {
      await main.connect();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    }
  };

  return {
    ...main,
    handleConnect,
    customError: error,
  };
};
