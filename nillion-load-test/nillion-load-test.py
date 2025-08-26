#!/usr/bin/env python3
"""
Standard data SecretVault Builder Example

This script demonstrates the standard data workflow for creating a SecretVault builder,
registering it, creating collections, and managing data with blindfold encryption.
"""

import os
import asyncio
import json
import uuid
from dotenv import load_dotenv

from secretvaults.common.keypair import Keypair
from secretvaults.builder import SecretVaultBuilderClient
from secretvaults.common.blindfold import BlindfoldFactoryConfig, BlindfoldOperation
from secretvaults.dto.builders import RegisterBuilderRequest
from secretvaults.dto.collections import CreateCollectionRequest
from secretvaults.dto.data import (
    CreateStandardDataRequest,
    FindDataRequest,
)
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

    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n📝 Please copy .env.example to .env and add your private key:")
        print("   cp .env.example .env")
        print("\nThen edit .env with your configuration values.")
        return False

    return True


# Configuration
config = {
    "NILCHAIN_URL": os.getenv("NILCHAIN_URL"),
    "NILAUTH_URL": os.getenv("NILAUTH_URL"),
    "NILDB_NODES": os.getenv("NILDB_NODES", "").split(","),
    "BUILDER_PRIVATE_KEY": os.getenv("BUILDER_PRIVATE_KEY"),
}


