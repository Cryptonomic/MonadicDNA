use std::hash::{DefaultHasher, Hash, Hasher};
use std::io;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};
use log::info;

pub fn process_file(filename: &str, num_lines: usize) -> io::Result<HashMap<u64, u8>> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);
    let mut results = HashMap::new();

    for line in reader.lines().filter_map(|line| line.ok()) {
        if !line.starts_with('#') {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() >= 4 {
                let rsid = parts[0].to_string();
                let genotype = parts[3];

                let encoded_rsid = encode_rsid(&rsid);
                let encoded_genotype = encode_genotype(genotype);

                // Insert into HashMap
                results.insert(encoded_rsid, encoded_genotype);
                if results.len() == num_lines {
                    info!("Reached the limit of lines to process: {:?}", num_lines);
                    break;
                }
            }
        }
    }

    Ok(results)
}

pub fn encode_rsid(rsid: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    rsid.trim_start_matches("rs").hash(&mut hasher);
    return hasher.finish();
}

pub fn encode_genotype(genotype: &str) -> u8 {
    match genotype {
        "AA" => 1,
        "AC" | "CA" => 2,
        "AG" | "GA" => 3,
        "AT" | "TA" => 4,
        "CC" => 5,
        "CG" | "GC" => 6,
        "CT" | "TC" => 7,
        "GG" => 8,
        "GT" | "TG" => 9,
        "TT" => 10,
        // Optionally handle degenerate cases or mixed calls, often seen in some genetic data
        "NN" => 11,  // 'N' often represents an unknown or not determined base
        // Handle cases where genotype is not provided or is erroneous
        "" | "???" => 12,  // This can be expanded based on the data set's specifics
        _ => 0,  // For any other unexpected or incomplete genotypes
    }
}
