import { Contract, ethers } from 'ethers';
import { decodeEventLog, numberToHex } from 'viem';

const SignProtocol = require('../lib/abi/SignProtocol.json');

const config = require('../config.json');

export interface IPassportData {
    passportId: string;
    fileHash: string;
    dataHash: string;
    valid: 'yes' | 'no';
}

export async function createAttestation(data: IPassportData) {

  // let schemaData = ethers.AbiCoder.defaultAbiCoder().encode(
  //     ['string', 'string'],
  //     ['passportId', 'fileHash']
  // )

  let schemaData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'string', 'string'],
      [data.passportId, data.fileHash, data.dataHash, data.valid]
  )

  const provider = new ethers.BrowserProvider(window.ethereum)

  const contract = new Contract(config.contractAddress, SignProtocol.abi, provider);

  const JsonRpcSigner = await provider.getSigner();

  const instance = contract.connect(JsonRpcSigner) as Contract;

  const address = JsonRpcSigner.address

  // Send the attestation transaction
  try {
      const tx = await instance[
          'attest((uint64,uint64,uint64,uint64,address,uint64,uint8,bool,bytes[],bytes),string,bytes,bytes)'
      ](
          {
              schemaId: BigInt(config.schemaId), // The final number from our schema's ID.
              linkedAttestationId: 0, // We are not linking an attestation.
              attestTimestamp: 0, // Will be generated for us.
              revokeTimestamp: 0, // Attestation is not revoked.
              attester: address,
              validUntil: 0, // We are not setting an expiry date.
              dataLocation: 0, // We are placing data on-chain.
              revoked: false, // The attestation is not revoked.
              recipients: [config.signer], // The signer's address.
              data: schemaData, // The encoded schema data.
          },
          config.signer.toLowerCase(), // The indexing key.
          '0x', // No delegate signature.
          '0x00' // No extra data.
      );

      const res = await tx.wait(1)

      console.log('success', res);

      const decodedLog: any = decodeEventLog<any, any, any, any>({
          abi: SignProtocol.abi,
          topics: res.logs[0].topics,
          data: res.logs[0].data,
      });

      const attestationId = numberToHex(decodedLog.args.attestationId);
      const txHash = res.hash;

      return {
          attestationId,
          txHash,
          indexingValue: decodedLog.args.indexingKey,
      };
  } catch (err: any) {
      console.log(err?.message ? err.message : err);
  }
}