async def main():  # pylint: disable=too-many-locals,too-many-branches,too-many-statements,too-many-nested-blocks
    """Standard data SecretVault builder workflow example"""
    print("🚀 Starting SecretVault Builder Standard Data Example")
    print("=" * 60)

    # Check environment variables first
    if not check_environment():
        return

    # Step 1: Create keypair from private key
    print("\n1️⃣ Creating keypair...")
    keypair = Keypair.from_hex(config["BUILDER_PRIVATE_KEY"])
    print(f"✅ Keypair created for DID: {keypair.to_did_string()}")

    # Step 2: Prepare URLs for the builder client
    print("\n2️⃣ Preparing client configuration...")
    urls = {
        "chain": [config["NILCHAIN_URL"]],
        "auth": config["NILAUTH_URL"],
        "dbs": config["NILDB_NODES"],
    }
    print(f"✅ Configured {len(urls['dbs'])} database nodes")

    # Step 3: Create SecretVaultBuilderClient with blindfold encryption
    print("\n3️⃣ Creating SecretVaultBuilderClient with blindfold encryption...")
    async with await SecretVaultBuilderClient.from_options(
            keypair=keypair,
            urls=urls,
            blindfold=BlindfoldFactoryConfig(
                operation=BlindfoldOperation.STORE,
                use_cluster_key=True,
            ),
    ) as builder_client:

        # Step 4: Initialize with root token
        print("\n4️⃣ Refreshing root token...")
        await builder_client.refresh_root_token()
        # root_token = builder_client.root_token  # Unused variable
        print("✅ Root token obtained")

        # Step 5: Check subscription status
        print("\n5️⃣ Checking subscription status...")
        try:
            subscription_status = await builder_client.subscription_status()
            if subscription_status.subscribed:
                print("✅ Subscription is ACTIVE")
            else:
                print("❌ Subscription is INACTIVE")
        except Exception as e:  # pylint: disable=broad-exception-caught
            print(f"⚠️  Could not check subscription status: {e}")

        # # Step 6: Register builder
        # print("\n6️⃣ Registering builder...")
        # try:
        #     register_request = RegisterBuilderRequest(
        #         did=builder_client.keypair.to_did_string(), name=Name("monadicdna-load-test")
        #     )
        #     register_response = await builder_client.register(register_request)
        #
        #     # Check if the response contains errors (any non-201 status codes)
        #     if hasattr(register_response, "root"):
        #         has_errors = False
        #         for node_id, response in register_response.root.items():  # pylint: disable=unused-variable
        #             if hasattr(response, "status") and response.status != 201:
        #                 has_errors = True
        #                 break
        #
        #         if has_errors:
        #             print("ℹ️  Builder appears to already be registered.")
        #             print("   This is normal if the builder was previously registered.")
        #         else:
        #             print("✅ Builder registered successfully!")
        #     else:
        #         print("✅ Builder registered successfully!")
        #
        # except Exception as e:  # pylint: disable=broad-exception-caught
        #     print(f"ℹ️  Builder appears to already be registered: {e}")

        # Step 7: Read builder profile
        print("\n7️⃣ Reading builder profile...")
        try:
            profile = await builder_client.read_profile()
            if hasattr(profile, "data") and profile.data:
                profile_data = profile.data
            else:
                profile_data = profile

            print(f"✅ Profile loaded - ID: {getattr(profile_data, 'id', 'Unknown')}")
            print(f"   Collections: {len(getattr(profile_data, 'collections', []))}")
            print(f"   Queries: {len(getattr(profile_data, 'queries', []))}")
        except Exception as e:  # pylint: disable=broad-exception-caught
            print(f"❌ Failed to read profile: {e}")

        # Step 8: Create collection
        print("\n8️⃣ Creating collection...")
        collection_id = '18cfe6e2-e64d-4f07-976c-b872fa71172f' #str(uuid.uuid4())

        # # Load the standard collection schema
        # try:
        #     with open("load_test_schema.json", "r", encoding="utf-8") as f:
        #         schema_data = json.load(f)
        #
        #     create_request = CreateCollectionRequest(
        #         id=collection_id,
        #         type=schema_data["type"],
        #         name="monadic-dna_load_test",
        #         schema=schema_data["schema"],
        #     )
        #
        #     await builder_client.create_collection(create_request)
        #     print(f"✅ Collection created with ID: {collection_id}")
        #
        # except Exception as e:  # pylint: disable=broad-exception-caught
        #     print(f"❌ Failed to create collection: {e}")
        #     return

        # Step 9: Create standard data
        print("\n9️⃣ Creating standard data...")
        try:
            genetic_data = []
            file_path = "../services/nillion-interactor/testdata/hu278AF5_20210124151934.txt"

            with open(file_path, 'r') as file:
                lines = file.readlines()

            # Skip the header line and process the data
            for line in lines[1:100000]:
                line = line.strip()
                if line and not line.startswith('#'):
                    parts = line.split('\t')
                    if len(parts) >= 4:  # rsid, chromosome, position, genotype
                        rsid = parts[0]
                        genotype = parts[3]
                        genetic_data.append({
                            "_id": str(uuid.uuid4()),
                            "user_id": "1",
                            "profile_name": "primary",
                            "rsid": rsid,
                            "genotype": genotype,
                        })

            print("Num records of genetic data:", len(genetic_data))

            create_data_request = CreateStandardDataRequest(collection=collection_id, data=genetic_data)

            await builder_client.create_standard_data(create_data_request)
            print(f"✅ Created {len(genetic_data)} data records")

        except Exception as e:  # pylint: disable=broad-exception-caught
            print(f"❌ Failed to create data: {str(e)[:500]}")
            return

        # Step 10: Find and display the created data
        print("\n🔟 Finding created data...")
        if False:
            try:
                find_request = FindDataRequest(collection=collection_id, filter={})
                find_response = await builder_client.find_data(find_request)

                # Display find response nicely
                if find_response:
                    data_records = find_response
                    print(f"\n📋 Found {len(data_records)} data records:")
                    print("=" * 60)

                    for i, record in enumerate(data_records, 1):
                        print(f"\n{i}. Data Record:")

                        # Handle both dict and object records
                        if isinstance(record, dict):
                            # For dictionary records, iterate through all key-value pairs
                            for key, value in record.items():
                                print(f"   📋 {key}: {value}")
                        else:
                            # For object records, get all attributes
                            for attr_name in dir(record):
                                # Skip private attributes and methods
                                if not attr_name.startswith("_") or attr_name == "_id":
                                    try:
                                        value = getattr(record, attr_name)
                                        if not callable(value):  # Skip methods
                                            print(f"   📋 {attr_name}: {value}")
                                    except Exception:  # pylint: disable=broad-exception-caught
                                        pass  # Skip attributes that can't be accessed

                        print("-" * 40)  # pylint: disable=too-many-nested-blocks

                    print(f"\n✅ Successfully found {len(data_records)} data records")
                else:
                    print("❌ No data records found")

            except Exception as e:  # pylint: disable=broad-exception-caught
                print(f"❌ Failed to find data: {e}")

            print("\n🎉 Standard data example finished successfully!")
            print("=" * 60)



if __name__ == "__main__":
    asyncio.run(main())
