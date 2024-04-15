#![no_main]
mod common;
use std::collections::HashMap;

use risc0_zkvm::guest::env;
risc0_zkvm::guest::entry!(main);

use common::{GenotypeRisk, Inputs, SnpRaw, SnpRiskMap};
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, Clone)]
pub struct Inputs2 {
    pub data: Vec<u32>,
    pub riskmap: Vec<f64>,
}

fn main() {
    let inputs: Inputs2 = env::read();

    let data_len = inputs.data.len();
    let risky_snps_len = inputs.riskmap.len();
    let mut risk: f32 = 1.0;

    for j in (0..risky_snps_len).step_by(3) {
        let risk_snp = inputs.riskmap[j] as u32;
        let risk_snp_genotype = inputs.riskmap[j + 1] as u32;
        let risk_snp_magnitude = inputs.riskmap[j + 2] as f32;
        for i in (0..data_len).step_by(2) {
            if inputs.data[i] == risk_snp && inputs.data[i + 1] == risk_snp_genotype {
                risk += risk_snp_magnitude as f32;
            }
        }
    }

    env::commit(&risk)
}
