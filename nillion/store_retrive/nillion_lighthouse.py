import argparse
import asyncio
import py_nillion_client as nillion
import os
import sys
from dotenv import load_dotenv
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from helpers.nillion_client_helper import create_nillion_client
from helpers.nillion_keypath_helper import getUserKeyFromFile, getNodeKeyFromFile

load_dotenv()



async def fetch_file_from_filecoin(cid):
    """
    Fetch the file data from Filecoin using the given CID.
    """
    url = f"https://gateway.lighthouse.storage/ipfs/{cid}"
    response = requests.get(url)
    response.raise_for_status()
    print(response)
    return response.content

async def store_file_in_nillion(file_data, cluster_id, userkey, nodekey):
    """
    Store the given file data in Nillion.
    """
    client = create_nillion_client(userkey, nodekey)
    secret_name = "filecoin_file"
    secret_blob = nillion.SecretBlob(bytearray(file_data))
    secret_array = nillion.Secrets({secret_name: secret_blob})

    store_id = await client.store_secrets(cluster_id, None, secret_array, None)
    print(f"File stored in Nillion with Store ID: {store_id}")
    return store_id

async def retrieve_file_from_nillion(cluster_id, store_id, secret_name, userkey, nodekey):
    """
    Retrieve the file data from Nillion.
    """
    client = create_nillion_client(userkey, nodekey)
    result_tuple = await client.retrieve_secret(cluster_id, store_id, secret_name)
    file_data = bytes(result_tuple[1].value)
    return file_data

async def main():
    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    userkey = getUserKeyFromFile(os.getenv("NILLION_USERKEY_PATH_PARTY_1"))
    nodekey = getNodeKeyFromFile(os.getenv("NILLION_NODEKEY_PATH_PARTY_1"))

    # Fetch the file from Filecoin
    filecoin_cid = "QmSZ4VhxrbjWWCrHrxkRGE9zuAEHfW64vYhzf7i4b8QxcD"  # Replace with your actual Filecoin CID
    file_data = await fetch_file_from_filecoin(filecoin_cid)

    # Store the file in Nillion
    store_id = await store_file_in_nillion(file_data, cluster_id, userkey, nodekey)

    # Retrieve the file from Nillion
    secret_name = "filecoin_file"
    retrieved_file_data = await retrieve_file_from_nillion(cluster_id, store_id, secret_name, userkey, nodekey)
    print("File retrieved from Nillion:", retrieved_file_data)

asyncio.run(main())