use std::collections::HashMap;
use std::error::Error;
use std::fs;
use reqwest::Client;
use serde_json::Value;


// Work in progress!!
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let client = Client::new();
    let base_url = "http://localhost:6174";
    let user_id = "user123";

    // PUT /dataset
    let data = fs::read("data.bin")?;
    let res = client.put(format!("{}/dataset?user_id={}", base_url, user_id))
        .body(data)
        .send()
        .await?;
    println!("PUT /dataset response: {:?}", res.json::<Value>().await?);

    // GET /dataset
    let res = client.get(format!("{}/dataset?user_id={}", base_url, user_id))
        .send()
        .await?;
    let retrieved_data = res.bytes().await?;
    fs::write("retrieved_data.bin", retrieved_data)?;
    println!("GET /dataset: Data retrieved and saved to retrieved_data.bin");

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
