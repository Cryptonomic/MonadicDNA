use std::fs::File;
use std::io::{BufRead, BufReader};
use serde_json::{json, Value};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Open the file
    let file = File::open("genome_data.txt")?;
    let reader = BufReader::new(file);

    // Create a vector to store the data
    let mut data: Vec<Value> = Vec::new();

    // Iterate through the file line by line
    for line in reader.lines() {
        let line = line?;

        // Skip the header lines
        if line.starts_with("#") {
            continue;
        }

        // Split the line into fields
        let fields: Vec<&str> = line.split('\t').collect();

        // Create a JSON object for each line
        let obj = json!({
            "rsid": fields[0],
            "chromosome": fields[1],
            "position": fields[2],
            "genotype": fields[3]
        });

        // Add the object to the data vector
        data.push(obj);
    }

    // Create the final JSON object
    let result = json!({
        "genome_data": data
    });

    // Write the JSON to a file
    std::fs::write("genome_data.json", result.to_string())?;

    Ok(())
}