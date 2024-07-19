use std::collections::HashMap;
use tfhe::{ClientKey, CompressedFheUint8, ConfigBuilder, FheUint8, generate_keys, set_server_key};
use std::result;
use std::io::Error;
use tfhe::prelude::{FheDecrypt, FheEq, FheTryEncrypt};
use log::info;
use crate::genome_file_processing;

// Iterate through encrypted_genotypes and get the frequency of each genotype
pub fn get_genotype_frequencies(encrypted_genotypes: &HashMap<&u64, CompressedFheUint8>,
    client_key: ClientKey
    )
    -> HashMap<u64, u64> {
    let mut genotype_frequencies = HashMap::new();

    for (_encoded_rsid, encrypted_genotype) in encrypted_genotypes {
        let decompressed_encrypted_genotype = encrypted_genotype.decompress();
        let decrypted_genotype = decompressed_encrypted_genotype.decrypt(&client_key);

        let count = genotype_frequencies.entry(decrypted_genotype).or_insert(0);
        *count += 1;
    }

    genotype_frequencies
}

pub fn check_genotype(encrypted_genotypes: &HashMap<&u64, CompressedFheUint8>,
                      rsid: &str,
                      genotype: &str,
                      client_key: ClientKey
    ) -> result::Result<bool, Error> {
    let encoded_rsid = genome_file_processing::encode_rsid(rsid);
    let encoded_genotype = genome_file_processing::encode_genotype(genotype);

    let encrypted_genotype = encrypted_genotypes.get(&encoded_rsid).unwrap();
    let decompressed_encrypted_genotype = encrypted_genotype.decompress();

    let encrypted_target = FheUint8::try_encrypt(encoded_genotype, &client_key).unwrap();

    Ok(decompressed_encrypted_genotype.eq(encrypted_target).decrypt(&client_key))
}

pub fn encrypt_genotypes_for_zama(processed_data: &HashMap<u64, u8>, client_key: ClientKey) -> result::Result<HashMap<&u64, CompressedFheUint8>, Error> {
    let mut enc_data = HashMap::new();

    for (encoded_rsid, encoded_genotype) in processed_data {
        let genotype_encrypted = CompressedFheUint8::try_encrypt(*encoded_genotype, &client_key).unwrap();
        enc_data.insert(encoded_rsid, genotype_encrypted);
    }

    Ok(enc_data)
}

pub fn run_iteration(filename: &str, num_lines: usize) -> result::Result<(), Error>{
    info!("Setting up Zama env");
    let config = ConfigBuilder::default().build();
    let (client_key, server_key) = generate_keys(config);
    set_server_key(server_key);

    info!("Number of lines to process: {:?}", num_lines);

    let processed_data = genome_file_processing::process_file(filename, num_lines)?;
    info!("Lines of processed data: {:?}", processed_data.len());
    //println!("{:?}", processed_data.);

    let encrypted_genotypes = encrypt_genotypes_for_zama(&processed_data, client_key.clone())?;
    info!("Lines of encrypted data: {:?}", encrypted_genotypes.len());

    let lookup_result1 = check_genotype(&encrypted_genotypes, "rs75333668", "CC", client_key.clone())?;
    info!("Lookup result: {:?}", lookup_result1);

    let lookup_result2 = check_genotype(&encrypted_genotypes, "rs75333668", "AA", client_key.clone())?;
    info!("Lookup result: {:?}", lookup_result2);

    let genotype_frequencies = get_genotype_frequencies(&encrypted_genotypes, client_key.clone());
    info!("Genotype frequencies: {:?}", genotype_frequencies);

    return Ok(());
}
