#!/bin/bash

set -a  # Automatically export all variables
source ".env"
set +a  # Stop automatically exporting

# Execute the commands

echo "Storing thrombosis.."

nillion \
    --user-key-path $NILLION_USERKEY_PATH_PARTY_1 \
    --node-key-path $NILLION_NODEKEY_PATH_PARTY_1 \
    -b $NILLION_BOOTNODE_MULTIADDRESS \
    --payments-private-key $NILLION_WALLET_PRIVATE_KEY \
    --payments-chain-id $NILLION_CHAIN_ID \
    --payments-rpc-endpoint $NILLION_BLOCKCHAIN_RPC_ENDPOINT \
    --payments-sc-address $NILLION_PAYMENTS_SC_ADDRESS \
    --blinding-factors-manager-sc-address $NILLION_BLINDING_FACTORS_MANAGER_SC_ADDRESS \
    store-program \
    --cluster-id $NILLION_CLUSTER_ID \
    binaries/thrombosis.nada.bin \
    thrombosis

echo "Storing muscle performance.."

nillion \
    --user-key-path $NILLION_USERKEY_PATH_PARTY_1 \
    --node-key-path $NILLION_NODEKEY_PATH_PARTY_1 \
    -b $NILLION_BOOTNODE_MULTIADDRESS \
    --payments-private-key $NILLION_WALLET_PRIVATE_KEY \
    --payments-chain-id $NILLION_CHAIN_ID \
    --payments-rpc-endpoint $NILLION_BLOCKCHAIN_RPC_ENDPOINT \
    --payments-sc-address $NILLION_PAYMENTS_SC_ADDRESS \
    --blinding-factors-manager-sc-address $NILLION_BLINDING_FACTORS_MANAGER_SC_ADDRESS \
    store-program \
    --cluster-id $NILLION_CLUSTER_ID \
    binaries/muscle-perform.nada.bin \
    muscle-perf