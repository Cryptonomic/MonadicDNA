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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { SignProtocolClient, SpMode, EvmChains, IndexService, AttestationResult } = require('@ethsign/sp-sdk');
const { PrivateKey, privateKeyToAccount } = require('viem/accounts');
const config_json_1 = __importDefault(require("./config.json"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/sign/VerifiedTrait', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { passport_id, provider, trait, value } = req.body;
        const PRIVATE_KEY = config_json_1.default.privateKey;
        const account = privateKeyToAccount(PRIVATE_KEY);
        const client = new SignProtocolClient(SpMode.OnChain, {
            chain: EvmChains[config_json_1.default.network],
            account
        });
        const schemaData = {
            "Passport ID": passport_id,
            "Provider": provider,
            "Trait": trait,
            "Value": value,
        };
        const tx = yield client.createAttestation({
            schemaId: config_json_1.default.schemaId,
            data: schemaData,
            indexingValue: passport_id,
            recipients: [config_json_1.default.signer], // The signer's address.
        });
        console.log('tx', tx);
        return tx;
        res.json({ attestationId: tx.transactionHash });
    }
    catch (error) {
        console.error('Error creating attestation:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
}));
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
