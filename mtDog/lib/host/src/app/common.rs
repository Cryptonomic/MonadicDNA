use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SnpRaw {
    pub rsid: String,
    pub chromosome: String,
    pub genotype: String,
    pub position: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GenotypeRisk {
    pub genotype: String,
    pub mag: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SnpRiskMap {
    pub snp: String,
    pub risk_weights: Vec<GenotypeRisk>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Inputs {
    pub data: Vec<u32>,
    pub riskmap: Vec<SnpRiskMap>,
}
