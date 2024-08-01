use std::collections::HashMap;
use std::error::Error;
use std::fs;
use reqwest::Client;
use serde_json::Value;
use tfhe::{ConfigBuilder, generate_keys, set_server_key};
use crate::genome_processing;
use crate::zama_compute::{encrypt_genotypes_for_zama, serialize_encrypted_genotypes};

// Work in progress!!
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    let client = Client::new();
    let base_url = "http://localhost:6174";

    let filename = "/Users/vishakh/dev/MonadicDNA/zama-poc/GFGFilteredUnphasedGenotypes23andMe.txt";
    let num_lines = 1000000;

    let config = ConfigBuilder::default().build();
    let (client_key, server_key) = generate_keys(config);
    let server_key_copy1 = server_key.clone();
    set_server_key(server_key);

    let processed_data = genome_processing::process_file(filename, num_lines)?;
    let encrypted_genotypes = encrypt_genotypes_for_zama(&processed_data, client_key.clone())?;
    let mut serialized_data = Vec::new();
    serialize_encrypted_genotypes(&server_key_copy1, &encrypted_genotypes, &mut serialized_data);

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
    println!("GET /thrombosis response: {:?}", res.json::<bool>().await?);

    // GET /frequencies
    let res = client.get(format!("{}/frequencies?user_id={}", base_url, user_id))
        .send()
        .await?;
    let frequencies: HashMap<String, i32> = res.json().await?;
    println!("GET /frequencies response: {:?}", frequencies);

    Ok(())
}
