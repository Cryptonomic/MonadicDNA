"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAttestationById = exports.createAttestation = void 0;
const { SignProtocolClient, SpMode, EvmChains, IndexService } = require('@ethsign/sp-sdk');
const { privateKeyToAccount } = require('viem/accounts');
const config = require('./config.json');
function createAttestation(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const PRIVATE_KEY = config.privateKey; // process.env.PRIVATE_KEY
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
        const tx = yield client.createAttestation({
            schemaId: config.schemaId,
            data: schemaData,
            indexingValue: data.passportId,
            recipients: [config.signer], // The signer's address.
        });
        console.log('tx', tx);
        return tx;
    });
}
exports.createAttestation = createAttestation;
function queryAttestationById(attesstationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const indexService = new IndexService('testnet');
        try {
            const res = yield indexService.queryAttestation(attesstationId);
            console.log(`Attestation Result for ${attesstationId}: ${res}`);
        }
        catch (error) {
            console.error('Error uploading file:', error);
        }
    });
}
exports.queryAttestationById = queryAttestationById;
