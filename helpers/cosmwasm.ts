"use client";
import {
  CosmWasmClient,
  //SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";

const RPC_ENDPOINT = "https://rpc.juno.strange.love"; // Replace with your preferred RPC

export async function getCosmWasmClient() {
  return await CosmWasmClient.connect(RPC_ENDPOINT);
}

export interface ContractQuery {
  contractAddress: string;
  query: Record<string, unknown>;
}

export async function queryContract({ contractAddress, query }: ContractQuery) {
  const client = await getCosmWasmClient();
  try {
    const result = await client.queryContractSmart(contractAddress, query);
    return result;
  } catch (error) {
    console.error("Error querying contract:", error);
    throw error;
  }
}

