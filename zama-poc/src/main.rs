use tfhe::{ConfigBuilder, generate_keys, set_server_key};
use tfhe::prelude::*;
use std::fs::File;
use std::io::{self, BufRead, BufReader};

fn main() {
    println!("Hello, Zama!");

    let filename = "/Users/vishakh/dev/MonadicDNA/zama-poc/GFGFilteredUnphasedGenotypes23andMe.txt";
    let num_lines = 500;
    match process_file(filename, num_lines) {
        Ok(encoded_values) => {
            println!("Encoded rsid and genotypes: {:?}", encoded_values);
        },
        Err(e) => {
            println!("Error processing file: {}", e);
        }
    }

    println!("Bye, Zama!");
}

fn process_file(filename: &str, num_lines: usize) -> io::Result<Vec<(u64, u64, u64, u64)>> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);
    let mut results = Vec::new();

    for line in reader.lines().filter_map(|line| line.ok()) {
        if !line.starts_with('#') {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() >= 4 {
                let rsid = parts[0];
                let chromosome = parts[1].parse::<u64>().unwrap_or(0);
                let position = parts[2].parse::<u64>().unwrap_or(0);
                let genotype = parts[3];

                // Encode rsid and genotype
                let encoded_rsid = encode_rsid(rsid);
                let encoded_genotype = encode_genotype(genotype);

                // Store encodings as a tuple
                results.push((encoded_rsid, chromosome, position, encoded_genotype));
                if results.len() == num_lines {
                    break;
                }
            }
        }
    }

    Ok(results)
}

fn encode_rsid(rsid: &str) -> u64 {
    rsid.trim_start_matches("rs").parse::<u64>().unwrap_or(0)
}

fn encode_genotype(genotype: &str) -> u64 {
    match genotype {
        "AA" => 1,
        "AC" => 2,
        "AG" => 3,
        "AT" => 4,
        "CC" => 5,
        "CG" => 6,
        "CT" => 7,
        "GG" => 8,
        "GT" => 9,
        "TT" => 10,
        _ => 0,  // For unexpected or incomplete genotypes
    }
}
