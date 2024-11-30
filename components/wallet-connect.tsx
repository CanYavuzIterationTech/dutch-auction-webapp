"use client";
import { useChain } from "@cosmos-kit/react";
import { useState } from "react";

export function WalletConnect() {
  const chainName = "mantrachaintestnet2"; // or your preferred chain
  const {
    connect,
    disconnect,
    address,
    // wallet,
    status,
    // getSigningCosmWasmClient,
  } = useChain(chainName);

  const [error, setError] = useState<string>("");

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {status === "Connected" && address ? (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm">Connected: {address}</p>
          <button
            onClick={() => disconnect()}
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm h-10 px-4"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-10 px-4"
        >
          Connect Wallet
        </button>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
