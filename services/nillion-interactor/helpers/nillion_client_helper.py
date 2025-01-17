import os
from nillion_client import (Network, NilChainPrivateKey, NilChainPayer, PrivateKey, VmClient)

async def create_nillion_client(priv_key):
    network = Network(
        chain_grpc_endpoint=os.getenv("NILLION_BLOCKCHAIN_RPC_ENDPOINT"),
        chain_id=os.getenv("NILLION_CHAIN_ID"),
        nilvm_grpc_endpoint=os.getenv("NILLION_BOOTNODE_MULTIADDRESS"),  
        )
    wallet_private_key=NilChainPrivateKey(priv_key)
    payer = NilChainPayer(
    network,
    wallet_private_key=wallet_private_key,
    gas_limit=10000000,
    )
    return  await VmClient.create(PrivateKey(priv_key), network, payer)