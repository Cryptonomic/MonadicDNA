import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import py_nillion_client as nillion
import sys
import werkzeug

import socket
import random
import string

from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from helpers.nillion_client_helper import create_nillion_client
from helpers.nillion_keypath_helper import getUserKeyFromFile, getNodeKeyFromFile

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_random_node_key():
        # hostname = socket.gethostname()
        # ip_address = socket.gethostbyname(hostname)
        # result = hostname + "_" + ip_address
        chars = string.ascii_letters + string.digits
        result = ''.join(random.choice(chars) for i in range(10))
        print("Node key: ", result)
        return result

_userkey = getUserKeyFromFile(os.getenv("NILLION_USERKEY_PATH_PARTY_1"))
_nodekey = nillion.NodeKey.from_seed(get_random_node_key())
_client = create_nillion_client(_userkey, _nodekey)

def read_and_filter_23andme(file_storage):
    # Define the SNPs of interest and their deterministic integer values
    snps_of_interest = {
        'rs4402960': 1, 'rs7754840': 2, 'rs10811661': 3, 'rs9300039': 4, 'rs8050136': 5,
        'rs1801282': 6, 'rs13266634': 7, 'rs1111875': 8, 'rs7903146': 9, 'rs5219': 10,
        'rs1815739': 11, 'rs6025': 12
    }

    # Genotype to integer mapping
    genotype_to_int = {
        "AA": 0, "AC": 1, "AG": 2, "AT": 3,
        "CC": 4, "CG": 5, "CT": 6,
        "GG": 7, "GT": 8,
        "TT": 9
    }

    results = []
    for line in file_storage:
        line = line.decode('utf-8')
        if line.startswith('#'):
            continue
        parts = line.strip().split('\t')
        if len(parts) < 4:
            continue

        rsid, chromosome, position, genotype = parts

        # Convert rsid to integer if it's one of the desired SNPs
        if rsid in snps_of_interest:
            rsid_int = snps_of_interest[rsid]
            genotype_int = genotype_to_int.get(genotype, -1)  # Use -1 for unrecognized genotypes
            results.append({'rsid': rsid, 'rsid_int': rsid_int, 'genotype_int': genotype_int})

    return results

async def store_on_nillion(gene_data):
    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    party_id = _client.party_id()
    user_id = _client.user_id()
    party_name = "Party1"

    program_name = "thrombosis"
    program_mir_path = f"binaries/thrombosis.nada.bin"
    program_id = f"{user_id}/{program_name}"

    secret_bindings = nillion.ProgramBindings(program_id)
    secret_bindings.add_input_party(party_name, party_id)

    program_name = "muscle-perform"
    program_mir_path = f"binaries/muscle-perform.nada.bin"
    program_id = f"{user_id}/{program_name}"

    secret_bindings = nillion.ProgramBindings(program_id)
    secret_bindings.add_input_party(party_name, party_id)

    store_ids = {}

    for row in gene_data:
        rsid = row['rsid']
        rsid_int = row['rsid_int']
        genotype_int = row['genotype_int']
        stored_secret = nillion.Secrets({
        "snp": nillion.SecretInteger(12),
        "genotype": nillion.SecretInteger(7),
        "snp1": nillion.SecretInteger(11),
        "genotype1": nillion.SecretInteger(9),
         })
        store_id = await _client.store_secrets(
            cluster_id, secret_bindings, stored_secret, None
        )
        store_ids[rsid] = store_id

    return store_ids

async def compute_on_nillion(store_id):
    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    party_id = _client.party_id()
    user_id = _client.user_id()
    party_name = "Party1"
    program_name = "thrombosis"
    program_mir_path = f"binaries/thrombosis.nada.bin"

    program_id = f"{user_id}/{program_name}"

    compute_bindings = nillion.ProgramBindings(program_id)
    compute_bindings.add_input_party(party_name, party_id)
    compute_bindings.add_output_party(party_name, party_id)

    computation_time_secrets = nillion.Secrets({})

    # Compute on the secret
    compute_id = await _client.compute(
        cluster_id,
        compute_bindings,
        [store_id],
        computation_time_secrets,
        nillion.PublicVariables({}),
    )

    # Print compute result
    print(f"The computation was sent to the network. compute_id: {compute_id}")
    while True:
        compute_event = await _client.next_compute_event()
        if isinstance(compute_event, nillion.ComputeFinishedEvent):
            print(f"✅  Compute complete for compute_id {compute_event.uuid}")
            print(f"🖥️  The result is {compute_event.result.value}")
            return compute_event.result.value
 

@app.route('/dataset', methods=['PUT'])
async def handle_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filtered_data = read_and_filter_23andme(file)
        results = await asyncio.wait_for(store_on_nillion(filtered_data), timeout=120)
        return jsonify(results)
    return jsonify({'error': 'File processing failed'}), 500

@app.route('/computations/thrombosis', methods=['POST'])
async def thrombosis():
    store_id = request.json.get('store_id')
    if store_id is None:
        return jsonify({'error': 'Missing store_id'}), 400

    result = await asyncio.wait_for(compute_on_nillion(store_id), timeout=120)
    return jsonify(result)

@app.route('/computations/muscle-performance', methods=['POST'])
async def muscle_perform():
    store_id = request.json.get('store_id')
    if store_id is None:
        return jsonify({'error': 'Missing store_id'}), 400

    result = await asyncio.wait_for(compute_on_nillion(store_id), timeout=120)
    return jsonify(result)

@app.route('/')
def hello_world():
    return "Hello, world!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8732)
