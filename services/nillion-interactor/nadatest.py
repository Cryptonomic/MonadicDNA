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

    program_name = "thrombosis"
    program_mir_path = f"binaries/thrombosis.nada.bin"

    # Store program
    action_id = await client.store_program(
        cluster_id, program_name, program_mir_path
    )
    program_id = f"{user_id}/{program_name}"
    print('Stored program. action_id:', action_id)
    print('Stored program_id:', program_id)

    # Create secrets
    thrombosis_secret = nillion.Secrets({
        "snp": nillion.SecretInteger(12),
        "genotype": nillion.SecretInteger(7),
    })

    secret_bindings = nillion.ProgramBindings(program_id)
    secret_bindings.add_input_party(party_name, party_id)

    # Store secrets
    thrombosis_store_id = await client.store_secrets(
        cluster_id, secret_bindings, thrombosis_secret, None
    )

    # Bind parties for computation
    compute_bindings = nillion.ProgramBindings(program_id)
    compute_bindings.add_input_party(party_name, party_id)
    compute_bindings.add_output_party(party_name, party_id)

    print(f"Computing using program {program_id}")
    print(f"Use secret store_id: {thrombosis_store_id}")

    computation_time_secrets = nillion.Secrets({})

    # Compute on the secret
    compute_id = await client.compute(
        cluster_id,
        compute_bindings,
        [thrombosis_store_id],
        computation_time_secrets,
        nillion.PublicVariables({}),
    )

    # Print compute result
    print(f"The computation was sent to the network. compute_id: {compute_id}")

    while True:
        compute_event = await client.next_compute_event()
        if isinstance(compute_event, nillion.ComputeFinishedEvent):
            if compute_event.uuid == compute_id:
                print(f"✅ Compute complete for compute_id {compute_event.uuid}")
                print(f"🖥️ The result is {compute_event.result.value}")
                thrombosis_result = compute_event.result.value
                break

    # Muscle-perform program
    program_name = "muscle-perform"
    program_mir_path = f"binaries/muscle-perform.nada.bin"

    # Store program
    action_id = await client.store_program(
        cluster_id, program_name, program_mir_path
    )
    program_id = f"{user_id}/{program_name}"
    print('Stored program. action_id:', action_id)
    print('Stored program_id:', program_id)

    # Create secrets
    muscle_perform_secret = nillion.Secrets({
        "snp": nillion.SecretInteger(11),
        "genotype": nillion.SecretInteger(9),
    })

    secret_bindings = nillion.ProgramBindings(program_id)
    secret_bindings.add_input_party(party_name, party_id)

    # Store secrets
    muscle_perform_store_id = await client.store_secrets(
        cluster_id, secret_bindings, muscle_perform_secret, None
    )

    # Bind parties for computation
    compute_bindings = nillion.ProgramBindings(program_id)
    compute_bindings.add_input_party(party_name, party_id)
    compute_bindings.add_output_party(party_name, party_id)

    print(f"Computing using program {program_id}")
    print(f"Use secret store_id: {muscle_perform_store_id}")

    computation_time_secrets = nillion.Secrets({})

    # Compute on the secret
    compute_id = await client.compute(
        cluster_id,
        compute_bindings,
        [muscle_perform_store_id],
        computation_time_secrets,
        nillion.PublicVariables({}),
    )

    # Print compute result
    print(f"The computation was sent to the network. compute_id: {compute_id}")

    while True:
        compute_event = await client.next_compute_event()
        if isinstance(compute_event, nillion.ComputeFinishedEvent):
            if compute_event.uuid == compute_id:
                print(f"✅ Compute complete for compute_id {compute_event.uuid}")
                print(f"🖥️ The result is {compute_event.result.value}")
                muscle_perform_result = compute_event.result.value
                break

    return thrombosis_result, muscle_perform_result

if __name__ == "__main__":
    asyncio.run(main())