from pdb import set_trace as bp
import asyncio
import py_nillion_client as nillion
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from helpers.nillion_client_helper import create_nillion_client
from helpers.nillion_keypath_helper import getUserKeyFromFile, getNodeKeyFromFile

load_dotenv()

async def main():
    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    userkey = getUserKeyFromFile(os.getenv("NILLION_USERKEY_PATH_PARTY_1"))
    nodekey = getNodeKeyFromFile(os.getenv("NILLION_NODEKEY_PATH_PARTY_1"))
    client = create_nillion_client(userkey, nodekey)

    # Create a 110 KB text file
    file_size = 110 * 1024  # 50 KB
    text = "This is a 110 KB text file. " * (file_size // 27)
    with open("test_file.txt", "w") as f:
        f.write(text)

    # Read the contents of the file
    with open("test_file.txt", "rb") as f:
        secret_value = f.read()

    # Create a SecretBlob
    secret_name = "test_blob"
    secret_integer = nillion.Secrets({
        secret_name: nillion.SecretBlob(bytearray(secret_value)),
    })

    # Store the SecretBlob
    store_id = await client.store_secrets(
        cluster_id, None, secret_integer, None
    )
    print(f"The secret is stored at store_id: {store_id}")

    # Retrieve the SecretBlob
    result_tuple = await client.retrieve_secret(cluster_id, store_id, secret_name)
    print(f"The secret name as a uuid is {result_tuple[0]}")
    decoded_secret_value = result_tuple[1].value.decode('utf-8')
    print(f"The secret value is '{decoded_secret_value}'")

asyncio.run(main())