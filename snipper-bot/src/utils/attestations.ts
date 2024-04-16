import { IMonadicDNAVerifiedTrait } from "@/types";

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

    const tx = await client.createAttestation({
        schemaId: config.schemaId,
        data: schemaData,
        indexingValue: passportId,
        recipients: [config.signer]
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
