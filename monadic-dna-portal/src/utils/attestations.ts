const {
  SignProtocolClient,
  SpMode,
  EvmChains
} = require('@ethsign/sp-sdk');

const { privateKeyToAccount } = require('viem/accounts');

const config = require('../config.json');

export interface IPassportData {
    passportId: string;
    fileHash: string;
    dataHash: string;
    valid: boolean;
}

const PRIVATE_KEY=config.privateKey; // process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY);

const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains[config.network],
    account
});

export async function createAttestation(data: IPassportData) {

    const schemaData = {
        "Passport ID": data.passportId,
        "File Name Hash": data.fileHash,
        "Data Hash": data.dataHash,
        "Valid": data.valid,
    };

    const tx = await client.createAttestation({
        schemaId: config.schemaId,
        data: schemaData,
        indexingValue: account.address.toLowerCase(),
        recipients: [config.signer], // The signer's address.
    });

    console.log('tx', tx);
    return tx;
}
