use json_core::Outputs;
use methods::{GUEST_CODE_FOR_ZK_PROOF_ELF, GUEST_CODE_FOR_ZK_PROOF_ID};
use risc0_zkvm::Prover;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::io::Write;
use risc0_zkvm::serde::from_slice;

fn main() {
    let file_path = "genome.txt";

    // Read the text file
    let mut genotype_data = Vec::new();
    if let Ok(file) = File::open(file_path) {
        let reader = BufReader::new(file);
        for line in reader.lines() {
            if let Ok(line) = line {
                if line.starts_with('#') {
                    continue; // Skip comment lines
                }
                let parts: Vec<&str> = line.split('\t').collect();
                if parts.len() < 4 {
                    continue; // Skip lines with incomplete data
                }
                let rsid = parts[0].to_string();
                let rsid_int = parts[2].parse().unwrap_or(0);
                let genotype = parts[3];
                let genotype_int = match genotype {
                    "AA" => 0,
                    "AC" => 1,
                    "AG" => 2,
                    "AT" => 3,
                    "CC" => 4,
                    "CG" => 5,
                    "CT" => 6,
                    "GG" => 7,
                    "GT" => 8,
                    "TT" => 9,
                    _ => -1, // Default value for unrecognized genotypes
                };
                genotype_data.push((rsid, rsid_int, genotype_int));
            }
        }
    } else {
        eprintln!("Failed to open file: {}", file_path);
        return;
    }

    

    // Make the prover
    let mut prover = Prover::new(GUEST_CODE_FOR_ZK_PROOF_ELF, GUEST_CODE_FOR_ZK_PROOF_ID)
        .expect("Prover should be constructed from matching method code & ID");

        let mut data = Vec::new();
        for (rsid, rsid_int, genotype_int) in &genotype_data {
            data.write_all(rsid.as_bytes()).expect("Failed to write rsid to buffer");
            data.write_all(b"\t").expect("Failed to write tab to buffer");
            data.write_all(rsid_int.to_string().as_bytes()).expect("Failed to write rsid_int to buffer");
            data.write_all(b"\t").expect("Failed to write tab to buffer");
            data.write_all(genotype_int.to_string().as_bytes()).expect("Failed to write genotype_int to buffer");
            data.write_all(b"\n").expect("Failed to write newline to buffer");
        }

// Add the byte vector as input to the prover object
    prover.add_input_u8_slice(&data);   
    // Run prover & generate receipt
    let receipt = prover.run().expect("Code should be provable");

    // Verify receipt
    receipt.verify(GUEST_CODE_FOR_ZK_PROOF_ID).expect("Proven code should verify");

    // Print confirmation message

    let journal = &receipt.journal;
    let outputs: Outputs = from_slice(&journal).expect("Journal should contain an Outputs object");


println!("risk score: {}",outputs.data);

    println!("\nThe text file has been processed.\n");
}
