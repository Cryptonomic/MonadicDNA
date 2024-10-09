use tfhe::{FheBool, FheUint8};
use serde::Deserialize;


#[derive(Deserialize)]
pub struct ThrombosisResponse {
    pub thrombosis: FheBool,
}

#[derive(Deserialize)]
pub struct FrequenciesResponse {
    pub frequencies: Vec<FheUint8>,
}