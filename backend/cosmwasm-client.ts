import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const getBackendCosmWasmClient = async () => {
  try {
    return await CosmWasmClient.connect("https://rpc.dukong.mantrachain.io");
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
