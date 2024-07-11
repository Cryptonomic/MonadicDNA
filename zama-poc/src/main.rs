use tfhe::{ConfigBuilder, generate_keys, set_server_key, FheUint8, ClientKey};
use tfhe::prelude::*;
use std::fs::File;
use std::io::{self, BufRead, BufReader, Error};
use std::result;
use std::collections::HashMap;
use std::time::Instant;
use log::{info};
use env_logger::{Builder, Env};

fn main() {
    Builder::from_env(Env::default().default_filter_or("info"))
        .format(|buf, record| {
            use std::io::Write;
            writeln!(buf, "{} [{}] - {}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S"), record.level(), record.args())
        })
        .init();

    info!("Hello, Zama!");

    let filename = "/Users/vishakh/dev/MonadicDNA/zama-poc/GFGFilteredUnphasedGenotypes23andMe.txt";
    let num_lines = 5;

    let start = Instant::now();
    run_iteration(filename, num_lines).expect("Well, that didn't work!");
    let duration = start.elapsed();
    info!("run_iteration took: {:?}", duration);

    info!("Bye, Zama!");
}

fn run_iteration(filename: &str, num_lines: usize) -> result::Result<(), Error>{
    info!("Setting up Zama env");
    let config = ConfigBuilder::default().build();
    let (client_key, server_key) = generate_keys(config);
    set_server_key(server_key);

    info!("Number of lines to process: {:?}", num_lines);

    let processed_data = process_file(filename, num_lines)?;
    info!("Lines of processed data: {:?}", processed_data.len());

    let encrypted_genotypes = encrypt_genotypes_for_zama(processed_data, client_key)?;
    info!("Lines of encrypted data: {:?}", encrypted_genotypes.len());

    return Ok(());
}

fn encrypt_genotypes_for_zama(processed_data: HashMap<u8, u8>, client_key: ClientKey) -> result::Result<HashMap<u8, FheUint8>, Error> {
    let mut enc_data = HashMap::new();

    for (encoded_rsid, encoded_genotype) in processed_data {
        let genotype_encrypted = FheUint8::try_encrypt(encoded_genotype, &client_key).unwrap();
        enc_data.insert(encoded_rsid, genotype_encrypted);
    }

    Ok(enc_data)
}

fn process_file(filename: &str, num_lines: usize) -> io::Result<HashMap<u8, u8>> {
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
                    break;
                }
            }
        }
    }

    Ok(results)
}

fn encode_rsid(rsid: &str) -> u8 {
    rsid.trim_start_matches("rs").parse::<u8>().unwrap_or(0)
}

fn encode_genotype(genotype: &str) -> u8 {
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
