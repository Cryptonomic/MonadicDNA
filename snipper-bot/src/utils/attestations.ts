import { IComputedResult, IMonadicDNAVerifiedTrait } from "@/types";
import { createAttestationError } from "@/types/customError";

const {
    SignProtocolClient,
    SpMode,
    EvmChains,
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
