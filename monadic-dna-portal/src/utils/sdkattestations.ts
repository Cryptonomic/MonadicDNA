import { ethers } from "ethers";

// psScanAdd = '0x4665fffdD8b48aDF5bab3621F835C831f0ee36D7'

const {
  SignProtocolClient,
  SpMode,
  EvmChains
} = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

const privateKey = "";
const client = new SignProtocolClient(SpMode.OnChain, {
  // chain: EvmChains.baseSepolia,
  chain: EvmChains.sepolia,
  // account: privateKeyToAccount(privateKey) // optional
});

export async function createNotaryAttestation() {

  const schemaId = '0x8' // 0x4b
  const schemaData = {
    passportId: '',
    fileHash: ''
  }

  const res = await client.createAttestation({
    schemaId,
    data: schemaData,
    indexingValue: schemaData.fileHash.toLowerCase()
  });

  console.log('res33', res)
  return res
}