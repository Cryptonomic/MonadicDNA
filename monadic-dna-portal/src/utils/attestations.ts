import { Contract, ethers } from 'ethers';

const ISPABI = require('../lib/abi.json')

export async function createNotaryAttestation2() {
  // let address = "0x4b"; // Alice's address. Will need Alice's account to send the tx.
  let schemaData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "string"],
    ['passportId', 'fileHash']
  )
  console.log('schemaData', schemaData)

  const provider = new ethers.BrowserProvider(window.ethereum)

  const contract = new Contract('0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5', ISPABI.abi, provider);

  const JsonRpcSigner = await provider.getSigner();

  const instance = contract.connect(JsonRpcSigner) as Contract;

  // Send the attestation transaction
  try {
    await instance[
      "attest((uint64,uint64,uint64,uint64,address,uint64,uint8,bool,bytes[],bytes),string,bytes,bytes)"
    ](
      {
        schemaId: BigInt("0x8"), // The final number from our schema's ID.
        linkedAttestationId: 0, // We are not linking an attestation.
        attestTimestamp: 0, // Will be generated for us.
        revokeTimestamp: 0, // Attestation is not revoked.
        attester: '0x2207fDD917051B7c8b44F7b5AA00cEfe2ef6B1B9', // Alice's address.
        validUntil: 0, // We are not setting an expiry date.
        dataLocation: 0, // We are placing data on-chain.
        revoked: false, // The attestation is not revoked.
        recipients: ['0xDf233a7EA1386b2F97e9F7d7e528170dd459D1AB'], // Bob is our recipient.
        data: schemaData, // The encoded schema data.
      },
      "0xDf233a7EA1386b2F97e9F7d7e528170dd459D1AB".toLowerCase(), // Bob's lowercase address will be our indexing key.
      "0x", // No delegate signature.
      "0x00" // No extra data.
    )
      .then(
        async (tx: any) =>
          await tx.wait(1).then((res: any) => {
            console.log("success", res);
            // You can find the attestation's ID using the following path:
            // res.events[0].args.attestationId
          })
      )
      .catch((err: any) => {
        console.log(err?.message ? err.message : err);
      });
  } catch (err: any) {
    console.log(err?.message ? err.message : err);
  }
}