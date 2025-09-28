#!/usr/bin/env python3
import os
import asyncio
import json
import uuid
import time
from tqdm import tqdm
from dotenv import load_dotenv
from datetime import datetime

from nuc.builder import NucTokenBuilder
from nuc.token import Command

from secretvaults.common.keypair import Keypair
from secretvaults.builder import SecretVaultBuilderClient
from secretvaults.user import SecretVaultUserClient
from secretvaults.common.blindfold import BlindfoldFactoryConfig, BlindfoldOperation
from secretvaults.common.nuc_cmd import NucCmd
from secretvaults.common.utils import into_seconds_from_now
from secretvaults.dto.builders import RegisterBuilderRequest
from secretvaults.dto.collections import CreateCollectionRequest
from secretvaults.dto.data import CreateOwnedDataRequest, FindDataRequest
from secretvaults.dto.users import AclDto, RevokeAccessToDataRequest
from secretvaults.dto.common import Name

# Load .env file
load_dotenv()


def check_environment():
    """Check if all required environment variables are present"""
    required_vars = [
        "BUILDER_PRIVATE_KEY",
        "NILCHAIN_URL",
        "NILAUTH_URL",
        "NILDB_NODES",
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n📝 Please copy .env.example to .env and add your private key.")
        return False
    return True


# Configuration
config = {
    "NILCHAIN_URL": os.getenv("NILCHAIN_URL"),
    "NILAUTH_URL": os.getenv("NILAUTH_URL"),
    "NILDB_NODES": os.getenv("NILDB_NODES", "").split(","),
    "BUILDER_PRIVATE_KEY": os.getenv("BUILDER_PRIVATE_KEY"),
}


async def main():
    """Owned data workflow with permission revocation"""
    print("🚀 Starting Owned Data Permission Test")
    print("=" * 60)

    if not check_environment():
        return

    # --- Simulation Parameters ---
    USER_COUNT = 100
    RSID_TO_UPLOAD_AND_QUERY = "rs548049170"

    # --- Key Entity Setup ---
    print("\n1️⃣ Setting up Builder and Users...")
    builder_keypair = Keypair.from_hex(config["BUILDER_PRIVATE_KEY"])
    user_keypairs = [Keypair.generate() for _ in range(USER_COUNT)]
    print(f"✅ Builder DID: {builder_keypair.to_did_string()}")
    print(f"✅ Generated {USER_COUNT} user keypairs.")

    # --- Builder & Collection Setup ---
    async with await SecretVaultBuilderClient.from_options(
        keypair=builder_keypair,
        urls={"chain": [config["NILCHAIN_URL"]], "auth": config["NILAUTH_URL"], "dbs": config["NILDB_NODES"]},
        blindfold=BlindfoldFactoryConfig(operation=BlindfoldOperation.STORE, use_cluster_key=False),
    ) as builder_client:
        await builder_client.refresh_root_token()
        print("\n2️⃣ Builder client created and root token obtained.")

        collection_id = str(uuid.uuid4())
        try:
            with open("load_test_schema.json", "r", encoding="utf-8") as f:
                schema_data = json.load(f)
            create_request = CreateCollectionRequest(
                id=collection_id, type="owned", name="monadic_dna_owned_permission_test", schema=schema_data["schema"]
            )
            await builder_client.create_collection(create_request)
            print(f"✅ Owned collection created with ID: {collection_id}")
        except Exception as e:
            print(f"❌ Failed to create collection: {e}")
            return

        # --- User Upload and Grant Access to Builder ---
        print(f"\n3️⃣ Simulating {USER_COUNT} users uploading one record each and granting access to the builder...")
        last_user_doc_id = None
        last_user_client_for_revoke = None

        for i in tqdm(range(USER_COUNT), desc="User Uploads"):
            user_keypair = user_keypairs[i]
            user_client = None
            try:
                user_client = await SecretVaultUserClient.from_options(
                    keypair=user_keypair,
                    base_urls=config["NILDB_NODES"],
                    blindfold=BlindfoldFactoryConfig(operation=BlindfoldOperation.STORE, use_cluster_key=False),
                )
                delegation_token = (
                    NucTokenBuilder.extending(builder_client.root_token)
                    .command(Command(NucCmd.NIL_DB_DATA_CREATE.value.split(".")))
                    .audience(user_client.id)
                    .expires_at(datetime.fromtimestamp(into_seconds_from_now(60)))
                    .build(builder_client.keypair.private_key())
                )

                record_to_upload = {
                    "_id": str(uuid.uuid4()),
                    "user_id": user_client.id,
                    "profile_name": "primary",
                    "rsid": RSID_TO_UPLOAD_AND_QUERY,
                    "genotype": "AG", # Example genotype
                }

                create_data_request = CreateOwnedDataRequest(
                    collection=collection_id,
                    owner=user_client.id,
                    data=[record_to_upload],
                    acl=AclDto(grantee=builder_client.id, read=True, write=False, execute=False),
                )
                
                create_response = await user_client.create_data(delegation=delegation_token, body=create_data_request)
                
                if i == USER_COUNT - 1:
                    for node_result in create_response.values():
                        if hasattr(node_result, "data") and hasattr(node_result.data, "created") and node_result.data.created:
                            last_user_doc_id = node_result.data.created[0]
                            break
                    # Keep this client alive for the revoke step
                    last_user_client_for_revoke = user_client
            finally:
                # Only close the client if it's NOT the last one
                if user_client and i < USER_COUNT - 1:
                    await user_client.close()

        print("\n✅ All users have uploaded their data.")

        # --- Revoke Access for the Last User ---
        if not last_user_doc_id or not last_user_client_for_revoke:
            print("❌ Could not retrieve document ID or client for the last user. Cannot test revocation.")
            if last_user_client_for_revoke:
                await last_user_client_for_revoke.close()
            return

        print(f"\n4️⃣ Revoking builder's access from the last user's (user {USER_COUNT}) record...")
        try:
            revoke_request = RevokeAccessToDataRequest(
                grantee=builder_client.id,
                collection=collection_id,
                document=last_user_doc_id,
            )
            await last_user_client_for_revoke.revoke_access(revoke_request)
            print(f"✅ Access revoked for builder from user {USER_COUNT}'s record.")
        except Exception as e:
            print(f"❌ Failed to revoke access: {e}")
        finally:
            if last_user_client_for_revoke:
                await last_user_client_for_revoke.close()

        # --- Query as the Builder ---
        print(f"\n5️⃣ Querying for RSID '{RSID_TO_UPLOAD_AND_QUERY}' as the builder...")
        
        try:
            # The builder uses its own client and root token to query
            find_request = FindDataRequest(collection=collection_id, filter={"rsid": RSID_TO_UPLOAD_AND_QUERY})
            find_response = await builder_client.find_data(find_request)

            if find_response:
                num_records = len(find_response)
                print(f"\n✅ Query successful! Found {num_records} records.")
                if num_records == USER_COUNT - 1:
                    print("✅ Correctly found 99 records, confirming the builder's access was successfully revoked by one user.")
                else:
                    print(f"⚠️  Warning: Expected {USER_COUNT - 1} records, but found {num_records}. This may mean the builder's root token bypasses user ACLs.")
            else:
                print("❌ Query executed, but no records were found.")

        except Exception as e:
            print(f"\n❌ An error occurred during the query: {e}")

    print("\n🎉 Owned data permission test finished successfully!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())