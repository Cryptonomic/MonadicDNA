import { IMonadicDNAValidDataset } from "@/types";

const {
    SignProtocolClient,
    SpMode,
    EvmChains,
    IndexService
} = require('@ethsign/sp-sdk');

const { privateKeyToAccount } = require('viem/accounts');

const config = require('../config.json');

export async function createAttestation(data: IMonadicDNAValidDataset) {

    const PRIVATE_KEY=config.privateKey; // process.env.PRIVATE_KEY
    const account = privateKeyToAccount(PRIVATE_KEY);

    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains[config.network],
        account
    });

    const schemaData = {
        "Passport ID": data.passportId,
        "File Name Hash": data.fileHash,
        "Data Hash": data.dataHash,
        "Valid": data.valid,
    };

    const tx = await client.createAttestation({
        schemaId: config.schemaId,
        data: schemaData,
        indexingValue: data.passportId,
        recipients: [config.signer], // The signer's address.
    });

    console.log('tx', tx);
    return tx;
}

export async function queryAttestationById(attesstationId: string) {
    const indexService = new IndexService('testnet');
    try {
        const res = await indexService.queryAttestation(attesstationId);

        console.log(`Attestation Result for ${attesstationId}: ${res}`);
        return res;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}
