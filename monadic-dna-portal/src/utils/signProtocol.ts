import { IMonadicDNAValidDataset, IMonadicDNAVerifiedTrait } from "@/types";
import { ethers } from "ethers";
import { getValue } from ".";
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

    try {
        const tx = await client.createAttestation({
            schemaId: config.validDataschemaId,
            data: schemaData,
            indexingValue: data.passportId,
            recipients: [config.signer], // The signer's address.
        });

        console.log('tx', tx);
        return tx;
    } catch (error) {
        throw error
    }
}

export async function getAllAttestationIds(indexingValue: string) {
    const indexService = new IndexService('testnet');

    try {
        const res = await indexService.queryAttestationList( {
            indexingValue
        });

        const attestationIds: string[] = res.rows
            .filter((row: { schemaId: string }) => row.schemaId === config.verifiedTraitSchemaId)
            .map((row: { id: string }) => row.id);

        console.log(`Attestation IDs for ${indexingValue}: ${attestationIds}`);

        return attestationIds;
    } catch (error) {
        console.error('Error viewing results:', error);
        throw error;
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
          Value: getValue(decodedData[3])
        };

        console.log(`Attestation Result for ${attestationId}: ${results}`);
        return results;
    } catch (error) {
        console.error('Error viewing results:', error);
        throw error;
    }
}
