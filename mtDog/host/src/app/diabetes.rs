use crate::app::common::GenotypeRisk;
use crate::app::common::SnpRiskMap;

pub fn get_diabetes_risk_map() -> [SnpRiskMap; 10] {
    return [
        SnpRiskMap {
            snp: "rs4402960".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "GT".to_string(),
                    mag: 2.0,
                },
                GenotypeRisk {
                    genotype: "TT".to_string(),
                    mag: 2.1,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs7754840".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "CC".to_string(),
                    mag: 3.0,
                },
                GenotypeRisk {
                    genotype: "CG".to_string(),
                    mag: 3.0,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs10811661".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "CT".to_string(),
                    mag: 2.0,
                },
                GenotypeRisk {
                    genotype: "TT".to_string(),
                    mag: 2.1,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs9300039".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "AC".to_string(),
                    mag: 2.5, // This is made up, snpedia has no values for this
                },
                GenotypeRisk {
                    genotype: "CC".to_string(),
                    mag: 2.5, // This is made up, snpedia has no values for this
                },
            ],
        },
        SnpRiskMap {
            snp: "rs8050136".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "AA".to_string(),
                    mag: 1.4,
                },
                GenotypeRisk {
                    genotype: "AC".to_string(),
                    mag: 1.2,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs1801282".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "CG".to_string(),
                    mag: 3.0,
                },
                GenotypeRisk {
                    genotype: "GG".to_string(),
                    mag: 3.0,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs13266634".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "CC".to_string(),
                    mag: 3.0,
                },
                GenotypeRisk {
                    genotype: "CT".to_string(),
                    mag: 2.5,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs1111875".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "AG".to_string(),
                    mag: 2.0, // This is made up, snpedia has no values for this
                },
                GenotypeRisk {
                    genotype: "GG".to_string(),
                    mag: 2.0, // This is made up, snpedia has no values for this
                },
            ],
        },
        SnpRiskMap {
            snp: "rs7903146".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "CT".to_string(),
                    mag: 2.1,
                },
                GenotypeRisk {
                    genotype: "TT".to_string(),
                    mag: 3.5,
                },
            ],
        },
        SnpRiskMap {
            snp: "rs5219".to_string(),
            risk_weights: vec![
                GenotypeRisk {
                    genotype: "CT".to_string(),
                    mag: 1.5,
                },
                GenotypeRisk {
                    genotype: "TT".to_string(),
                    mag: 2.5,
                },
            ],
        },
    ];
}
