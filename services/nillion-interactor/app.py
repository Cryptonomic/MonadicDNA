from quart import Quart, request, jsonify
from quart_cors import cors
import os
import sys

import random
import string
from uuid import UUID

from dotenv import load_dotenv

from nillion_client import (VmClient, UserId, InputPartyBinding, OutputPartyBinding, SecretInteger, Permissions)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from helpers.nillion_client_helper import create_nillion_client

load_dotenv()

app = Quart(__name__)
app = cors(app, allow_origin="*")

def get_random_node_key():
        # hostname = socket.gethostname()
        # ip_address = socket.gethostbyname(hostname)
        # result = hostname + "_" + ip_address
        chars = string.ascii_letters + string.digits
        result = ''.join(random.choice(chars) for i in range(10))
        print("Node key: ", result)
        return result

_keys = {
    "monadic" : bytes.fromhex(os.getenv("MONADIC_PRIVKEY")),
    "snipperBot" : bytes.fromhex(os.getenv("SNIPPER_BOT_PRIVKEY"))
}
_clients:dict[str, VmClient] = None

_default_client = "monadic"

_program_id = os.getenv("THROMBOSIS_PROGRAM_ID")

async def initialize_client():
    global _clients, _program_id
    if _clients is None:
        _clients = {}
        print("initializing clients")
        for key in _keys :
          _clients[key] = await create_nillion_client(_keys[key])
        print("done initializing clients")
    if _program_id == '' or _program_id is None:
        print("uploading thrombosis program")
        _program_id = await upload_thrombosis_program()
        print("thrombosis program uploaded, id "+_program_id)

async def upload_thrombosis_program():
    program_name = "thrombosis"
    program_mir_path = f"binaries/thrombosis.nada.bin"
    program = open(program_mir_path, "rb").read()
    return await _clients[_default_client].store_program(program_name, program,).invoke()


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
    # Set permissions for the client to compute on the program
    permissions = Permissions.defaults_for_user(_clients[_default_client].user_id).allow_compute(
                _clients[_default_client].user_id, _program_id
            )

    store_ids = {}

    for row in gene_data:
        rsid = row['rsid']
        rsid_int = row['rsid_int']
        genotype_int = row['genotype_int']
        stored_secret = {
            "snp": SecretInteger(rsid_int),
            "genotype": SecretInteger(genotype_int),
        }
        store_id = await _clients[_default_client].store_values(
                values=stored_secret, ttl_days=5, permissions=permissions
            ).invoke()

        store_ids[rsid] = store_id

    return store_ids

async def compute_on_nillion(client_id, store_id):

    party_name = "Party1"

    input_bindings = [InputPartyBinding(party_name, _clients[client_id].user_id)]
    output_bindings = [OutputPartyBinding(party_name, [_clients[client_id].user_id])]

    computation_time_secrets = {}

    # Compute on the secret
    compute_id = await _clients[client_id].compute(
        _program_id,
        input_bindings,
        output_bindings,
        values=computation_time_secrets,
        value_ids=[UUID(f"urn:uuid:{store_id}")]
    ).invoke()

    # Print compute result
    print(f"The computation was sent to the network. compute_id: {compute_id}")
    result = await _clients[client_id].retrieve_compute_results(compute_id).invoke()
    return result['Result'].value

async def fund_user(user_id):
    try:
      uid = UserId.parse(user_id)
    except Exception:
      return "Invalid UserID" 
    try:
        await _clients[_default_client].add_funds(500000, target_user=uid)
    except Exception:
      return "Failed to add funds"

@app.route('/dataset', methods=['PUT'])
async def handle_dataset():
    files = await request.files
    if 'file' not in files :
        return jsonify({'error': 'No file part'}), 400
    file = files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        try:
            filtered_data = read_and_filter_23andme(file)
            results = await store_on_nillion(filtered_data)
            return jsonify(results)
        except Exception as e:
            print(e)
            return jsonify({'error': 'internal error'}), 500
    return jsonify({'error': 'File processing failed'}), 500

@app.route('/computations/thrombosis', methods=['POST'])
async def thrombosis():
    store_id = (await request.json).get('store_id')
    if store_id is None:
        return jsonify({'error': 'Missing store_id'}), 400
    client_id = (await request.json).get('client_id')
    if client_id is None:
        client_id = _default_client
    elif client_id not in _clients:
        return jsonify({'error': 'Invalid client_id'}), 400
    try:
        result = await compute_on_nillion(client_id, store_id)
    except Exception as e:
        print(e)
        return jsonify({'error': 'internal error'}), 500
    return jsonify(result)

@app.route('/fund', methods=['POST'])
async def fund():
    user_id = (await request.json).get('user_id')
    if user_id is None:
        return jsonify({'error': 'Missing user_id'}), 400
    try:
        result = await fund_user(user_id)
        if result.__contains__("Invalid UserID"):
            return jsonify({'error': result}), 400
        elif result.__ne__(""):
            return jsonify({'error': result}), 500
    except Exception as e:
        print(e)
        return jsonify({'error': 'internal error'}), 500
    return jsonify({'message': f"funded {user_id}"})


@app.route('/')
def hello_world():
    return "Hello, world!"

@app.before_serving
async def startup():
    await initialize_client()

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8732)
