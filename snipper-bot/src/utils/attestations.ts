import { ethers } from "ethers";
import { IMonadicDNAVerifiedTrait } from "@/types";
import { createAttestationError, retreiveResultsError } from "@/types/customError";

const {
    SignProtocolClient,
    SpMode,
    EvmChains,
    IndexService
} = require('@ethsign/sp-sdk');

const { privateKeyToAccount } = require('viem/accounts');

const config = require('../config.json');

export async function createAttestation(passportId: string, value: string) {

    const PRIVATE_KEY=config.privateKey;
    const account = privateKeyToAccount(PRIVATE_KEY);

    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains[config.network],
        account
    });

    const schemaData: IMonadicDNAVerifiedTrait = {
        'Passport ID': passportId,
        'Provider': config.provider,
        'Trait': config.trait.name,
        'Value': value,
    }

    try {
        const tx = await client.createAttestation({
            schemaId: config.schemaId,
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


export async function getAttestationId(indexingValue: string) {
    const indexService = new IndexService('testnet');

    try {
        const res = await indexService.queryAttestationList( {
            indexingValue
        });
        console.log('res.rows', res.rows)
        const attestationId =  res.rows[0].id

        console.log(`Attestation ID for ${indexingValue}: ${attestationId}`);

        return attestationId;
    } catch (error) {
        console.error('Error viewing results:', error);
        throw retreiveResultsError; // todo
    }
}

export async function getResultsById(attestationId: string) {
    const indexService = new IndexService('testnet');

    // const id = `${config.networkId}_${attestationId}`
    console.log("attestationId", attestationId)
    // console.log("fullID", id);


    try {
        const res = await indexService.queryAttestation(attestationId);
        const encodedData = res.data
        console.log("res", res)

        let decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
            ['string', 'string', 'string', 'string'],
            encodedData
        );

        console.log("decodedData", decodedData)

        const results: IMonadicDNAVerifiedTrait = {
          "Passport ID": decodedData[0],
          Provider: decodedData[1],
          Trait: decodedData[2],
          Value: decodedData[3]
        };

        console.log(`Attestation Result for ${attestationId}: ${results}`);
        return {
            id: res.id,
            data: results
        };
        // return results;
    } catch (error) {
        console.error('Error viewing results:', error);
        throw retreiveResultsError; // todo
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
