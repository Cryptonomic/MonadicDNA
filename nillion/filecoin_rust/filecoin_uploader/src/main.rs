use std::fs::File;
use std::io::Read;
use reqwest::{header, Client, multipart};
use tokio;
use serde::Deserialize;

const CHUNK_SIZE: usize = 110 * 1024;
const FILE_PATH: &str = "src/Combined_Genome.txt";

#[derive(serde::Deserialize)]
struct FilecoinUploadResponse {
    Name: String,
    Hash: String,
    Size: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut file = File::open(FILE_PATH)?;
    let lighthouse_client = Client::new();
    let api_endpoint = "https://node.lighthouse.storage/api/v0/add";
    let api_key = "798df34f.8595261ce777413998f9f80a059a8871"; // Replace with your actual key

    let mut buffer = vec![0u8; CHUNK_SIZE];

    while let Ok(bytes_read) = file.read(&mut buffer) {
        if bytes_read == 0 {
            break;
        }
        let chunk = &buffer[..bytes_read];

        let form = multipart::Form::new()
            .part("file", multipart::Part::bytes(chunk.to_vec()));

        let response = lighthouse_client
            .post(api_endpoint)
            .header(header::AUTHORIZATION, format!("Bearer {}", api_key))
            .multipart(form)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Upload failed: {}", response.status()).into());
        }

        let body = response.bytes().await?;
        let upload_info: FilecoinUploadResponse = serde_json::from_slice(&body)?;
        println!("Chunk uploaded! Name: {}, Hash: {}, Size: {}", upload_info.Name, upload_info.Hash, upload_info.Size);
    }

    // ... (rest of your handling and parsing logic)
    Ok(())
}