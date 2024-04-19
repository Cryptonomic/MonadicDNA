import { ethers } from "ethers";
import { IComputedResult, IMonadicDNAVerifiedTrait } from "@/types";
import { createAttestationError, retreiveResultsError } from "@/types/customError";
import { getValue } from ".";

const {
    SignProtocolClient,
    SpMode,
    EvmChains,
    IndexService
} = require('@ethsign/sp-sdk');

const { privateKeyToAccount } = require('viem/accounts');

const config = require('../config.json');

export async function createAttestation(passportId: string, computedResult: IComputedResult) {

    const PRIVATE_KEY=config.privateKey;
    const account = privateKeyToAccount(PRIVATE_KEY);

    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains[config.network],
        account
    });

    const schemaData: IMonadicDNAVerifiedTrait = {
        'Passport ID': passportId,
        'Provider': config.provider,
        'Trait': computedResult.trait,
        'Value': computedResult.value,
    }

    try {
        const tx = await client.createAttestation({
            schemaId: config.verifiedTraitSchemaId,
            data: schemaData,
            indexingValue: passportId,
            recipients: [config.signer]
        });

        console.log('tx', tx);
        return tx;
    } catch (error) {
        console.error('Error Creating Attestation:', error as Error);
        throw createAttestationError;
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

        console.log(`Attestation ID for ${indexingValue}: ${attestationIds}`);

        return attestationIds;
    } catch (error) {
        console.error('Error viewing results:', error);
        throw retreiveResultsError; // todo
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
        return {
            id: res.id,
            data: results
        };
    } catch (error) {
        console.error('Error viewing results:', error);
        throw retreiveResultsError;
    }
}

// export async function queryAttestationById(attestationId: string) {
//     const indexService = new IndexService('testnet');

//     console.log()

//     try {
//         const res = await indexService.queryAttestation(attestationId);

//         console.log(`Attestation Result for ${attestationId}: ${res}`);
//         return res;
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         throw retreiveResultsError;
//     }
// }
