import { IMonadicDNAValidDataset, IMonadicDNAVerifiedTrait } from "@/types";
import { ethers } from "ethers";
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

export async function getAttestationId(indexingValue: string) {
    const indexService = new IndexService('testnet');

    try {
        const res = await indexService.queryAttestationList( {
            indexingValue
        });
        const attestationId =  res.rows[0].id

        console.log(`Attestation ID for ${indexingValue}: ${attestationId}`);

        return attestationId;
    } catch (error) {
        console.error('Error viewing results:', error);
    }
}

export async function getResultsById(attestationId: string) {
    const indexService = new IndexService('testnet');

    try {
        const res = await indexService.queryAttestation(attestationId);
        const encodedData = res.data

        let decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
            ['string', 'string', 'string', 'string'],
            encodedData
        );

        const results: IMonadicDNAVerifiedTrait = {
          "Passport ID": decodedData[0],
          Provider: decodedData[1],
          Trait: decodedData[2],
          Value: decodedData[3]
        };

        console.log(`Attestation Result for ${attestationId}: ${results}`);
        return results;
    } catch (error) {
        console.error('Error viewing results:', error);
    }
}
