#!/bin/bash

# This script is an end-to-end test script that explores the usage of the Nillion node
# It assumes Nillion is set up locally and an instance of devnet is running.

set -a
source /Users/vishakh/.config/nillion/nillion-devnet.env  # Change me to your nillion-devnet.env file
set +a

export NODE_KEY_SEED="node_key_seed"
export USER_KEY_SEED="user_key_seed"

printf "\n\nGetting cluster information..\n\n"
nillion \
    -b "$NILLION_BOOTNODE_MULTIADDRESS" \
    --nilchain-private-key "$NILLION_NILCHAIN_PRIVATE_KEY_0" \
    --nilchain-rpc-endpoint "$NILLION_NILCHAIN_JSON_RPC" \
    --node-key-seed $NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
  cluster-information \
  "$NILLION_CLUSTER_ID" \

printf "\n\n Inspecting IDs\n\n"
nillion \
    -b "$NILLION_BOOTNODE_MULTIADDRESS" \
    --nilchain-private-key "$NILLION_NILCHAIN_PRIVATE_KEY_0" \
    --nilchain-rpc-endpoint "$NILLION_NILCHAIN_JSON_RPC" \
    --node-key-seed $NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
  inspect-ids

printf "\n\nStoring a secret..\n\n"
output=$(nillion \
    -b "$NILLION_BOOTNODE_MULTIADDRESS" \
    --nilchain-private-key "$NILLION_NILCHAIN_PRIVATE_KEY_0" \
    --nilchain-rpc-endpoint "$NILLION_NILCHAIN_JSON_RPC" \
    --node-key-seed $NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
    store-values \
    --secret-integer foo=3 \
    --cluster-id "$NILLION_CLUSTER_ID" \
    --ttl-days 365)
echo "$output"
STORE_ID=$(echo "$output" | grep "Store ID:" | awk '{print $NF}')
echo "Extracted Store ID: $STORE_ID"

printf "\n\nRetrieving secret..\n\n"
nillion \
    -b "$NILLION_BOOTNODE_MULTIADDRESS" \
    --nilchain-private-key "$NILLION_NILCHAIN_PRIVATE_KEY_0" \
    --nilchain-rpc-endpoint "$NILLION_NILCHAIN_JSON_RPC" \
    --node-key-seed $NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
    retrieve-value \
    --cluster-id "$NILLION_CLUSTER_ID" \
    --secret-id foo \
    --store-id "$STORE_ID"

printf "\n\nWriting a program to disk\n\n"
rm /tmp/double.py
echo "
from nada_dsl import *

def nada_main():
    party1 = Party(name=\"Party1\")
    a = SecretInteger(Input(name=\"foo\", party=party1))

    result = a + a

    return [Output(result, \"my_output\", party1)]
" | tee /tmp/double.py

printf "\n\nCompiling Nada program..\n\n"
pynadac --target-dir /tmp --generate-mir-json /tmp/double.py

printf "\n\nStoring a program..\n\n"
output=$(nillion \
    -b "$NILLION_BOOTNODE_MULTIADDRESS" \
    --nilchain-private-key "$NILLION_NILCHAIN_PRIVATE_KEY_0" \
    --nilchain-rpc-endpoint "$NILLION_NILCHAIN_JSON_RPC" \
    --node-key-seed $NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
    store-program \
    --cluster-id "$NILLION_CLUSTER_ID" \
    /tmp/double.nada.bin double)
echo "$output"
PROGRAM_ID=$(echo "$output" | grep "Program ID:" | awk '{print $NF}')
echo "Extracted Program ID: $PROGRAM_ID"

printf "\n\nExecuting program..\n\n"
nillion \
    -b "$NILLION_BOOTNODE_MULTIADDRESS" \
    --nilchain-private-key "$NILLION_NILCHAIN_PRIVATE_KEY_0" \
    --nilchain-rpc-endpoint "$NILLION_NILCHAIN_JSON_RPC" \
    --node-key-seed $NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
  compute \
    --cluster-id "$NILLION_CLUSTER_ID" \
    --store-id "$STORE_ID" \
    --result-node-name "my_output" \
  "$PROGRAM_ID"
