mod structs;

use std::error::Error;
use reqwest::Client;
use serde_json::Value;

use tfhe::prelude::{FheDecrypt};

use tfhe::{ConfigBuilder, generate_keys, set_server_key};
use zama_poc::genome_processing;
use zama_poc::zama_compute::{encrypt_genotypes_for_zama, serialize_encrypted_genotypes};

use structs::client::{ThrombosisResponse, FrequenciesResponse};

// Work in progress!!
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    let client = Client::new();
    let base_url = "http://localhost:6174";

    let filename = "/Users/vishakh/dev/MonadicDNA/zama-poc/GFGFilteredUnphasedGenotypes23andMe.txt";
    let num_lines = 100;

    println!("Settings up keys..");

    let config = ConfigBuilder::default().build();
    let (client_key, server_key) = generate_keys(config);
    let server_key_copy1 = server_key.clone();
    set_server_key(server_key);

    println!("Preparing data on the client side..");

    let processed_data = genome_processing::process_file(filename, num_lines)?;
    let encrypted_genotypes = encrypt_genotypes_for_zama(&processed_data, client_key.clone())?;
    let mut serialized_data = Vec::new();
    serialize_encrypted_genotypes(&server_key_copy1, &encrypted_genotypes, &mut serialized_data);

    println!("Invoking the server..");

    let user_id = "user123";
    // PUT /dataset
    let res = client.put(format!("{}/dataset?user_id={}", base_url, user_id))
        .body(serialized_data)
        .send()
        .await?;
    println!("PUT /dataset response: {:?}", res.json::<Value>().await?);

    // GET /thrombosis
    let res = client.get(format!("{}/thrombosis?user_id={}", base_url, user_id))
        .send()
        .await?;

    let encoded_result = res.json::<ThrombosisResponse>().await?.thrombosis;
    let thrombosis_response = encoded_result.decrypt(&client_key);

    println!("GET /thrombosis response: {:?}", thrombosis_response);

    // GET /frequencies
    let res = client.get(format!("{}/frequencies?user_id={}", base_url, user_id))
        .send()
        .await?;
    let genotype_frequencies = res.json::<FrequenciesResponse>().await?.frequencies;
    for (i, frequency) in genotype_frequencies.iter().enumerate() {
        let decrypted_frequency:u8 = frequency.decrypt(&client_key);
        println!("GET /frequencies response: {:?}: {:?}", i, decrypted_frequency);
    }

    Ok(())
}
