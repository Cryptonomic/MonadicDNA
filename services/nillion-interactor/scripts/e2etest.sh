set -a
source /Users/vishakh/.config/nillion/nillion-devnet.env
set +a

export NODE_KEY_SEED="node_key_seed"
export USER_KEY_SEED="user_key_seed"

echo "Storing secret.."
nillion \
    -b $NILLION_BOOTNODE_MULTIADDRESS \
    --nilchain-rpc-endpoint NILLION_NILCHAIN_JSON_RPC \
    --node-key-seed NODE_KEY_SEED \
    --user-key-seed $USER_KEY_SEED \
    store-values \
    --secret-integer foo=3 \
    --cluster-id $NILLION_CLUSTER_ID \
    --ttl-days 365
    #--nilchain-private-key $NILLION_NILCHAIN_PRIVATE_KEY_0= \
