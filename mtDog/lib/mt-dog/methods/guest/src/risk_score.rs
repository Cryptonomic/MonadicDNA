use json::parse;
use json_core::Outputs;
use risc0_zkvm::guest::{env, sha};

risc0_zkvm::guest::entry!(main);

fn calculate_risk_score(data: &[(String, u32, i32)]) -> i32 {
    let high_risk_genotypes = vec![9, 5, 9, 4, 0, 7, 4, 0, 9, 9]; // Genotypes associated with higher risk
    let mut risk_score = 0;
    for (_, _, genotype) in data {
        if high_risk_genotypes.contains(genotype) {
            risk_score += 1;
        }
    }
    risk_score
}

pub fn main() {
    let data: String = env::read();
    let data = parse(&data).unwrap();

    // Extract genotype data
    let mut genotype_data = Vec::new();
    for entry in data["genome_data"].members() {
        let rsid = entry["rsid"].as_str().unwrap().to_string();
        let rsid_int = entry["position2"].as_u32().unwrap();
        let genotype = match entry["genotype"].as_str().unwrap() {
            "AA" => 0,
            "AC" => 1,
            "AG" => 2,
            "AT" => 3,
            "CC" => 4,
            "CG" => 5,
            "CT" => 6,
            "GG" => 7,
            "GT" => 8,
            "TT" => 9,
            _ => -1, // Default value for unrecognized genotypes
        };
        genotype_data.push((rsid, rsid_int, genotype));
    }

    // Calculate risk score
    let risk_score = calculate_risk_score(&genotype_data);

    let out = Outputs {
        data: risk_score.to_string(), // Use risk score as the main data
    };
    env::commit(&out);
}