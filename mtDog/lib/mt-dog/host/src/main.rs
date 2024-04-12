use std::fs::File;
use std::io::prelude::*;
use serde::{Deserialize, Serialize};
use risc0_zkvm::serde::{from_slice, to_vec};
use risc0_zkvm::Prover;
use methods::{GUEST_CODE_FOR_ZK_PROOF_ELF, GUEST_CODE_FOR_ZK_PROOF_ID};
use json_core::Outputs;

#[derive(Debug, Serialize, Deserialize)]
struct GenomeData {
    // Define your data structure here, matching the fields in your JSON file
    rsid: String,
    chromosome: String,
    position: String,
    genotype: String,
}

fn main() {
    let mut file =
        File::open("res/genome_data.json").expect("Genome data file should be accessible");
    let mut data = String::new();
    file.read_to_string(&mut data)
        .expect("Should not have I/O errors");

    // Make the prover.
    let mut prover = Prover::new(GUEST_CODE_FOR_ZK_PROOF_ELF, GUEST_CODE_FOR_ZK_PROOF_ID)
        .expect("Prover should be constructed from matching method code & ID");

    prover.add_input_u32_slice(&to_vec(&data).expect("should be serializable"));

    // Run prover & generate receipt
    let receipt = prover.run().expect("Code should be provable");

    receipt
        .verify(GUEST_CODE_FOR_ZK_PROOF_ID)
        .expect("Proven code should verify");

    let journal = &receipt.journal;
    let outputs: Outputs = from_slice(&journal).expect("Journal should contain an Outputs object");

    println!("\nThe JSON file with hash\n  {}\nprovably contains a field 'RSID' with value {}\n", outputs.hash, outputs.data);
}
