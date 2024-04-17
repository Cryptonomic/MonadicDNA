import asyncio
import py_nillion_client as nillion
import os
import sys
import pytest
import socket
import random
import string
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from helpers.nillion_client_helper import create_nillion_client
from helpers.nillion_keypath_helper import getUserKeyFromFile, getNodeKeyFromFile

load_dotenv()

async def main():
    def get_random_node_key():
        chars = string.ascii_letters + string.digits
        result = ''.join(random.choice(chars) for i in range(10))
        print("Node key: ", result)
        return result

    userkey = getUserKeyFromFile(os.getenv("NILLION_USERKEY_PATH_PARTY_1"))
    nodekey = nillion.NodeKey.from_seed(get_random_node_key())
    client = create_nillion_client(userkey, nodekey)

    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    party_id = client.party_id()
    user_id = client.user_id()
    party_name = "Party1"

    thrombosis_result = await execute_program("thrombosis", client, cluster_id, party_id, party_name, user_id)
    print(f"✅ Thrombosis compute complete. The result is {thrombosis_result}")

    muscle_perform_result = await execute_program("muscle-perform", client, cluster_id, party_id, party_name, user_id)
    print(f"✅ Muscle-perform compute complete. The result is {muscle_perform_result}")

    return thrombosis_result, muscle_perform_result

async def execute_program(program_name, client, cluster_id, party_id, party_name, user_id):
    program_mir_path = f"binaries/{program_name}.nada.bin"
    action_id = await client.store_program(
        cluster_id, program_name, program_mir_path
    )
    program_id = f"{user_id}/{program_name}"
    print('Stored program. action_id:', action_id)
    print('Stored program_id:', program_id)

    stored_secret = nillion.Secrets({
        "snp": nillion.SecretInteger(6),
        "genotype": nillion.SecretInteger(9),
    })
    secret_bindings = nillion.ProgramBindings(program_id)
    secret_bindings.add_input_party(party_name, party_id)
    store_id = await client.store_secrets(
        cluster_id, secret_bindings, stored_secret, None
    )

    compute_bindings = nillion.ProgramBindings(program_id)
    compute_bindings.add_input_party(party_name, party_id)
    compute_bindings.add_output_party(party_name, party_id)
    print(f"Computing using program {program_id}")
    print(f"Use secret store_id: {store_id}")
    computation_time_secrets = nillion.Secrets({})
    compute_id = await client.compute(
        cluster_id, compute_bindings, [store_id], computation_time_secrets, nillion.PublicVariables({})
    )
    print(f"The {program_name} computation was sent to the network. compute_id: {compute_id}")

    while True:
        compute_event = await client.next_compute_event()
        if isinstance(compute_event, nillion.ComputeFinishedEvent):
            if compute_event.uuid == compute_id:
                print(f"✅ {program_name} compute complete for compute_id {compute_event.uuid}")
                return compute_event.result.value

if __name__ == "__main__":
    thrombosis_result, muscle_perform_result = asyncio.run(main())