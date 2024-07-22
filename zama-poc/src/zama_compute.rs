// src/zama_compute.rs

use tfhe::{ConfigBuilder, generate_keys, set_server_key, CompressedFheUint8, FheUint8, ClientKey};
use tfhe::prelude::*;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use rayon::prelude::*;
use std::io::Error;
use std::result;

use crate::genome_file_processing::{encode_rsid, encode_genotype, process_file}; // Import the required functions

pub fn run_iteration(filename: &str, num_lines: usize) -> result::Result<(), Error> {
    let config = ConfigBuilder::default().build();
    let (client_key, server_key) = generate_keys(config);
    set_server_key(server_key);

    let processed_data = process_file(filename, num_lines)?;

    let encrypted_genotypes = encrypt_genotypes_for_zama(&processed_data, client_key.clone())?;

    let lookup_result1 = check_genotype(&encrypted_genotypes, "rs75333668", "CC", client_key.clone())?;
    println!("Lookup result: {:?}", lookup_result1);

    let lookup_result2 = check_genotype(&encrypted_genotypes, "rs75333668", "AA", client_key.clone())?;
    println!("Lookup result: {:?}", lookup_result2);

    let genotype_frequencies = get_genotype_frequencies(&encrypted_genotypes, client_key.clone());
    println!("Genotype frequencies: {:?}", genotype_frequencies);

    Ok(())
}

fn get_genotype_frequencies(
    encrypted_genotypes: &HashMap<u64, CompressedFheUint8>,
    client_key: ClientKey
) -> HashMap<u64, u64> {
    let genotype_frequencies = Arc::new(Mutex::new(HashMap::new()));

    let items: Vec<(u64, &CompressedFheUint8)> = encrypted_genotypes
        .iter()
        .map(|(&key, value)| (key, value))
        .collect();

    items.into_par_iter().for_each(|(encoded_rsid, encrypted_genotype)| {
        let decompressed_encrypted_genotype = encrypted_genotype.decompress();
        let decrypted_genotype = decompressed_encrypted_genotype.decrypt(&client_key);

        let mut genotype_frequencies = genotype_frequencies.lock().unwrap();
        let count = genotype_frequencies.entry(decrypted_genotype).or_insert(0);
        *count += 1;
    });

    Arc::try_unwrap(genotype_frequencies).unwrap().into_inner().unwrap()
}

fn check_genotype(encrypted_genotypes: &HashMap<u64, CompressedFheUint8>,
                  rsid: &str,
                  genotype: &str,
                  client_key: ClientKey
) -> result::Result<bool, Error> {
    let encoded_rsid = encode_rsid(rsid);
    let encoded_genotype = encode_genotype(genotype);

    let encrypted_genotype = encrypted_genotypes.get(&encoded_rsid).unwrap();
    let decompressed_encrypted_genotype = encrypted_genotype.decompress();

    let encrypted_target = FheUint8::try_encrypt(encoded_genotype, &client_key).unwrap();

    Ok(decompressed_encrypted_genotype.eq(encrypted_target).decrypt(&client_key))
}

fn encrypt_genotypes_for_zama(processed_data: &HashMap<u64, u8>, client_key: ClientKey) -> result::Result<HashMap<u64, CompressedFheUint8>, Error> {
    let enc_data: HashMap<u64, CompressedFheUint8> = processed_data
        .par_iter()
        .map(|(&encoded_rsid, &encoded_genotype)| {
            let genotype_encrypted = CompressedFheUint8::try_encrypt(encoded_genotype, &client_key).unwrap();
            (encoded_rsid, genotype_encrypted)
        })
        .collect();

    Ok(enc_data)
}
