// src/genome_file_processing.rs

use std::fs::File;
use std::io::{self, BufRead, BufReader};
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;
use rayon::prelude::*;

pub fn process_file(filename: &str, num_lines: usize) -> io::Result<HashMap<u64, u8>> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);
    let lines: Vec<String> = reader.lines().take(num_lines).filter_map(Result::ok).collect();

    let results: HashMap<u64, u8> = lines
        .par_iter()
        .filter(|line| !line.starts_with('#'))
        .filter_map(|line| {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() >= 4 {
                let rsid = parts[0].to_string();
                let genotype = parts[3];

                let encoded_rsid = encode_rsid(&rsid);
                let encoded_genotype = encode_genotype(genotype);

                Some((encoded_rsid, encoded_genotype))
            } else {
                None
            }
        })
        .collect();

    Ok(results)
}

pub fn encode_rsid(rsid: &str) -> u64 { // Made public
    let mut hasher = DefaultHasher::new();
    rsid.trim_start_matches("rs").hash(&mut hasher);
    hasher.finish()
}

pub fn encode_genotype(genotype: &str) -> u8 { // Made public
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
        "NN" => 11,
        "" | "???" => 12,
        _ => 0,
    }
}
