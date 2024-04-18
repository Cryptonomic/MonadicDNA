use crate::app::common::SnpRaw;
use crate::app::diabetes::get_diabetes_risk_map;
use methods::{MTDOG2_GUEST_ELF, MTDOG2_GUEST_ID};
use risc0_zkvm::{default_prover, ExecutorEnv};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};

#[derive(Serialize, Deserialize, Clone)]
pub struct Inputs2 {
    pub data: Vec<u32>,
    pub riskmap: Vec<f64>,
}

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct RiskResults {
    pub score: f32,
    pub risc0_receipt: String,
}

pub fn get_lutted_riskmap(
    _chromosome_dict: HashMap<String, u32>,
    snp_dict: HashMap<String, u32>,
    genotype_dict: HashMap<String, u32>,
) -> Vec<f64> {
    let riskmap = get_diabetes_risk_map().to_vec();
    let mut i: Vec<f64> = Vec::new();
    for r in riskmap.iter() {
        if !snp_dict.contains_key(&r.snp.clone()) {
            println!("Warning: Risky SNP {} not found in dict, ignoring", r.snp)
        } else {
            for g in r.risk_weights.iter() {
                if !genotype_dict.contains_key(&g.genotype.clone()) {
                    println!(
                        "Warning: Risky genotype {} not found in dict, ignoring",
                        g.genotype
                    );
                } else {
                    println!(
                        "Remapping SNP {} with Genotype {}",
                        r.snp.clone(),
                        g.genotype.clone()
                    );
                    i.push(*snp_dict.get(&r.snp.clone()).unwrap() as f64);
                    i.push(*genotype_dict.get(&g.genotype.clone()).unwrap() as f64);
                    i.push(g.mag as f64);
                }
            }
        }
    }
    return i;
}

pub fn load_genome_data(path: &str) -> Result<Vec<SnpRaw>, ()> {
    match File::open(path) {
        Ok(file) => {
            let reader = BufReader::new(file);
            let mut data: Vec<SnpRaw> = Vec::new();
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        if line.starts_with("#") {
                            continue;
                        }

                        let fields: Vec<&str> = line.split('\t').collect();
                        if fields.len() >= 4 {
                            let obj = SnpRaw {
                                rsid: fields[0].trim().to_owned(),
                                chromosome: fields[1].trim().to_owned(),
                                position: fields[2].trim().to_owned(),
                                genotype: fields[3].trim().to_owned(),
                            };
                            data.push(obj);
                        }
                    }
                    Err(_) => {}
                }
            }
            let riskmap = get_diabetes_risk_map().to_vec();
            let risky_snp: Vec<String> = riskmap.iter().map(|r| r.snp.clone()).collect();
            let filtered: Vec<SnpRaw> = data
                .iter()
                .filter(|snp| risky_snp.contains(&snp.rsid))
                .map(|x| x.to_owned())
                .collect();
            println!("Dataset of interest has {} entries.", filtered.len());
            Ok(filtered)
        }
        Err(_) => Err(()),
    }
}

pub fn run_prover(data: Vec<SnpRaw>) -> Result<RiskResults, ()> {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    // tracing_subscriber::fmt()
    //     .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
    //     .init();

    let mut snp_dict: HashMap<String, u32> = HashMap::new();
    let mut chromosome_dict: HashMap<String, u32> = HashMap::new();
    let mut genotype_dict: HashMap<String, u32> = HashMap::new();
    let mut snp_counter: u32 = 0;
    let mut genotype_counter: u32 = 0;
    let mut chromosome_counter: u32 = 0;

    let mut i: Vec<u32> = Vec::new();

    for snp in data.iter() {
        if !snp_dict.contains_key(&snp.rsid.clone()) {
            snp_dict.insert(snp.rsid.clone(), snp_counter);
            snp_counter = snp_counter + 1;
        }
        if !chromosome_dict.contains_key(&snp.chromosome.clone()) {
            chromosome_dict.insert(snp.chromosome.clone(), chromosome_counter);
            chromosome_counter = chromosome_counter + 1;
        }
        if !genotype_dict.contains_key(&snp.genotype.clone()) {
            genotype_dict.insert(snp.genotype.clone(), genotype_counter);
            genotype_counter = genotype_counter + 1;
        }

        i.push(*snp_dict.get(&snp.rsid).unwrap());
        //i.push(*chromosome_dict.get(&snp.chromosome).unwrap());
        i.push(*genotype_dict.get(&snp.genotype).unwrap());
    }

    let lutted_risk = get_lutted_riskmap(chromosome_dict, snp_dict, genotype_dict);
    println!("{:?}", lutted_risk);
    for x in (0..lutted_risk.len()).step_by(3) {
        println!("idx: {} ", x);
        println!(
            "snp: {}, gt: {}, mag: {} ",
            lutted_risk[x],
            lutted_risk[x + 1],
            lutted_risk[x + 2]
        );
    }

    println!("Dataset length : {} ", i.len() / 2);
    // let inputs = Inputs { data: i, riskmap };
    let inputs: Inputs2 = Inputs2 {
        data: i,
        riskmap: lutted_risk,
    };

    //let encoded = serde_json::to_string(&inputs).unwrap();

    let env = ExecutorEnv::builder()
        .write(&inputs)
        .unwrap()
        .build()
        .unwrap();

    // Obtain the default prover.
    let prover = default_prover();

    // Produce a receipt by proving the specified ELF binary.
    let receipt = prover.prove(env, MTDOG2_GUEST_ELF).unwrap();

    let claim = receipt.get_claim().unwrap();

    let claim_str = serde_json::to_string(&claim).unwrap();

    let _output1: f32 = receipt.journal.decode().unwrap();

    println!(
        "Your diabete risk score is : {} (Value above one is at risk)",
        _output1
    );

    println!("Risc0 :{} ", claim_str);
    // The receipt was verified at the end of proving, but the below code is an
    // example of how someone else could verify this receipt.
    receipt.verify(MTDOG2_GUEST_ID).unwrap();

    Ok(RiskResults {
        score: _output1,
        risc0_receipt: claim_str,
    })
}
