from flask import Flask, request, jsonify
import werkzeug

app = Flask(__name__)

def read_and_filter_23andme(file_storage):
    # Define the SNPs of interest and their deterministic integer values
    snps_of_interest = {
        'rs4402960': 1, 'rs7754840': 2, 'rs10811661': 3, 'rs9300039': 4, 'rs8050136': 5,
        'rs1801282': 6, 'rs13266634': 7, 'rs1111875': 8, 'rs7903146': 9, 'rs5219': 10
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
            results.append({'rsid_int': rsid_int, 'genotype_int': genotype_int})
    
    return results


@app.route('/dataset', methods=['PUT'])
def handle_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        results = read_and_filter_23andme(file)
        return jsonify(results)
    return jsonify({'error': 'File processing failed'}), 500

@app.route('/')
def hello_world():
    return "Hello, world!"

if __name__ == '__main__':
    app.run(debug=True)
