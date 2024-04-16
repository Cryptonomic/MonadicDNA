import express, { Express, Request, Response } from 'express';
const {
    SignProtocolClient,
    SpMode,
    EvmChains,
    IndexService,
    AttestationResult
} = require('@ethsign/sp-sdk');

const {  PrivateKey, privateKeyToAccount } = require('viem/accounts');
import config from './config.json';

interface VerifiedTraitRequest {
  passport_id: string;
  provider: string;
  trait: string;
  value: string;
}

const app: Express = express();
app.use(express.json());

app.post('/sign/VerifiedTrait', async (req: Request, res: Response) => {
  try {
    const { passport_id, provider, trait, value }: VerifiedTraitRequest = req.body;

    const PRIVATE_KEY: typeof PrivateKey = config.privateKey as typeof PrivateKey;
    const account = privateKeyToAccount(PRIVATE_KEY);
    const client = new SignProtocolClient(SpMode.OnChain, {
      chain: EvmChains[config.network],
        account
    });

    const schemaData = {
      "Passport ID": passport_id,
      "Provider": provider,
      "Trait": trait,
      "Value": value,
    };

    const tx = await client.createAttestation({
      schemaId: config.schemaId,
      data: schemaData,
      indexingValue:passport_id,
      recipients: [config.signer], // The signer's address.
  });
  console.log('tx', tx);
  return tx;
    
  } catch (error) {
    console.error('Error creating attestation:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});